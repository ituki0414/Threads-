import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AutoReplyRuleFormData } from '@/lib/types/auto-reply';
import { getAuthenticatedAccount, verifyAccountOwnership, verifyResourceOwnership, createAuthErrorResponse } from '@/lib/auth';

/**
 * 自動返信ルール一覧を取得（新仕様）
 * GET /api/auto-reply/v2
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    const { data: rules, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .select(`
        *,
        target_post:posts(id, caption, threads_post_id, state)
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (error) {
    console.error('Get auto-reply rules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-reply rules' },
      { status: 500 }
    );
  }
}

/**
 * 自動返信ルールを作成（新仕様）
 * POST /api/auto-reply/v2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, ...ruleData } = body as { account_id: string } & AutoReplyRuleFormData;

    // 認証チェック＋account_idの所有権検証
    const authResult = await verifyAccountOwnership(account_id);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    // バリデーション
    if (!ruleData.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // トリガーが1つ以上必要
    if (!ruleData.trigger_reply && !ruleData.trigger_repost && !ruleData.trigger_quote && !ruleData.trigger_like) {
      return NextResponse.json({ error: 'At least one trigger is required' }, { status: 400 });
    }

    // リプライタイプの場合、reply_textまたはreply_media_urlが必要
    if (ruleData.reply_type !== 'none' && !ruleData.reply_text && !ruleData.reply_media_url) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const { data: rule, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .insert({
        account_id: accountId,
        ...ruleData,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Create auto-reply rule error:', error);
    return NextResponse.json(
      { error: 'Failed to create auto-reply rule' },
      { status: 500 }
    );
  }
}

/**
 * 自動返信ルールを更新（新仕様）
 * PUT /api/auto-reply/v2
 */
export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    // ルールの所有権を検証
    const ownership = await verifyResourceOwnership('auto_reply_rules', id, accountId);
    if (!ownership.owned) {
      return NextResponse.json({ error: 'Forbidden - Rule not found or not owned' }, { status: 403 });
    }

    const { data: rule, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Update auto-reply rule error:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-reply rule' },
      { status: 500 }
    );
  }
}

/**
 * 自動返信ルールを削除（新仕様）
 * DELETE /api/auto-reply/v2
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    // ルールの所有権を検証
    const ownership = await verifyResourceOwnership('auto_reply_rules', id, accountId);
    if (!ownership.owned) {
      return NextResponse.json({ error: 'Forbidden - Rule not found or not owned' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('auto_reply_rules')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete auto-reply rule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete auto-reply rule' },
      { status: 500 }
    );
  }
}
