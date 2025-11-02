import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AutoReplyRule, AutoReplyRuleFormData } from '@/lib/types/auto-reply';

/**
 * 自動返信ルール一覧を取得（新仕様）
 * GET /api/auto-reply/v2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

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

    if (!account_id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

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
        account_id,
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
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    const { data: rule, error } = await supabaseAdmin
      .from('auto_reply_rules')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('auto_reply_rules')
      .delete()
      .eq('id', id);

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
