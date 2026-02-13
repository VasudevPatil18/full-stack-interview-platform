import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { forgotPassword } from './authController.js';
import User from '../models/User.js';
import * as emailModule from '../lib/email.js';
import * as fc from 'fast-check';

// Mock dependencies
vi.mock('../models/User.js');
vi.mock('../lib/email.js', async () => {
  const actual = await vi.importActual('../lib/email.js');
  return {
    ...actual,
    sendEmail: vi.fn(),
  };
});

// Mock ENV to control CLIENT_URL
vi.mock('../lib/env.js', () => ({
  ENV: {
    CLIENT_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
  },
}));

describe('forgotPassword - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * Property: Email Sending Reliability
   * 
   * For any valid user with a registered email address, when a password reset
   * is requested, the system must:
   * 1. Attempt to send an email to the user's registered email address
   * 2. Include a properly formatted reset URL in the email
   * 3. The reset URL must contain a valid token (64 hex characters)
   * 4. The reset URL must follow the pattern: {CLIENT_URL}/reset-password/{token}
   */
  it('should reliably send emails with properly formatted reset URLs for all valid users', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid user data
        fc.record({
          _id: fc.string({ minLength: 24, maxLength: 24 }),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          resetPasswordToken: fc.constant(null),
          resetPasswordExpires: fc.constant(null),
        }),
        async (userData) => {
          // Clear mocks for each property test run
          vi.clearAllMocks();
          
          // Setup mock user with save method
          const mockUser = {
            ...userData,
            save: vi.fn().mockResolvedValue(true),
          };

          // Setup mocks
          User.findOne.mockResolvedValue(mockUser);
          emailModule.sendEmail.mockResolvedValue({ success: true, messageId: 'test-msg-id' });

          // Create request and response objects
          const req = {
            body: { email: userData.email },
          };

          const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
          };

          // Execute the password reset request
          await forgotPassword(req, res);

          // Property 1: Email sending must be attempted for valid users
          expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);

          // Property 2: Email must be sent to the user's registered email
          const emailCall = emailModule.sendEmail.mock.calls[0][0];
          expect(emailCall.to).toBe(userData.email);

          // Property 3: Email must contain a reset URL
          expect(emailCall.html).toBeDefined();
          expect(emailCall.text).toBeDefined();

          // Property 4: Reset URL must be properly formatted
          // Extract URL from HTML email
          const urlMatch = emailCall.html.match(/http:\/\/[^\/]+\/reset-password\/([a-f0-9]+)/);
          expect(urlMatch).toBeTruthy();

          const resetToken = urlMatch[1];

          // Property 5: Token must be exactly 64 hex characters (32 bytes as hex)
          expect(resetToken).toMatch(/^[a-f0-9]{64}$/);

          // Property 6: Reset URL must follow the correct pattern
          const expectedUrlPattern = `http://localhost:3000/reset-password/${resetToken}`;
          expect(emailCall.html).toContain(expectedUrlPattern);
          expect(emailCall.text).toContain(expectedUrlPattern);

          // Property 7: User data must be saved with hashed token
          expect(mockUser.save).toHaveBeenCalled();
          expect(mockUser.resetPasswordToken).toBeTruthy();
          expect(mockUser.resetPasswordToken).toHaveLength(64);
          expect(mockUser.resetPasswordExpires).toBeGreaterThan(Date.now());
        }
      ),
      {
        numRuns: 100, // Run 100 random test cases
        endOnFailure: true,
      }
    );
  });
});
