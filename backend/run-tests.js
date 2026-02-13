import { emailTemplates } from './src/lib/email.js';

console.log('Running email template tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected "${expected}" but got "${value}"`);
      }
    },
    toContain(expected) {
      if (!value.includes(expected)) {
        throw new Error(`Expected value to contain "${expected}"`);
      }
    },
    not: {
      toContain(expected) {
        if (value.includes(expected)) {
          throw new Error(`Expected value not to contain "${expected}"`);
        }
      }
    },
    toHaveProperty(prop) {
      if (!(prop in value)) {
        throw new Error(`Expected object to have property "${prop}"`);
      }
    },
    toMatch(regex) {
      if (!regex.test(value)) {
        throw new Error(`Expected value to match ${regex}`);
      }
    }
  };
}

// Test 1: Generate valid HTML with all required elements
test('should generate valid HTML with all required elements', () => {
  const result = emailTemplates.passwordReset({
    userName: 'John Doe',
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.subject).toBe('Reset Your Password - Talent IQ');
  expect(result.html).toContain('<!DOCTYPE html>');
  expect(result.html).toContain('<html>');
  expect(result.html).toContain('</html>');
  expect(result.html).toContain('Password Reset Request');
  expect(result.html).toContain('Hi John Doe!');
  expect(result.html).toContain('https://example.com/reset/abc123');
  expect(result.html).toContain('Reset Your Password');
  expect(result.html).toContain('1 hour');
  expect(result.html).toContain('This link can only be used once');
  expect(result.html).toContain('href="https://example.com/reset/abc123"');
  expect(result.html).toContain('class="button"');
  expect(result.html).toContain('class="warning"');
  expect(result.html).toContain('© 2024 Talent IQ');
});

// Test 2: Include reset button with correct styling
test('should include reset button with correct styling', () => {
  const result = emailTemplates.passwordReset({
    userName: 'Jane Smith',
    resetUrl: 'https://example.com/reset/xyz789',
    expiresIn: '1 hour',
  });

  expect(result.html).toMatch(/<a[^>]*href="https:\/\/example\.com\/reset\/xyz789"[^>]*class="button"[^>]*>Reset Your Password<\/a>/);
});

// Test 3: Include plain text link for accessibility
test('should include plain text link for accessibility', () => {
  const result = emailTemplates.passwordReset({
    userName: 'Test User',
    resetUrl: 'https://example.com/reset/test123',
    expiresIn: '1 hour',
  });

  const plainTextLinkPattern = /If the button doesn't work.*https:\/\/example\.com\/reset\/test123/s;
  expect(result.html).toMatch(plainTextLinkPattern);
});

// Test 4: Include expiration warning
test('should include expiration warning', () => {
  const result = emailTemplates.passwordReset({
    userName: 'User',
    resetUrl: 'https://example.com/reset/token',
    expiresIn: '2 hours',
  });

  expect(result.html).toContain('This link will expire in 2 hours');
  expect(result.html).toContain('This link can only be used once');
});

// Test 5: Include security notice
test('should include security notice about ignoring email', () => {
  const result = emailTemplates.passwordReset({
    userName: 'User',
    resetUrl: 'https://example.com/reset/token',
    expiresIn: '1 hour',
  });

  expect(result.html).toContain("If you didn't request a password reset");
  expect(result.html).toContain('you can safely ignore this email');
});

// Test 6: Generate plain text version
test('should generate plain text version with all required information', () => {
  const result = emailTemplates.passwordReset({
    userName: 'John Doe',
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.text).toContain('Password Reset Request');
  expect(result.text).toContain('Hi John Doe');
  expect(result.text).toContain('https://example.com/reset/abc123');
  expect(result.text).toContain('1 hour');
  expect(result.text).toContain('can only be used once');
  expect(result.text).toContain('© 2024 Talent IQ');
});

// Test 7: Plain text should be readable without HTML
test('should be readable without HTML formatting', () => {
  const result = emailTemplates.passwordReset({
    userName: 'Test User',
    resetUrl: 'https://example.com/reset/test',
    expiresIn: '1 hour',
  });

  expect(result.text).not.toContain('<');
  expect(result.text).not.toContain('>');
  expect(result.text).not.toContain('<!DOCTYPE');
});

// Test 8: Handle missing userName in HTML
test('should handle missing userName gracefully in HTML', () => {
  const result = emailTemplates.passwordReset({
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.html).toContain('Hi there!');
  expect(result.html).not.toContain('Hi undefined');
  expect(result.html).not.toContain('Hi null');
});

// Test 9: Handle missing userName in plain text
test('should handle missing userName gracefully in plain text', () => {
  const result = emailTemplates.passwordReset({
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.text).toContain('Hi there');
  expect(result.text).not.toContain('undefined');
  expect(result.text).not.toContain('null');
});

// Test 10: Handle null userName
test('should handle null userName gracefully', () => {
  const result = emailTemplates.passwordReset({
    userName: null,
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.html).toContain('Hi there!');
  expect(result.text).toContain('Hi there');
});

// Test 11: Handle empty string userName
test('should handle empty string userName gracefully', () => {
  const result = emailTemplates.passwordReset({
    userName: '',
    resetUrl: 'https://example.com/reset/abc123',
    expiresIn: '1 hour',
  });

  expect(result.html).toContain('Hi there!');
  expect(result.text).toContain('Hi there');
});

// Test 12: Return object with correct properties
test('should return object with subject, html, and text properties', () => {
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

// Test 13: Consistent styling
test('should have consistent styling with other email templates', () => {
  const result = emailTemplates.passwordReset({
    userName: 'Test',
    resetUrl: 'https://example.com/reset/test',
    expiresIn: '1 hour',
  });

  expect(result.html).toContain('font-family: Arial, sans-serif');
  expect(result.html).toContain('max-width: 600px');
  expect(result.html).toContain('background: linear-gradient');
  expect(result.html).toContain('border-radius');
});

// Test 14: Include all provided parameters
test('should include all provided parameters in the output', () => {
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

// Test 15: Handle different expiration time formats
test('should handle different expiration time formats', () => {
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

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
}
