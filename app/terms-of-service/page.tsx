export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

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
              本利用規約（以下「本規約」）は、スレぽす（以下「当サービス」）の利用条件を定めるものです。
              当サービスをご利用いただく際には、本規約に同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. サービスの内容</h2>
            <p className="text-muted-foreground mb-2">当サービスは、以下の機能を提供します：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Threads 投稿の管理・作成機能</li>
              <li>予約投稿機能</li>
              <li>自動返信機能</li>
              <li>投稿分析・アナリティクス機能</li>
              <li>ベストタイム分析機能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. アカウント登録</h2>
            <p className="text-muted-foreground">
              当サービスを利用するには、Threads アカウントとの連携が必要です。
              アカウント情報は正確かつ最新の状態に保つ責任があります。
              アカウントのセキュリティ維持は、ユーザーの責任となります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 利用制限</h2>
            <p className="text-muted-foreground mb-2">以下の行為を禁止します：</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>スパム行為や不正な自動化</li>
              <li>Meta の Threads 利用規約に違反する行為</li>
              <li>第三者の権利を侵害する行為</li>
              <li>当サービスの脆弱性を悪用する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. コンテンツの責任</h2>
            <p className="text-muted-foreground">
              ユーザーが当サービスを通じて投稿するコンテンツについては、ユーザー自身が責任を負います。
              違法、有害、または不適切なコンテンツの投稿は禁止されています。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 知的財産権</h2>
            <p className="text-muted-foreground">
              当サービスに関する知的財産権は、当サービス運営者に帰属します。
              ユーザーが投稿したコンテンツの知的財産権は、ユーザーに帰属します。
              ただし、当サービスの提供に必要な範囲で、コンテンツを使用する権利をユーザーから許諾されたものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. サービスの変更・停止</h2>
            <p className="text-muted-foreground">
              当サービスは、事前の通知なく、サービス内容の変更、一時停止、または終了する場合があります。
              これによりユーザーに生じた損害について、当サービスは責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 免責事項</h2>
            <p className="text-muted-foreground mb-2">
              当サービスは「現状のまま」提供されます。以下について保証しません：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>サービスの継続性、正確性、完全性</li>
              <li>サービスの特定目的への適合性</li>
              <li>サービス利用により得られる結果</li>
              <li>第三者サービス（Threads API）の可用性</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              当サービスの利用により生じた損害について、法令上許容される最大限の範囲で責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. プライバシー</h2>
            <p className="text-muted-foreground">
              個人情報の取り扱いについては、別途定める
              <a href="/privacy-policy" className="text-primary hover:underline ml-1">
                プライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. アカウントの停止・削除</h2>
            <p className="text-muted-foreground">
              当サービスは、本規約に違反したユーザーのアカウントを、事前の通知なく停止または削除できます。
              ユーザーは、いつでもアカウントを削除できます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. 規約の変更</h2>
            <p className="text-muted-foreground">
              当サービスは、必要に応じて本規約を変更する場合があります。
              重要な変更がある場合は、サービス内で通知します。
              変更後も当サービスを利用し続けることで、変更に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. 準拠法と管轄</h2>
            <p className="text-muted-foreground">
              本規約は日本法に準拠します。
              当サービスに関する紛争については、東京地方裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. お問い合わせ</h2>
            <p className="text-muted-foreground">
              本規約に関するご質問やご懸念がある場合は、以下までお問い合わせください。
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
