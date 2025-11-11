/**
 * Threads API Client
 *
 * Threads APIはInstagram Graph APIの一部として提供されています。
 * https://developers.facebook.com/docs/threads
 */

interface ThreadsPost {
  id: string;
  text: string;
  timestamp: string;
  media_url?: string;
  media_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'TEXT_POST';
  media_product_type?: string;
  thumbnail_url?: string; // 動画のサムネイル
  permalink: string;
  reply_to_id?: string; // スレッドの親投稿ID
  is_reply?: boolean; // リプライかどうか
  children?: { data: Array<{ id: string; media_url?: string; media_type?: string; thumbnail_url?: string }> }; // カルーセルの子要素
}

interface ThreadsUser {
  id: string;
  username: string;
  threads_profile_picture_url?: string;
}

export class ThreadsAPIClient {
  private accessToken: string;
  private baseUrl = 'https://graph.threads.net/v1.0';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * ユーザー情報を取得
   */
  async getUser(): Promise<ThreadsUser> {
    const response = await fetch(
      `${this.baseUrl}/me?fields=id,username,threads_profile_picture_url&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Threads API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 投稿を作成
   */
  async createPost(params: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    replyToId?: string; // スレッド投稿用: 返信先の投稿ID
  }): Promise<{ id: string }> {
    // Step 1: メディアコンテナを作成
    const containerParams: any = {
      media_type: 'TEXT',
      text: params.text,
      access_token: this.accessToken,
    };

    if (params.mediaUrl) {
      containerParams.media_type = params.mediaType || 'IMAGE';
      containerParams.image_url = params.mediaUrl;
    }

    // スレッド投稿の場合、返信先IDを指定
    if (params.replyToId) {
      containerParams.reply_to_id = params.replyToId;
    }

    const containerResponse = await fetch(
      `${this.baseUrl}/me/threads?` + new URLSearchParams(containerParams),
      { method: 'POST' }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Failed to create container: ${JSON.stringify(error)}`);
    }

    const { id: containerId } = await containerResponse.json();

    // Step 2: コンテナを公開
    const publishResponse = await fetch(
      `${this.baseUrl}/me/threads_publish?` +
        new URLSearchParams({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      { method: 'POST' }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Failed to publish post: ${JSON.stringify(error)}`);
    }

    return publishResponse.json();
  }

  /**
   * スレッド投稿を作成（複数の投稿を連続して投稿）
   */
  async createThread(posts: Array<{
    text: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
  }>): Promise<{ ids: string[] }> {
    const ids: string[] = [];
    let previousId: string | undefined;

    for (const post of posts) {
      const result = await this.createPost({
        ...post,
        replyToId: previousId, // 前の投稿に返信する形でスレッド化
      });

      ids.push(result.id);
      previousId = result.id;

      // API rate limitを避けるため、少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { ids };
  }

  /**
   * 投稿一覧を取得（すべての投稿を取得）
   */
  async getPosts(limit: number = 25): Promise<ThreadsPost[]> {
    const allPosts: ThreadsPost[] = [];
    let nextUrl: string | null = `${this.baseUrl}/me/threads?fields=id,text,timestamp,media_url,media_type,media_product_type,thumbnail_url,permalink,reply_to_id,is_reply,children{id,media_url,media_type,thumbnail_url}&limit=${limit}&access_token=${this.accessToken}`;
    let pageCount = 0;

    // ページネーションですべての投稿を取得
    while (nextUrl) {
      pageCount++;
      const response: Response = await fetch(nextUrl);

      if (!response.ok) {
        throw new Error(`Threads API Error: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.data) {
        // カルーセル投稿の場合、children から画像URLを取得
        const processedPosts = data.data.map((post: ThreadsPost) => {
          // カルーセル投稿の場合、最初の画像をmedia_urlに設定
          if (post.media_type === 'CAROUSEL_ALBUM' && post.children?.data?.[0]) {
            return {
              ...post,
              media_url: post.children.data[0].media_url || post.media_url,
              thumbnail_url: post.children.data[0].thumbnail_url || post.thumbnail_url,
            };
          }
          return post;
        });

        allPosts.push(...processedPosts);

        // 最初のページの最新5件をログ出力
        if (pageCount === 1) {
          console.log('🔍 First 5 posts from Threads API:');
          processedPosts.slice(0, 5).forEach((post: ThreadsPost) => {
            console.log(`  - ID: ${post.id}`);
            console.log(`    Text: ${post.text?.substring(0, 50) || '(no text)'}`);
            console.log(`    Media Type: ${post.media_type}`);
            console.log(`    Media URL: ${post.media_url || 'no media'}`);
            console.log(`    Thumbnail: ${post.thumbnail_url || 'no thumbnail'}`);
            console.log(`    Children: ${post.children?.data?.length || 0} items`);
          });
        }
      }

      // 次のページがあれば続ける
      nextUrl = data.paging?.next || null;

      // 安全のため、最大500件まで
      if (allPosts.length >= 500) {
        console.warn('⚠️ Reached maximum limit of 500 posts');
        break;
      }
    }

    console.log(`📥 Total posts fetched: ${allPosts.length} (${pageCount} pages)`);
    return allPosts;
  }

  /**
   * 投稿の詳細を取得
   */
  async getPost(postId: string): Promise<ThreadsPost> {
    const response = await fetch(
      `${this.baseUrl}/${postId}?fields=id,text,timestamp,media_url,media_type,media_product_type,thumbnail_url,permalink,children{id,media_url,media_type,thumbnail_url}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Threads API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 投稿のインサイト（エンゲージメント）を取得
   */
  async getPostInsights(postId: string): Promise<{
    views: number;
    likes: number;
    replies: number;
    reposts: number;
    quotes: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/${postId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Threads API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // データを整形
    const insights: any = {
      views: 0,
      likes: 0,
      replies: 0,
      reposts: 0,
      quotes: 0,
    };

    data.data?.forEach((item: any) => {
      insights[item.name] = item.values[0]?.value || 0;
    });

    return insights;
  }

  /**
   * 返信を投稿（2ステップ: コンテナ作成 → 公開）
   */
  async replyToPost(postId: string, text: string): Promise<{ id: string }> {
    // ステップ1: リプライのメディアコンテナを作成
    const user = await this.getUser();

    const createResponse = await fetch(
      `${this.baseUrl}/${user.id}/threads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: text,
          reply_to_id: postId,
          access_token: this.accessToken,
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create reply container: ${JSON.stringify(error)}`);
    }

    const { id: containerId } = await createResponse.json();

    // ステップ2: コンテナを公開
    const publishResponse = await fetch(
      `${this.baseUrl}/${user.id}/threads_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Failed to publish reply: ${JSON.stringify(error)}`);
    }

    return publishResponse.json();
  }

  /**
   * 投稿への返信一覧を取得
   */
  async getReplies(postId: string): Promise<Array<{
    id: string;
    text: string;
    username: string;
    timestamp: string;
    from_id: string;
  }>> {
    const response = await fetch(
      `${this.baseUrl}/${postId}/replies?fields=id,text,username,timestamp,from{id,username}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Threads API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // APIレスポンスを変換（from.id を from_id にフラット化）
    const replies = (data.data || []).map((reply: any) => ({
      id: reply.id,
      text: reply.text,
      username: reply.username || reply.from?.username || 'unknown',
      timestamp: reply.timestamp,
      from_id: reply.from?.id || '',
    }));

    return replies;
  }

  /**
   * 投稿への会話（コメント）を取得
   */
  async getConversation(postId: string): Promise<Array<{
    id: string;
    text: string;
    username: string;
    timestamp: string;
    from_id: string;
  }>> {
    const response = await fetch(
      `${this.baseUrl}/${postId}/conversation?fields=id,text,username,timestamp,from{id,username}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Threads API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // APIレスポンスを変換（from.id を from_id にフラット化）
    const conversations = (data.data || []).map((conv: any) => ({
      id: conv.id,
      text: conv.text,
      username: conv.username || conv.from?.username || 'unknown',
      timestamp: conv.timestamp,
      from_id: conv.from?.id || '',
    }));

    return conversations;
  }
}

/**
 * OAuth認証用のURL生成
 */
export function getThreadsAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.THREADS_APP_ID || '',
    redirect_uri: redirectUri,
    scope: 'threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies',
    response_type: 'code',
  });

  return `https://threads.net/oauth/authorize?${params.toString()}`;
}

/**
 * 認証コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.THREADS_APP_ID || '',
      client_secret: process.env.THREADS_APP_SECRET || '',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to exchange code: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * 短期トークンを長期トークンに交換（60日間有効）
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await fetch(
    'https://graph.threads.net/access_token?' +
      new URLSearchParams({
        grant_type: 'th_exchange_token',
        client_secret: process.env.THREADS_APP_SECRET || '',
        access_token: shortLivedToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get long-lived token: ${JSON.stringify(error)}`);
  }

  return response.json();
}
