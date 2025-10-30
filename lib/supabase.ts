import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// クライアント側用（ブラウザで使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          threads_user_id: string;
          threads_username: string;
          access_token: string;
          token_expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
      };
      posts: {
        Row: {
          id: string;
          account_id: string;
          threads_post_id: string | null;
          state: 'published' | 'scheduled' | 'draft' | 'needs_approval' | 'failed';
          caption: string;
          media: string[];
          scheduled_at: string | null;
          published_at: string | null;
          slot_quality: 'best' | 'normal' | 'avoid' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      inbox_items: {
        Row: {
          id: string;
          account_id: string;
          threads_item_id: string;
          type: 'dm' | 'comment';
          author_id: string;
          author_name: string;
          author_avatar: string | null;
          text: string;
          ts: string;
          priority: 'high' | 'medium' | 'low';
          flags: string[];
          is_read: boolean;
          is_approved: boolean;
          auto_reply_scheduled: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inbox_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inbox_items']['Insert']>;
      };
      rules: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          trigger: 'dm' | 'comment';
          conditions: {
            keywords?: string[];
            sentiment?: 'positive' | 'negative' | 'neutral';
            follower_days?: number;
          };
          action: {
            type: 'dm' | 'reply';
            template: string;
          };
          auto: boolean;
          cooldown_s: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rules']['Insert']>;
      };
      best_times: {
        Row: {
          id: string;
          account_id: string;
          weekday: number;
          hour: number;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['best_times']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['best_times']['Insert']>;
      };
    };
  };
}
