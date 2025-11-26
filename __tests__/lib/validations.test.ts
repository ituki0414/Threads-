import {
  createPostSchema,
  createAutoReplyRuleSchema,
  sanitizeHtml,
  formatValidationErrors,
} from '@/lib/validations';

describe('Validations', () => {
  describe('sanitizeHtml', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('should escape special characters', () => {
      expect(sanitizeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#x27;');
    });

    it('should trim whitespace', () => {
      expect(sanitizeHtml('  hello  ')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should remove control characters', () => {
      expect(sanitizeHtml('hello\x00world')).toBe('helloworld');
    });
  });

  describe('createPostSchema', () => {
    it('should validate a valid post', () => {
      const result = createPostSchema.safeParse({
        caption: 'Hello world',
        media: [],
        publish_now: false,
      });
      expect(result.success).toBe(true);
    });

    it('should reject caption over 500 characters', () => {
      const result = createPostSchema.safeParse({
        caption: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid media URLs', () => {
      const result = createPostSchema.safeParse({
        caption: 'Hello',
        media: ['not-a-url'],
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid media URLs', () => {
      const result = createPostSchema.safeParse({
        caption: 'Hello',
        media: ['https://example.com/image.jpg'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject more than 10 media items', () => {
      const result = createPostSchema.safeParse({
        caption: 'Hello',
        media: Array(11).fill('https://example.com/image.jpg'),
      });
      expect(result.success).toBe(false);
    });

    it('should sanitize HTML in caption', () => {
      const result = createPostSchema.safeParse({
        caption: '<script>alert("xss")</script>Hello',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.caption).toBe('Hello');
      }
    });
  });

  describe('createAutoReplyRuleSchema', () => {
    it('should validate a valid rule', () => {
      const result = createAutoReplyRuleSchema.safeParse({
        name: 'Test Rule',
        trigger_type: 'comment',
        reply_template: 'Thank you!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createAutoReplyRuleSchema.safeParse({
        name: '',
        trigger_type: 'comment',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const result = createAutoReplyRuleSchema.safeParse({
        name: 'a'.repeat(101),
        trigger_type: 'comment',
      });
      expect(result.success).toBe(false);
    });

    it('should default is_active to true', () => {
      const result = createAutoReplyRuleSchema.safeParse({
        name: 'Test Rule',
        trigger_type: 'comment',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(true);
      }
    });
  });

  describe('formatValidationErrors', () => {
    it('should format zod errors correctly', () => {
      const result = createPostSchema.safeParse({
        caption: 'a'.repeat(501),
      });
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toContain('caption');
        expect(formatted).toContain('500');
      }
    });
  });
});
