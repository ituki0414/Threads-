// ============================================
// ThreadStep - Type Definitions
// ============================================

export type SlotQuality = 'best' | 'normal' | 'avoid';
export type PostState = 'draft' | 'scheduled' | 'published' | 'failed' | 'needs_approval' | 'processing';
export type InboxItemType = 'dm' | 'comment';
export type RuleTrigger = 'dm' | 'comment';
export type Priority = 'high' | 'medium' | 'low';

// Post Metrics
export interface PostMetrics {
  likes: number;
  comments: number;
  saves: number;
  views?: number;
  reposts?: number;
  quotes?: number;
}

// Account
export interface Account {
  id: string;
  handle: string;
  token_ref: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Post
export interface Post {
  id: string;
  account_id: string;
  state: PostState;
  caption: string;
  media: string[];
  threads: string[] | null;
  threads_post_id: string | null;
  permalink: string | null;
  scheduled_at: string | null;
  slot_quality: SlotQuality | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  retry_count: number;
  error_message?: string | null;
  metrics?: PostMetrics | null;
}

// Inbox Item
export interface InboxItem {
  id: string;
  type: InboxItemType;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  ts: string;
  priority: Priority;
  flags: string[];
  is_read: boolean;
  is_approved: boolean;
  auto_reply_scheduled?: string;
}

// Rule
export interface Rule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  conditions: RuleConditions;
  action: RuleAction;
  auto: boolean;
  cooldown_s: number;
  is_active: boolean;
  created_at: string;
}

export interface RuleConditions {
  keywords?: string[];
  follower_days?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface RuleAction {
  type: 'reply' | 'dm' | 'tag';
  template: string;
  variables?: Record<string, string>;
}

// Best Time
export interface BestTime {
  account_id: string;
  weekday: number; // 0=Sunday, 6=Saturday
  hour: number;
  score: number;
}

// AI Suggestion
export interface AISuggestion {
  id: string;
  template_type: 'save' | 'talk' | 'promo';
  caption: string;
  tags: string[];
  confidence: number;
}

// Analytics
export interface SaveRateMetric {
  date: string;
  save_rate: number;
  saves: number;
  views: number;
}

export interface InitialEngagementMetric {
  date: string;
  comment_rate: number;
  comments_30min: number;
  total_views: number;
}

// Audit Log Metadata
export type AuditLogMeta = Record<string, string | number | boolean | null>;

// Audit Log
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_id: string;
  meta: AuditLogMeta;
  ts: string;
}

// Database Account (as returned from Supabase)
export interface DatabaseAccount {
  id: string;
  threads_user_id: string;
  threads_username: string;
  access_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

// Database Post with Account (joined query)
export interface DatabasePostWithAccount extends Post {
  accounts: DatabaseAccount | null;
}

// Dashboard Data
export interface DashboardData {
  best_time: { weekday: number; hour: number; minute: number };
  weekly_progress: { completed: number; target: number };
  streak_days: number;
  pending_approvals: number;
  insights: string[];
}

// Template Presets by Industry
export type IndustryType = 'romance' | 'beauty' | 'education' | 'business';

export interface TemplatePreset {
  industry: IndustryType;
  templates: {
    save: string[];
    talk: string[];
    promo: string[];
  };
  emoji_frequency: 'low' | 'medium' | 'high';
  tone: string;
}
