export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">運営者情報</h2>
            <div className="text-muted-foreground space-y-1">
              <p>サービス名: スレぽす（ThreadStep）</p>
              <p>運営者: 合同会社LESS.</p>
              <p>所在地: 東京都目黒区中目黒4-12-7</p>
              <p>連絡先: iokamoto.hotline@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
            <p className="text-muted-foreground">
              スレぽす（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーは、当サービスがどのような情報を収集し、どのように使用するかを説明します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
            <p className="text-muted-foreground mb-2">当サービスは以下の情報を収集します：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Threads アカウント情報（ユーザーID、ユーザー名、プロフィール画像）</li>
              <li>Threads 投稿データ（投稿内容、メディア、投稿日時）</li>
              <li>アクセストークン（Threads API との連携に使用）</li>
              <li>自動返信ルールの設定情報</li>
              <li>利用状況データ（アナリティクス目的）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 情報の使用目的</h2>
            <p className="text-muted-foreground mb-2">収集した情報は以下の目的で使用します：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Threads 投稿の管理・予約投稿機能の提供</li>
              <li>自動返信機能の提供</li>
              <li>投稿分析・アナリティクス機能の提供</li>
              <li>サービスの改善・最適化</li>
              <li>ユーザーサポート</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 情報の共有</h2>
            <p className="text-muted-foreground">
              当サービスは、以下の場合を除き、ユーザーの個人情報を第三者と共有しません：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
              <li>ユーザーの同意がある場合</li>
              <li>法的義務を遵守するため必要な場合</li>
              <li>サービス提供に必要な範囲で、信頼できるサービスプロバイダー（Supabase など）と共有する場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. データの保存</h2>
            <p className="text-muted-foreground">
              ユーザーデータは、Supabase（PostgreSQL データベース）に安全に保存されます。
              データは暗号化され、適切なセキュリティ対策のもと管理されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. ユーザーの権利</h2>
            <p className="text-muted-foreground mb-2">ユーザーは以下の権利を有します：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>自分の個人情報へのアクセス権</li>
              <li>個人情報の訂正・削除を要求する権利</li>
              <li>データの移行を要求する権利</li>
              <li>サービスの利用を停止し、アカウントを削除する権利</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Threads API の利用</h2>
            <p className="text-muted-foreground">
              当サービスは Meta の Threads API を使用しています。
              Threads API の利用に関しては、Meta のプライバシーポリシーおよび利用規約も適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookie とトラッキング</h2>
            <p className="text-muted-foreground">
              当サービスは、認証情報の保存やサービスの改善のために Cookie を使用する場合があります。
              ブラウザの設定により Cookie を無効化できますが、一部機能が正常に動作しない可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. プライバシーポリシーの変更</h2>
            <p className="text-muted-foreground">
              当サービスは、必要に応じて本プライバシーポリシーを変更する場合があります。
              重要な変更がある場合は、サービス内で通知します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. お問い合わせ</h2>
            <p className="text-muted-foreground">
              プライバシーに関するご質問やご懸念がある場合は、以下までお問い合わせください。
            </p>
            <div className="text-muted-foreground mt-4 space-y-1">
              <p>合同会社LESS.</p>
              <p>東京都目黒区中目黒4-12-7</p>
              <p>Email: iokamoto.hotline@gmail.com</p>
            </div>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              最終更新日: 2025年11月3日
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
