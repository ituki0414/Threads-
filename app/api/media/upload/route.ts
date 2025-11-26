import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedAccount, createAuthErrorResponse } from '@/lib/auth';
import {
  validateUploadedFile,
  validatePathOwnership,
  checkUploadRateLimit,
} from '@/lib/media-security';
import { logger } from '@/lib/logger';

/**
 * メディアファイルをSupabase Storageにアップロード
 * POST /api/media/upload
 *
 * セキュリティ対策：
 * - 認証必須
 * - マジックバイト検証（MIMEタイプ偽装対策）
 * - ファイルサイズ制限（画像10MB、動画100MB）
 * - ファイル名サニタイズ（パストラバーサル防止）
 * - レートリミット（1時間あたり20ファイル）
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    // FormDataを取得
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      logger.warn('Invalid form data received', { accountId });
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 総合的なファイル検証
    const validation = await validateUploadedFile(file, accountId);

    if (!validation.valid) {
      logger.warn('File validation failed', {
        accountId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        errors: validation.errors,
      });

      return NextResponse.json(
        { error: validation.errors.join('; ') },
        { status: 400 }
      );
    }

    // ファイルパス（サニタイズ済み）
    const filePath = validation.sanitizedPath!;

    // Supabase Storageにアップロード
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabaseAdmin.storage
      .from('media')
      .upload(filePath, arrayBuffer, {
        contentType: validation.detectedType || file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.logError('Storage upload error', error, {
        accountId,
        filePath,
      });
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(filePath);

    // レートリミット情報を取得
    const rateLimit = checkUploadRateLimit(accountId);

    logger.info('Media uploaded successfully', {
      accountId,
      filePath,
      fileSize: file.size,
      detectedType: validation.detectedType,
    });

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: filePath,
      type: (validation.detectedType || file.type).startsWith('image/')
        ? 'IMAGE'
        : 'VIDEO',
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    });
  } catch (error) {
    logger.logError('Media upload error', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

/**
 * メディアファイルを削除
 * DELETE /api/media/upload?path=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'No path provided' },
        { status: 400 }
      );
    }

    // パスの所有権を検証
    const ownershipValidation = validatePathOwnership(path, accountId);
    if (!ownershipValidation.valid) {
      logger.warn('Unauthorized delete attempt', {
        accountId,
        path,
        error: ownershipValidation.error,
      });
      return NextResponse.json(
        { error: ownershipValidation.error || 'Forbidden' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin.storage.from('media').remove([path]);

    if (error) {
      logger.logError('Storage delete error', error, { accountId, path });
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    logger.info('Media deleted successfully', { accountId, path });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.logError('Media delete error', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
