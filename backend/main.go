package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

// OTPStore storage (in memory for demonstration)
type OTPStore struct {
	otps  map[string]string
	mutex sync.RWMutex
}

func NewOTPStore() *OTPStore {
	return &OTPStore{
		otps: make(map[string]string),
	}
}

func (s *OTPStore) Set(phone, otp string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.otps[phone] = otp
}

func (s *OTPStore) Get(phone string) (string, bool) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	otp, exists := s.otps[phone]
	return otp, exists
}

func (s *OTPStore) Delete(phone string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	delete(s.otps, phone)
}

// Session storage (in memory for demonstration)
type SessionStore struct {
	sessions map[string]bool
	mutex    sync.RWMutex
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		sessions: make(map[string]bool),
	}
}

func (s *SessionStore) Create(phone string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.sessions[phone] = true
}

func (s *SessionStore) Exists(phone string) bool {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	_, exists := s.sessions[phone]
	return exists
}

func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	otp := rand.Intn(900000) + 100000
	return string([]byte{
		byte(otp/100000) + '0',
		byte((otp/10000)%10) + '0',
		byte((otp/1000)%10) + '0',
		byte((otp/100)%10) + '0',
		byte((otp/10)%10) + '0',
		byte(otp%10) + '0',
	})
}

func main() {
	// Directly use Twilio credentials
	accountSid := "AC60a75aec26a3c7372a13c445a61616c6"
	authToken := "ddcebb468abac23089c73dbc90591d55"
	twilioPhoneNumber := "+918178075050"

	twilioClient := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	// Initialize stores
	otpStore := NewOTPStore()
	sessionStore := NewSessionStore()

	// Initialize Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	router.POST("/api/send-otp", func(c *gin.Context) {
		var req struct {
			PhoneNumber string `json:"phoneNumber" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		otp := generateOTP()
		otpStore.Set(req.PhoneNumber, otp)

		params := &twilioApi.CreateMessageParams{}
		params.SetTo(req.PhoneNumber)
		params.SetFrom(twilioPhoneNumber)
		params.SetBody("Your verification code is: " + otp)

		_, err := twilioClient.Api.CreateMessage(params)
		if err != nil {
			log.Printf("Error sending SMS: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to send OTP",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "OTP sent successfully",
			"success": true,
		})
	})

	router.POST("/api/verify-otp", func(c *gin.Context) {
		var req struct {
			PhoneNumber string `json:"phoneNumber" binding:"required"`
			OTP         string `json:"otp" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		storedOTP, exists := otpStore.Get(req.PhoneNumber)
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No OTP found for this phone number"})
			return
		}

		if storedOTP != req.OTP {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OTP"})
			return
		}

		sessionStore.Create(req.PhoneNumber)
		otpStore.Delete(req.PhoneNumber)

		c.JSON(http.StatusOK, gin.H{
			"message": "OTP verified successfully",
			"success": true,
		})
	})

	router.GET("/api/check-auth", func(c *gin.Context) {
		phoneNumber := c.Query("phoneNumber")
		if phoneNumber == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number is required"})
			return
		}

		isAuthenticated := sessionStore.Exists(phoneNumber)
		c.JSON(http.StatusOK, gin.H{
			"isAuthenticated": isAuthenticated,
		})
	})

	port := os.Getenv("GO_SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
