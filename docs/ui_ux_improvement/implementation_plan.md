# Web3 教育用クイズDApp 改善計画書（最終版）

## 概要

Polygon Amoyテストネット上で動作するReact製 教育用Web3クイズDAppのUI/UX改善と機能追加。
GitHub Pages（`gh-pages`）でデプロイ。参考URL: https://bongore.github.io/test2

### 決定事項

| 項目 | 決定内容 |
|------|---------|
| UI/UX方針 | **B案: モダンデザイン刷新**（ダークモード、グラスモーフィズム、アニメーション） |
| スマートコントラクト | **既存の`token.sol`を流用**（新規コントラクト作成なし） |
| バックエンド | **Firebase Realtime Database**（GitHub Pagesと相性良、無料枠あり） |
| 優先順位 | フェーズ1: UI基盤 → フェーズ2: 既存ページ刷新 → フェーズ3: 新機能 |

---

## フェーズ1: UI基盤構築

### デザインシステム

#### [NEW] [design-tokens.css](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/styles/design-tokens.css)

CSS変数でカラー・タイポグラフィ・スペーシングを一元管理。

```css
:root {
  /* ダークモード基調 */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-card: rgba(255, 255, 255, 0.05);
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.12);
  /* アクセントカラー */
  --accent-cyan: #00d4ff;
  --accent-purple: #a855f7;
  --accent-pink: #ec4899;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  /* テキスト */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  /* フォント */
  --font-main: 'Inter', 'Noto Sans JP', sans-serif;
}
```

#### [NEW] [animations.css](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/styles/animations.css)

共通アニメーション（fadeIn、slideUp、pulse、shimmer等）。

---

### ルーティング修正

#### [MODIFY] [App.js](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/App.js)

**現状の問題:**
- 9つの独立した`<Routes>`ブロック → 単一`<Routes>`に統合
- `<body>`タグをReact内で使用 → 除去
- `quiz_comp`テキストノードが散在 → 除去
- `BrowserRouter` → GitHub Pages対応で`HashRouter`に変更

```diff
-import { BrowserRouter, Routes, Route } from "react-router-dom";
+import { HashRouter, Routes, Route } from "react-router-dom";
-<body>
-  <BrowserRouter basename={homeUrl}>
-    <Routes><Route path="/login" .../></Routes>
-    <Routes><Route path="/user_page/:address" .../></Routes>
-    ...9個の独立Routes...
-  </BrowserRouter>
-  <Nav_menu />
-</body>
+<HashRouter>
+  <Nav_menu cont={cont} home={homeUrl} />
+  <main className="main-content">
+    <Routes>
+      <Route path="/login" element={<Login />} />
+      <Route path="/dashboard" element={<Dashboard />} />
+      ... 全ルートを1つにまとめる ...
+    </Routes>
+  </main>
+</HashRouter>
```

---

## フェーズ2: 既存ページの刷新

### ログインページ

#### [MODIFY] [login.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/login.jsx)

- ダークグラデーション背景 + グラスモーフィズムカード
- MetaMaskアイコンの拡大表示 + 接続アニメーション
- 接続状態のフィードバック表示

### ナビバー

#### [MODIFY] [navbar.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/navbar/navbar.jsx)

**現状の問題:**
- `<font>`タグ（HTML5で非推奨）の使用 → CSSの`font-size`に置換
- `href`での直接遷移 → React Routerの`<NavLink>`に変更
- Bootstrap Navbarのデフォルトスタイル → カスタムグラスモーフィズムナビ

#### [MODIFY] [Modal_change_network.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/navbar/Modal_change_network.jsx)

- `class` → `className`に修正
- モダンなオーバーレイデザインに変更

### クイズ一覧ページ

#### [MODIFY] [list_quiz_top.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/list_quiz_top.jsx)

- 検索バー・フィルタ・ソートUI追加
- `"now_loading"` テキスト → スケルトンローディングアニメーション

#### [MODIFY] [quiz_simple.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/components/quiz_simple.jsx)

**現状の問題:**
- マジックナンバー（`quiz[7]`、`quiz[10]`等）→ 名前付き定数化
- 状態表示のネストされた三項演算子 → ヘルパー関数に抽出
- シンプルな灰色カード → グラスモーフィズム + ステータス別グロー

### クイズ回答ページ

#### [MODIFY] [answer_quiz.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/answer_quiz/answer_quiz.jsx)

**現状の問題:**
- `class="d-flex justify-content-end"` → React用 `className`
- `<a>` タグの非セマンティック使用 → 適切な要素に変更
- 成功/失敗のフィードバックが不明確 → アニメーション付きフィードバック

### ユーザーページ

#### [MODIFY] [user_page.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/user_page/user_page.jsx)
#### [MODIFY] [user_card.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/user_page/component/user_card.jsx)

**現状の問題:**
- `if(true)` の不要な条件分岐 → デッドコード除去
- `"margin-top"` → JSX標準の `marginTop`
- 灰色のフラットカード → グラスモーフィズム

### 待機モーダル

#### [MODIFY] [wait_Modal.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/wait_Modal.jsx)

- `<font>` タグ → CSSベースのスタイリング
- プログレスインジケーターをモダンに刷新
- ブロックチェーン書き込み状況のステップ表示

### 管理・編集ページ

#### [MODIFY] [admin.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/admin_page/admin.jsx)
#### [MODIFY] [edit_list_top.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/edit_list/edit_list_top.jsx)
#### [MODIFY] [investment_page.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/investment_page/investment_page.jsx)

- Bootstrap標準ボタン → カスタムスタイルボタン
- フォームのモダン化

---

## フェーズ3: 新機能追加

### 1. ダッシュボード

#### [NEW] [dashboard.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/dashboard/dashboard.jsx)

保有トークン、ランキング、正答率、未回答クイズ数を表示。
既存の`contracts.jsx`の以下メソッドを活用:
- `get_token_balance()` → トークン残高
- `get_rank()` → 順位
- `get_quiz_lenght()` + `get_quiz_list()` → クイズ統計

### 2. ランキングボード

#### [NEW] [ranking.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/ranking/ranking.jsx)

既存の`get_only_student_results()` + `get_results()`を活用。
Top3の特別演出、自分のポジションハイライト。

### 3. 通知機能

#### [NEW] [notifications.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/notifications/notifications.jsx)

クイズ出題イベントをスマートコントラクトのログから取得（`viem`の`watchContractEvent`活用）。
ナビバーにバッジ表示。

### 4. リアルタイム講義配信＋コメント機能

#### [NEW] [live_lecture.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/live_lecture/live_lecture.jsx)
#### [NEW] [comment_overlay.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/live_lecture/components/comment_overlay.jsx)
#### [NEW] [super_chat.jsx](file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/live_lecture/components/super_chat.jsx)

- 映像エリア: YouTube Live/Twitchのiframe埋め込み
- コメント: Firebase Realtime Databaseでリアルタイム同期
- 課金コメント: 既存`token.sol`の`transfer`機能を流用
  - `contracts.jsx`の`approve()` + token contractの`transferFrom()`

---

## コード整理（全フェーズ共通）

| ファイル | 問題点 | 改善内容 |
|----------|--------|----------|
| `contracts.jsx` (850行) | 1クラスに全メソッド集中 | Quiz/Token/User系にモジュール分割 |
| `quiz_simple.jsx` | `quiz[0]`〜`quiz[11]` のマジックインデックス | 分割代入で名前付け |
| `answer_quiz.jsx` / `Modal_change_network.jsx` | `class` 属性使用 | `className`に修正 |
| `navbar.jsx` / `wait_Modal.jsx` | `<font>` タグ使用 | CSSベースに置換 |
| `user_card.jsx` | `if(true)` デッドコード | 不要分岐除去 |
| 全CSS | メディアクエリ重複、ハードコード | CSS変数化・共通化 |

---

## 検証計画

1. `npm start` でローカル起動 → 全ページ動作確認
2. Chrome DevToolsのレスポンシブモード（iPhone SE、iPad、Desktop）
3. `npm run build` → `npm run deploy` でGitHub Pagesにデプロイ
4. MetaMask接続 → クイズ一覧/回答/作成の正常動作確認
5. ダッシュボード・ランキングのデータ表示確認

> [!WARNING]
> ライブコメントの課金機能テストにはPolygon Amoyテストネットのテスト用MATICとTFTトークンが必要です。

---

## 実装スケジュール（目安）

| フェーズ | 内容 | 想定工数 |
|---------|------|---------|
| 1 | デザインシステム構築 + ルーティング修正 | 1日 |
| 2 | 既存ページのUI刷新（全10ページ） | 3〜4日 |
| 3 | 新機能（ダッシュボード、ランキング、通知） | 2〜3日 |
| 3+ | ライブ配信＋コメント機能 | 2〜3日 |
| 4 | コード整理・テスト・デプロイ | 1日 |
| **合計** | | **9〜12日** |
