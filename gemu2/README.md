# DINO RUNNER 🦖🌵

ブラウザで軽快に遊べる横スクロール型の恐竜ランニングゲームです。  
外部ライブラリやビルドツールを使わず、純粋な HTML5 Canvas と JavaScript (ES Modules) で作成されています。

---

## 🎮 操作方法

- **PC**:
  - `Space` キー: ジャンプ / スタート / リトライ
  - `↑` (上矢印) キー: ジャンプ
  - 画面左クリック: ジャンプ
- **スマートフォン**:
  - 画面タップ: ジャンプ / スタート / リトライ

---

## ✨ 主な特徴

- **外部依存ゼロ**: ビルド不要の Vanilla JS 構成。画像を一切読み込まず、恐竜やサボテンなどのグラフィックはすべて Canvas ベクターパスで独自描画。
- **高DPI (Retina) 対応**: ディスプレイのピクセル密度に合わせて Canvas バッファを最適化し、くっきり高精細に描画。
- **理不尽さを防ぐ衝突判定**: 描画サイズより少し小さめにした頭部・胴体のマルチヒットボックス判定（AABB）。
- **ダイナミック難易度**: スコア・走行距離に応じて徐々に速度と障害物の出現パターンが加速（安全間隔ガード機能付き）。
- **自己ベスト記録**: ブラウザの `localStorage` にハイスコアを自動保存。

---

## 🚀 ローカルでの遊び方

1. このリポジトリをクローンまたはダウンロードします。
2. 簡易Webサーバー（または VS Code の Live Server 等）で開くか、ブラウザで直接 `index.html` を開きます。
   - ※ ES Modules を使用しているため、ローカルHTTPサーバー経由での起動を推奨します（例: `npx serve .` や Python の `python -m http.server`）。

---

## ☁️ Cloudflare Pages へのデプロイ手順

1. **GitHubリポジトリにプッシュ**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dino Runner game"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```

2. **Cloudflareダッシュボードでの設定**:
   - Cloudflare にログイン → **Workers & Pages** を選択
   - **作成** → **Pages** → **Git に接続** を選択
   - 先ほど作成した GitHub リポジトリを選択
   - 設定画面で以下を指定:
     - **フレームワーク プリセット**: `None`
     - **ビルドコマンド**: `（空欄）`
     - **ビルド出力ディレクトリ**: `/`（または空欄）
   - **保存してデプロイ** をクリック

3. これで数秒後に世界中へ配信される `https://xxx.pages.dev` の公開URLが発行されます！
