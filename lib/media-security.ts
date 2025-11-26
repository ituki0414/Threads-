/**
 * メディアアップロードのセキュリティユーティリティ
 * - マジックバイト検証（MIMEタイプ偽装対策）
 * - レートリミット
 * - ファイル名サニタイズ
 */

import { cache, createCacheKey } from './cache';

// ファイルタイプとマジックバイトの対応
const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  'image/jpeg': [
    { bytes: [0xff, 0xd8, 0xff] },
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  ],
  'image/gif': [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
    // WebPはRIFF形式で、オフセット8-11に"WEBP"がある
  ],
  'video/mp4': [
    { bytes: [0x00, 0x00, 0x00], offset: 0 }, // ftyp box (可変サイズ)
    { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // "ftyp"
  ],
  'video/quicktime': [
    { bytes: [0x00, 0x00, 0x00], offset: 0 },
    { bytes: [0x66, 0x74, 0x79, 0x70, 0x71, 0x74], offset: 4 }, // "ftypqt"
  ],
};

// 許可されるMIMEタイプ
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// ファイルサイズ制限
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,   // 10MB for images
  video: 100 * 1024 * 1024,  // 100MB for videos
} as const;

// レートリミット設定
const RATE_LIMIT = {
  maxUploads: 20,        // 最大アップロード数
  windowSeconds: 3600,   // 1時間のウィンドウ
} as const;

/**
 * マジックバイトを検証してファイルタイプを確認
 */
export function validateMagicBytes(
  buffer: ArrayBuffer,
  declaredType: string
): { valid: boolean; detectedType?: string; error?: string } {
  const uint8Array = new Uint8Array(buffer);

  // バッファが小さすぎる場合
  if (uint8Array.length < 12) {
    return { valid: false, error: 'File too small to validate' };
  }

  // 宣言されたタイプが許可リストにあるか
  if (!ALLOWED_MIME_TYPES.includes(declaredType as AllowedMimeType)) {
    return { valid: false, error: `File type ${declaredType} is not allowed` };
  }

  // 各許可タイプのマジックバイトをチェック
  for (const mimeType of ALLOWED_MIME_TYPES) {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) continue;

    const matches = signatures.every((sig) => {
      const offset = sig.offset || 0;
      return sig.bytes.every((byte, index) => uint8Array[offset + index] === byte);
    });

    if (matches) {
      // 宣言されたタイプと検出されたタイプが一致するか
      // 動画形式は互換性があるため、video/*同士なら許可
      const declaredIsVideo = declaredType.startsWith('video/');
      const detectedIsVideo = mimeType.startsWith('video/');
      const declaredIsImage = declaredType.startsWith('image/');
      const detectedIsImage = mimeType.startsWith('image/');

      if (
        declaredType === mimeType ||
        (declaredIsVideo && detectedIsVideo) ||
        (declaredIsImage && detectedIsImage && mimeType === 'image/jpeg' && declaredType === 'image/jpg')
      ) {
        return { valid: true, detectedType: mimeType };
      }

      // タイプの不一致
      return {
        valid: false,
        detectedType: mimeType,
        error: `Declared type ${declaredType} does not match detected type ${mimeType}`,
      };
    }
  }

  // WebP特殊チェック（RIFF + WEBP）
  if (
    uint8Array[0] === 0x52 &&
    uint8Array[1] === 0x49 &&
    uint8Array[2] === 0x46 &&
    uint8Array[3] === 0x46 &&
    uint8Array[8] === 0x57 &&
    uint8Array[9] === 0x45 &&
    uint8Array[10] === 0x42 &&
    uint8Array[11] === 0x50
  ) {
    if (declaredType === 'image/webp') {
      return { valid: true, detectedType: 'image/webp' };
    }
    return {
      valid: false,
      detectedType: 'image/webp',
      error: `Declared type ${declaredType} does not match detected type image/webp`,
    };
  }

  return { valid: false, error: 'Could not verify file type from content' };
}

/**
 * ファイル名をサニタイズ（パストラバーサル攻撃防止）
 */
export function sanitizeFileName(fileName: string): string {
  // パス区切り文字を除去
  let sanitized = fileName.replace(/[/\\]/g, '_');

  // 先頭のドット（隠しファイル）を除去
  sanitized = sanitized.replace(/^\.+/, '');

  // 危険な文字を除去
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '_');

  // 連続するアンダースコアを1つに
  sanitized = sanitized.replace(/_+/g, '_');

  // 先頭と末尾の空白とドットを除去
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');

  // 空になった場合はデフォルト名
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'file';
  }

  // 最大長を制限
  if (sanitized.length > 200) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.slice(0, 200 - ext.length - 1);
    sanitized = ext ? `${name}.${ext}` : name;
  }

  return sanitized;
}

/**
 * 安全なファイルパスを生成
 */
export function generateSecureFilePath(
  accountId: string,
  originalFileName: string,
  mimeType: string
): string {
  const sanitizedName = sanitizeFileName(originalFileName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  // 拡張子を正規化
  const extension = getExtensionFromMimeType(mimeType);

  // ファイル名から拡張子を除去して再付与
  const baseName = sanitizedName.replace(/\.[^.]+$/, '');

  return `${accountId}/${timestamp}_${random}_${baseName}.${extension}`;
}

/**
 * MIMEタイプから拡張子を取得
 */
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
  };
  return extensions[mimeType] || 'bin';
}

/**
 * ファイルサイズを検証
 */
export function validateFileSize(
  size: number,
  mimeType: string
): { valid: boolean; error?: string; maxSize?: number } {
  const isVideo = mimeType.startsWith('video/');
  const maxSize = isVideo ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.image;

  if (size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${isVideo ? 'videos' : 'images'}`,
      maxSize,
    };
  }

  return { valid: true, maxSize };
}

/**
 * レートリミットをチェック
 */
export function checkUploadRateLimit(accountId: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const key = createCacheKey('upload_rate', accountId);
  const current = cache.get<{ count: number; startedAt: number }>(key);

  const now = Date.now();

  if (!current) {
    // 新しいウィンドウを開始
    cache.set(key, { count: 1, startedAt: now }, RATE_LIMIT.windowSeconds);
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxUploads - 1,
      resetIn: RATE_LIMIT.windowSeconds,
    };
  }

  const elapsedSeconds = (now - current.startedAt) / 1000;
  const resetIn = Math.max(0, RATE_LIMIT.windowSeconds - elapsedSeconds);

  if (current.count >= RATE_LIMIT.maxUploads) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(resetIn),
    };
  }

  // カウントを増加
  cache.set(
    key,
    { count: current.count + 1, startedAt: current.startedAt },
    Math.ceil(resetIn)
  );

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxUploads - current.count - 1,
    resetIn: Math.ceil(resetIn),
  };
}

/**
 * 総合的なファイル検証
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedPath?: string;
  detectedType?: string;
}

export async function validateUploadedFile(
  file: File,
  accountId: string
): Promise<FileValidationResult> {
  const errors: string[] = [];

  // 1. レートリミットチェック
  const rateLimit = checkUploadRateLimit(accountId);
  if (!rateLimit.allowed) {
    return {
      valid: false,
      errors: [`Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds`],
    };
  }

  // 2. MIMEタイプチェック（宣言値）
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // 3. ファイルサイズチェック
  const sizeValidation = validateFileSize(file.size, file.type);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // エラーがあれば早期リターン（バッファ読み込み前）
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 4. マジックバイト検証
  const buffer = await file.arrayBuffer();
  const magicValidation = validateMagicBytes(buffer, file.type);
  if (!magicValidation.valid && magicValidation.error) {
    errors.push(magicValidation.error);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 5. 安全なファイルパスを生成
  const sanitizedPath = generateSecureFilePath(
    accountId,
    file.name,
    magicValidation.detectedType || file.type
  );

  return {
    valid: true,
    errors: [],
    sanitizedPath,
    detectedType: magicValidation.detectedType,
  };
}

/**
 * アップロードパスの所有権を検証
 */
export function validatePathOwnership(
  path: string,
  accountId: string
): { valid: boolean; error?: string } {
  // パスが正しいフォーマットか
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'Invalid path' };
  }

  // パストラバーサル攻撃の検出
  if (path.includes('..') || path.includes('//') || path.startsWith('/')) {
    return { valid: false, error: 'Invalid path format' };
  }

  // 所有権チェック
  if (!path.startsWith(`${accountId}/`)) {
    return { valid: false, error: 'Access denied' };
  }

  return { valid: true };
}
