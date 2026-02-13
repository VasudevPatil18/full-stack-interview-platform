import { describe, it, expect } from 'vitest';
import { emailTemplates } from './email.js';

describe('passwordReset email template', () => {
  describe('HTML generation', () => {
    it('should generate valid HTML with all required elements', () => {
      const result = emailTemplates.passwordReset({
        userName: 'John Doe',
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      // Check subject
      expect(result.subject).toBe('Reset Your Password - Talent IQ');

      // Check HTML structure
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html>');
      expect(result.html).toContain('</html>');

      // Check required elements
      expect(result.html).toContain('Password Reset Request');
      expect(result.html).toContain('Hi John Doe!');
      expect(result.html).toContain('https://example.com/reset/abc123');
      expect(result.html).toContain('Reset Your Password');
      expect(result.html).toContain('1 hour');
      expect(result.html).toContain('This link can only be used once');
      
      // Check button link
      expect(result.html).toContain('href="https://example.com/reset/abc123"');
      expect(result.html).toContain('class="button"');
      
      // Check warning box
      expect(result.html).toContain('class="warning"');
      
      // Check footer
      expect(result.html).toContain('© 2024 Talent IQ');
    });

    it('should include reset button with correct styling', () => {
      const result = emailTemplates.passwordReset({
        userName: 'Jane Smith',
        resetUrl: 'https://example.com/reset/xyz789',
        expiresIn: '1 hour',
      });

      // Check button exists with proper attributes
      expect(result.html).toMatch(/<a[^>]*href="https:\/\/example\.com\/reset\/xyz789"[^>]*class="button"[^>]*>Reset Your Password<\/a>/);
    });

    it('should include plain text link for accessibility', () => {
      const result = emailTemplates.passwordReset({
        userName: 'Test User',
        resetUrl: 'https://example.com/reset/test123',
        expiresIn: '1 hour',
      });

      // Check that the URL appears as plain text (not just in href)
      const plainTextLinkPattern = /If the button doesn't work.*https:\/\/example\.com\/reset\/test123/s;
      expect(result.html).toMatch(plainTextLinkPattern);
    });

    it('should include expiration warning', () => {
      const result = emailTemplates.passwordReset({
        userName: 'User',
        resetUrl: 'https://example.com/reset/token',
        expiresIn: '2 hours',
      });

      expect(result.html).toContain('This link will expire in 2 hours');
      expect(result.html).toContain('This link can only be used once');
    });

    it('should include security notice about ignoring email', () => {
      const result = emailTemplates.passwordReset({
        userName: 'User',
        resetUrl: 'https://example.com/reset/token',
        expiresIn: '1 hour',
      });

      expect(result.html).toContain("If you didn't request a password reset");
      expect(result.html).toContain('you can safely ignore this email');
    });
  });

  describe('Plain text version', () => {
    it('should generate plain text version with all required information', () => {
      const result = emailTemplates.passwordReset({
        userName: 'John Doe',
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      // Check plain text content
      expect(result.text).toContain('Password Reset Request');
      expect(result.text).toContain('Hi John Doe');
      expect(result.text).toContain('https://example.com/reset/abc123');
      expect(result.text).toContain('1 hour');
      expect(result.text).toContain('can only be used once');
      expect(result.text).toContain('© 2024 Talent IQ');
    });

    it('should be readable without HTML formatting', () => {
      const result = emailTemplates.passwordReset({
        userName: 'Test User',
        resetUrl: 'https://example.com/reset/test',
        expiresIn: '1 hour',
      });

      // Plain text should not contain HTML tags
      expect(result.text).not.toContain('<');
      expect(result.text).not.toContain('>');
      expect(result.text).not.toContain('<!DOCTYPE');
    });
  });

  describe('Missing userName handling', () => {
    it('should handle missing userName gracefully in HTML', () => {
      const result = emailTemplates.passwordReset({
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      // Should use fallback greeting
      expect(result.html).toContain('Hi there!');
      expect(result.html).not.toContain('Hi undefined');
      expect(result.html).not.toContain('Hi null');
    });

    it('should handle missing userName gracefully in plain text', () => {
      const result = emailTemplates.passwordReset({
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      // Should use fallback greeting
      expect(result.text).toContain('Hi there');
      expect(result.text).not.toContain('undefined');
      expect(result.text).not.toContain('null');
    });

    it('should handle null userName gracefully', () => {
      const result = emailTemplates.passwordReset({
        userName: null,
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      expect(result.html).toContain('Hi there!');
      expect(result.text).toContain('Hi there');
    });

    it('should handle empty string userName gracefully', () => {
      const result = emailTemplates.passwordReset({
        userName: '',
        resetUrl: 'https://example.com/reset/abc123',
        expiresIn: '1 hour',
      });

      expect(result.html).toContain('Hi there!');
      expect(result.text).toContain('Hi there');
    });
  });

  describe('Template structure', () => {
    it('should return object with subject, html, and text properties', () => {
      const result = emailTemplates.passwordReset({
        userName: 'Test',
        resetUrl: 'https://example.com/reset/test',
        expiresIn: '1 hour',
      });

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(typeof result.subject).toBe('string');
      expect(typeof result.html).toBe('string');
      expect(typeof result.text).toBe('string');
    });

    it('should have consistent styling with other email templates', () => {
      const result = emailTemplates.passwordReset({
        userName: 'Test',
        resetUrl: 'https://example.com/reset/test',
        expiresIn: '1 hour',
      });

      // Check for consistent styling elements
      expect(result.html).toContain('font-family: Arial, sans-serif');
      expect(result.html).toContain('max-width: 600px');
      expect(result.html).toContain('background: linear-gradient');
      expect(result.html).toContain('border-radius');
    });
  });

  describe('Parameter validation', () => {
    it('should include all provided parameters in the output', () => {
      const params = {
        userName: 'Alice Johnson',
        resetUrl: 'https://example.com/reset/unique-token-123',
        expiresIn: '30 minutes',
      };

      const result = emailTemplates.passwordReset(params);

      expect(result.html).toContain(params.userName);
      expect(result.html).toContain(params.resetUrl);
      expect(result.html).toContain(params.expiresIn);
      expect(result.text).toContain(params.userName);
      expect(result.text).toContain(params.resetUrl);
      expect(result.text).toContain(params.expiresIn);
    });

    it('should handle different expiration time formats', () => {
      const result1 = emailTemplates.passwordReset({
        userName: 'User',
        resetUrl: 'https://example.com/reset/token',
        expiresIn: '1 hour',
      });

      const result2 = emailTemplates.passwordReset({
        userName: 'User',
        resetUrl: 'https://example.com/reset/token',
        expiresIn: '60 minutes',
      });

      expect(result1.html).toContain('1 hour');
      expect(result2.html).toContain('60 minutes');
    });
  });
});
