import {
  validateMagicBytes,
  sanitizeFileName,
  generateSecureFilePath,
  validateFileSize,
  validatePathOwnership,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
} from '@/lib/media-security';

describe('media-security', () => {
  describe('validateMagicBytes', () => {
    it('should validate JPEG magic bytes', () => {
      const jpegBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]).buffer;
      const result = validateMagicBytes(jpegBuffer, 'image/jpeg');
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/jpeg');
    });

    it('should validate PNG magic bytes', () => {
      const pngBuffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]).buffer;
      const result = validateMagicBytes(pngBuffer, 'image/png');
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/png');
    });

    it('should validate GIF87a magic bytes', () => {
      const gifBuffer = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).buffer;
      const result = validateMagicBytes(gifBuffer, 'image/gif');
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/gif');
    });

    it('should validate GIF89a magic bytes', () => {
      const gifBuffer = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).buffer;
      const result = validateMagicBytes(gifBuffer, 'image/gif');
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/gif');
    });

    it('should validate WebP magic bytes', () => {
      // RIFF....WEBP
      const webpBuffer = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]).buffer;
      const result = validateMagicBytes(webpBuffer, 'image/webp');
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/webp');
    });

    it('should reject mismatched type declaration', () => {
      const jpegBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]).buffer;
      const result = validateMagicBytes(jpegBuffer, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should reject disallowed file types', () => {
      const buffer = new Uint8Array(12).buffer;
      const result = validateMagicBytes(buffer, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files that are too small', () => {
      const tinyBuffer = new Uint8Array(5).buffer;
      const result = validateMagicBytes(tinyBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File too small to validate');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove path separators', () => {
      expect(sanitizeFileName('../../../etc/passwd')).toBe('etc_passwd');
      expect(sanitizeFileName('folder/file.jpg')).toBe('folder_file.jpg');
      expect(sanitizeFileName('folder\\file.jpg')).toBe('folder_file.jpg');
    });

    it('should remove leading dots', () => {
      expect(sanitizeFileName('.hidden')).toBe('hidden');
      expect(sanitizeFileName('...multiple')).toBe('multiple');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeFileName('file<script>.jpg')).toBe('file_script_.jpg');
      expect(sanitizeFileName('file:name.jpg')).toBe('file_name.jpg');
      expect(sanitizeFileName('file|name.jpg')).toBe('file_name.jpg');
    });

    it('should collapse multiple underscores', () => {
      expect(sanitizeFileName('file___name.jpg')).toBe('file_name.jpg');
    });

    it('should return default name for empty input', () => {
      expect(sanitizeFileName('')).toBe('file');
      expect(sanitizeFileName('...')).toBe('file');
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300) + '.jpg';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(200);
      expect(result.endsWith('.jpg')).toBe(true);
    });
  });

  describe('generateSecureFilePath', () => {
    it('should generate path with account ID prefix', () => {
      const path = generateSecureFilePath('acc123', 'photo.jpg', 'image/jpeg');
      expect(path.startsWith('acc123/')).toBe(true);
    });

    it('should include timestamp in path', () => {
      const before = Date.now();
      const path = generateSecureFilePath('acc123', 'photo.jpg', 'image/jpeg');
      const after = Date.now();

      // Extract timestamp from path
      const parts = path.split('/')[1].split('_');
      const timestamp = parseInt(parts[0], 10);

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should normalize extension based on MIME type', () => {
      expect(generateSecureFilePath('acc', 'file.jpeg', 'image/jpeg')).toMatch(/\.jpg$/);
      expect(generateSecureFilePath('acc', 'file.PNG', 'image/png')).toMatch(/\.png$/);
      expect(generateSecureFilePath('acc', 'file.MOV', 'video/quicktime')).toMatch(/\.mov$/);
    });

    it('should sanitize dangerous filenames', () => {
      const path = generateSecureFilePath('acc', '../../../etc/passwd', 'image/jpeg');
      expect(path).not.toContain('..');
      expect(path.startsWith('acc/')).toBe(true);
    });
  });

  describe('validateFileSize', () => {
    it('should accept images under 10MB', () => {
      const result = validateFileSize(5 * 1024 * 1024, 'image/jpeg');
      expect(result.valid).toBe(true);
    });

    it('should reject images over 10MB', () => {
      const result = validateFileSize(15 * 1024 * 1024, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    it('should accept videos under 100MB', () => {
      const result = validateFileSize(50 * 1024 * 1024, 'video/mp4');
      expect(result.valid).toBe(true);
    });

    it('should reject videos over 100MB', () => {
      const result = validateFileSize(150 * 1024 * 1024, 'video/mp4');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('100MB');
    });
  });

  describe('validatePathOwnership', () => {
    it('should accept paths owned by account', () => {
      const result = validatePathOwnership('acc123/file.jpg', 'acc123');
      expect(result.valid).toBe(true);
    });

    it('should reject paths not owned by account', () => {
      const result = validatePathOwnership('other/file.jpg', 'acc123');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('should reject path traversal attempts', () => {
      expect(validatePathOwnership('../acc123/file.jpg', 'acc123').valid).toBe(false);
      expect(validatePathOwnership('acc123/../other/file.jpg', 'acc123').valid).toBe(false);
      expect(validatePathOwnership('//acc123/file.jpg', 'acc123').valid).toBe(false);
      expect(validatePathOwnership('/acc123/file.jpg', 'acc123').valid).toBe(false);
    });

    it('should reject invalid paths', () => {
      expect(validatePathOwnership('', 'acc123').valid).toBe(false);
      expect(validatePathOwnership(null as unknown as string, 'acc123').valid).toBe(false);
    });
  });

  describe('ALLOWED_MIME_TYPES', () => {
    it('should include common image types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/gif');
      expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    });

    it('should include common video types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('video/mp4');
      expect(ALLOWED_MIME_TYPES).toContain('video/quicktime');
    });

    it('should not include dangerous types', () => {
      expect(ALLOWED_MIME_TYPES).not.toContain('application/javascript');
      expect(ALLOWED_MIME_TYPES).not.toContain('text/html');
      expect(ALLOWED_MIME_TYPES).not.toContain('application/x-php');
    });
  });

  describe('FILE_SIZE_LIMITS', () => {
    it('should have correct limits', () => {
      expect(FILE_SIZE_LIMITS.image).toBe(10 * 1024 * 1024);
      expect(FILE_SIZE_LIMITS.video).toBe(100 * 1024 * 1024);
    });
  });
});
