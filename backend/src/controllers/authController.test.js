import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { forgotPassword } from './authController.js';
import User from '../models/User.js';
import * as emailModule from '../lib/email.js';
import crypto from 'crypto';

// Mock dependencies
vi.mock('../models/User.js');
vi.mock('../lib/email.js', async () => {
  const actual = await vi.importActual('../lib/email.js');
  return {
    ...actual,
    sendEmail: vi.fn(),
  };
});

describe('forgotPassword integration tests', () => {
  let req, res;
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    save: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {},
    };
    
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Mock environment
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Email sending for valid user', () => {
    it('should send email when user exists', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true, messageId: 'msg123' });

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockUser.save).toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'If an account exists with this email, you will receive a password reset link',
        })
      );
    });

    it('should send email with correct user data', async () => {
      // Arrange
      req.body.email = 'john@example.com';
      const johnUser = {
        ...mockUser,
        name: 'John Doe',
        email: 'john@example.com',
        save: vi.fn(),
      };
      User.findOne.mockResolvedValue(johnUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
        })
      );

      const emailCall = emailModule.sendEmail.mock.calls[0][0];
      expect(emailCall.subject).toBe('Reset Your Password - Talent IQ');
      expect(emailCall.html).toContain('John Doe');
      expect(emailCall.text).toContain('John Doe');
    });

    it('should save hashed token and expiry to database', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.resetPasswordToken).toBeTruthy();
      expect(mockUser.resetPasswordToken).toHaveLength(64); // SHA256 hex hash length
      expect(mockUser.resetPasswordExpires).toBeGreaterThan(Date.now());
      expect(mockUser.resetPasswordExpires).toBeLessThanOrEqual(Date.now() + 3600000);
    });
  });

  describe('Email contains correct reset URL', () => {
    it('should include reset URL in email with valid token', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act
      await forgotPassword(req, res);

      // Assert
      const emailCall = emailModule.sendEmail.mock.calls[0][0];
      
      // Extract reset URL from email - use more flexible regex
      const urlMatch = emailCall.html.match(/http:\/\/[^\/]+\/reset-password\/([a-f0-9]+)/);
      expect(urlMatch).toBeTruthy();
      
      const resetToken = urlMatch[1];
      expect(resetToken).toHaveLength(64); // 32 bytes as hex = 64 chars
      
      // Verify URL contains reset-password path and token
      expect(emailCall.html).toContain(`/reset-password/${resetToken}`);
      expect(emailCall.text).toContain(`/reset-password/${resetToken}`);
    });

    it('should include expiration time in email', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act
      await forgotPassword(req, res);

      // Assert
      const emailCall = emailModule.sendEmail.mock.calls[0][0];
      expect(emailCall.html).toContain('1 hour');
      expect(emailCall.text).toContain('1 hour');
    });

    it('should generate unique tokens for multiple requests', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act - Make two requests
      await forgotPassword(req, res);
      const firstToken = mockUser.resetPasswordToken;
      
      mockUser.resetPasswordToken = null;
      await forgotPassword(req, res);
      const secondToken = mockUser.resetPasswordToken;

      // Assert
      expect(firstToken).not.toBe(secondToken);
      expect(firstToken).toHaveLength(64);
      expect(secondToken).toHaveLength(64);
    });
  });

  describe('Email not sent for invalid user', () => {
    it('should not send email when user does not exist', async () => {
      // Arrange
      req.body.email = 'nonexistent@example.com';
      User.findOne.mockResolvedValue(null);

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(emailModule.sendEmail).not.toHaveBeenCalled();
    });

    it('should return same response for non-existent user (security)', async () => {
      // Arrange
      const validEmail = 'valid@example.com';
      const invalidEmail = 'invalid@example.com';

      // Act - Valid user
      req.body.email = validEmail;
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });
      await forgotPassword(req, res);
      
      const validUserResponse = res.json.mock.calls[0][0];

      // Reset mocks
      vi.clearAllMocks();
      res.status = vi.fn().mockReturnThis();
      res.json = vi.fn().mockReturnThis();

      // Act - Invalid user
      req.body.email = invalidEmail;
      User.findOne.mockResolvedValue(null);
      await forgotPassword(req, res);
      
      const invalidUserResponse = res.json.mock.calls[0][0];

      // Assert - Both responses should have same message
      expect(validUserResponse.message).toBe(invalidUserResponse.message);
      expect(validUserResponse.message).toBe(
        'If an account exists with this email, you will receive a password reset link'
      );
      
      // Both should return 200 status
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should not expose user existence through response', async () => {
      // Arrange
      req.body.email = 'unknown@example.com';
      User.findOne.mockResolvedValue(null);

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'If an account exists with this email, you will receive a password reset link',
      });
      
      // Should not include any indication that user doesn't exist
      const response = res.json.mock.calls[0][0];
      expect(response.message).not.toContain('not found');
      expect(response.message).not.toContain('does not exist');
      expect(response.message).not.toContain('invalid');
    });
  });

  describe('Email sending failure handling', () => {
    it('should not break flow when email sending fails', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockRejectedValue(new Error('SMTP connection failed'));

      // Act
      await forgotPassword(req, res);

      // Assert - Should still return success response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'If an account exists with this email, you will receive a password reset link',
        })
      );
      
      // Token should still be saved
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.resetPasswordToken).toBeTruthy();
    });

    it('should return success response when email fails', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: false, error: 'Network error' });

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'If an account exists with this email, you will receive a password reset link',
        })
      );
    });

    it('should not expose email error to user', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      const emailError = new Error('SMTP authentication failed');
      emailModule.sendEmail.mockRejectedValue(emailError);

      // Act
      await forgotPassword(req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.message).not.toContain('SMTP');
      expect(response.message).not.toContain('failed');
      expect(response.message).not.toContain('error');
      expect(response.error).toBeUndefined();
    });

    it('should handle email timeout gracefully', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      req.body = {};

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
      expect(User.findOne).not.toHaveBeenCalled();
      expect(emailModule.sendEmail).not.toHaveBeenCalled();
    });

    it('should return 400 when email is empty string', async () => {
      // Arrange
      req.body.email = '';

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });
  });

  describe('Token security', () => {
    it('should hash token before storing in database', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Spy on crypto to capture the raw token
      const cryptoSpy = vi.spyOn(crypto, 'randomBytes');

      // Act
      await forgotPassword(req, res);

      // Assert
      expect(cryptoSpy).toHaveBeenCalledWith(32);
      
      // The token in email should be different from the hashed token in DB
      const emailCall = emailModule.sendEmail.mock.calls[0][0];
      const urlMatch = emailCall.html.match(/reset-password\/([a-f0-9]+)/);
      const tokenInEmail = urlMatch[1];
      
      // Hash the token from email
      const hashedToken = crypto.createHash('sha256').update(tokenInEmail).digest('hex');
      
      // Should match what's stored in DB
      expect(mockUser.resetPasswordToken).toBe(hashedToken);
    });

    it('should set expiry to 1 hour from now', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      const now = Date.now();
      User.findOne.mockResolvedValue(mockUser);
      emailModule.sendEmail.mockResolvedValue({ success: true });

      // Act
      await forgotPassword(req, res);

      // Assert
      const expectedExpiry = now + 3600000; // 1 hour in ms
      const actualExpiry = mockUser.resetPasswordExpires;
      
      // Allow 1 second tolerance for test execution time
      expect(actualExpiry).toBeGreaterThanOrEqual(now);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });
});
