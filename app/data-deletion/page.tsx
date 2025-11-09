export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">データ削除リクエスト</h1>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">運営者情報</h2>
            <div className="text-muted-foreground space-y-1">
              <p>サービス名: スレぽす</p>
              <p>運営者: 合同会社LESS.</p>
              <p>所在地: 東京都目黒区中目黒4-12-7</p>
              <p>連絡先: iokamoto.hotline@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">データ削除について</h2>
            <p className="text-muted-foreground">
              スレぽすでは、ユーザーのプライバシーを尊重し、データ削除リクエストに対応しています。
              アカウントとそれに関連するすべてのデータを削除することができます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">削除されるデータ</h2>
            <p className="text-muted-foreground mb-2">以下のデータが完全に削除されます：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Threads アカウント情報（ユーザーID、ユーザー名、プロフィール画像）</li>
              <li>アクセストークン</li>
              <li>投稿データ（予約投稿、投稿履歴）</li>
              <li>自動返信ルールとその履歴</li>
              <li>アナリティクスデータ</li>
              <li>その他すべての個人情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">削除方法</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">方法1: ダッシュボードから削除</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>スレぽすにログイン</li>
                  <li>ダッシュボードの「設定」に移動</li>
                  <li>「アカウント削除」ボタンをクリック</li>
                  <li>確認画面で「削除する」をクリック</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">方法2: メールでリクエスト</h3>
                <p>以下の情報を含めて、メールでデータ削除をリクエストできます：</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>件名: 「データ削除リクエスト」</li>
                  <li>本文: Threads ユーザー名またはユーザーID</li>
                  <li>送信先: iokamoto.hotline@gmail.com</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">削除の処理期間</h2>
            <p className="text-muted-foreground">
              データ削除リクエストを受け取った後、<strong>30日以内</strong>にすべてのデータを完全に削除します。
              削除が完了したら、登録されているメールアドレスに通知をお送りします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">注意事項</h2>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-muted-foreground mb-2">
                <strong className="text-foreground">重要:</strong> データ削除は取り消すことができません。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>削除後は、同じアカウントでサービスを再度利用できません</li>
                <li>予約投稿や自動返信の設定もすべて削除されます</li>
                <li>削除前に、必要なデータはエクスポートしてください</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">お問い合わせ</h2>
            <p className="text-muted-foreground">
              データ削除に関するご質問やサポートが必要な場合は、以下までお問い合わせください。
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
