import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedAccount, verifyAccountOwnership, verifyResourceOwnership, createAuthErrorResponse } from '@/lib/auth';
import { createAutoReplyRuleSchema, updateAutoReplyRuleSchema, validateRequestBody } from '@/lib/validations';

/**
 * 自動返信ルール一覧を取得
 * GET /api/auto-reply
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
      .select('*')
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
 * 自動返信ルールを作成
 * POST /api/auto-reply
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      account_id,
      name,
      trigger_type,
      trigger_keywords,
      reply_template,
      is_active,
    } = body;

    // 認証チェック＋account_idの所有権検証
    const authResult = await verifyAccountOwnership(account_id);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    if (!name || !trigger_type || !reply_template) {
      return NextResponse.json(
        { error: 'Name, trigger type, and reply template are required' },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .insert({
        account_id: accountId,
        name,
        trigger_type,
        trigger_keywords: trigger_keywords || [],
        reply_template,
        is_active: is_active !== undefined ? is_active : true,
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
 * 自動返信ルールを更新
 * PUT /api/auto-reply
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
    const {
      id,
      name,
      trigger_type,
      trigger_keywords,
      reply_template,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    // ルールの所有権を検証
    const ownership = await verifyResourceOwnership('auto_reply_rules', id, accountId);
    if (!ownership.owned) {
      return NextResponse.json({ error: 'Forbidden - Rule not found or not owned' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (trigger_type !== undefined) updateData.trigger_type = trigger_type;
    if (trigger_keywords !== undefined) updateData.trigger_keywords = trigger_keywords;
    if (reply_template !== undefined) updateData.reply_template = reply_template;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: rule, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .update(updateData)
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
 * 自動返信ルールを削除
 * DELETE /api/auto-reply
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
