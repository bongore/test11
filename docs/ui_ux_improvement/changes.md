# 全変更点まとめ（プログラム内容付き）

> 実施日: 2026-03-15
> 対象: Web3 教育用クイズDApp UI/UX改善（フェーズ1・2）

---

## 目次

1. [新規ファイル](#1-新規ファイル3ファイル)
2. [修正ファイル](#2-修正ファイル17ファイル)

---

## 1. 新規ファイル（3ファイル）

---

### 1-1. `src/styles/design-tokens.css`（新規）

**目的:** ダークテーマ+グラスモーフィズムのデザインシステム。CSS変数でカラー・フォント・スペーシング・グラスモーフィズム・共通コンポーネント（ボタン、バッジ、フォーム）を一元管理。

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/styles/design-tokens.css)

---

### 1-2. `src/styles/animations.css`（新規）

**目的:** 共通アニメーション定義。fadeIn、slideUp、shimmer（スケルトンローディング）、spin、bounceIn、float、stagger-children等を含む。`prefers-reduced-motion` 対応。

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/styles/animations.css)

---

### 1-3. `src/pages/list_quiz/list_quiz_top.css`（新規）

**目的:** クイズ一覧ページのレイアウトCSS。

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/list_quiz_top.css)

---

## 2. 修正ファイル（17ファイル）

---

### 2-1. `src/App.js`

**変更概要:**
- `BrowserRouter` → `HashRouter`（GitHub Pages対応）
- 9つの独立した `<Routes>` ブロック → **1つに統合**
- `<body>` タグ使用 → 除去
- `quiz_comp` テキストノード → 除去
- デザインシステムCSS読み込み追加
- デフォルトルート `/` → `/list_quiz` へのリダイレクト追加

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/App.js)

---

### 2-2. `src/App.css`

**変更概要:**
- デザインシステムのCSS変数（`var(--gradient-bg)` 等）を使用するよう更新

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/App.css)

---

### 2-3. `src/pages/navbar/navbar.jsx`

**変更概要:**
- `<font>` タグ（HTML5非推奨）→ 除去
- `href` 直接遷移 → React Router の `<NavLink>`（アクティブ状態自動判定）
- Bootstrap Navbar → カスタムグラスモーフィズムナビ
- 教師判定ロジックの維持

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/navbar/navbar.jsx)

---

### 2-4. `src/pages/navbar/navbar.css`

**変更概要:**
- Bootstrap標準ナビ → グラスモーフィズム底部ナビ
- アクティブインジケーター（シアングラデーション）
- ホバーアニメーション
- `safe-area-inset-bottom` 対応（iPhoneノッチ）

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/navbar/navbar.css)

---

### 2-5. `src/pages/navbar/Modal_change_network.jsx`

**変更概要:**
- `class` → `className` に修正（React準拠）
- インラインスタイル → デザインシステムのCSS変数
- scaleInアニメーション追加

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/navbar/Modal_change_network.jsx)

---

### 2-6. `src/contract/login.jsx`

**変更概要:**
- Bootstrap ListGroup → カスタムウォレット選択UI
- 装飾的な背景オーブ（float animation）追加
- 接続中スピナー・エラー表示追加
- Polygon Amoyテストネット情報表示

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/login.jsx)

---

### 2-7. `src/contract/login.css`

**変更概要:**
- 背景オーブ（グラデーション球体）のスタイル
- グラスモーフィズムログインカード
- ウォレット選択ボタンのホバーエフェクト

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/login.css)

---

### 2-8. `src/contract/wait_Modal.jsx`

**変更概要:**
- `<font>` タグ → CSS変数ベースのスタイリング
- Bootstrap Button → デザインシステムの `btn-primary-custom`
- パルスバブル → リングスピナーアニメーション

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/wait_Modal.jsx)

---

### 2-9. `src/contract/wait_Modal.css`

**変更概要:**
- オーバーレイ背景にブラーエフェクト追加
- リングスピナー（2色グラデーション回転）
- ネットワーク切替モーダルのスタイル統合

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/contract/wait_Modal.css)

---

### 2-10. `src/pages/list_quiz/components/quiz_simple.jsx`

**変更概要:**
- マジックナンバー（`quiz[0]`〜`quiz[11]`）→ **名前付き変数**に分割代入
- ネストされた三項演算子 → **ヘルパー関数**（`getStatusLabel`, `getStatusClass`, `getBadgeClass`）に抽出
- `<a>` タグの非セマンティック使用 → `<Link>` + `<div>`
- ステータス別グロー（`glow-unanswered`, `glow-correct` 等）
- 時間表示の改善（アイコン + 色分け）

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/components/quiz_simple.jsx)

---

### 2-11. `src/pages/list_quiz/components/quiz_simple.css`

**変更概要:**
- 灰色フラットカード → グラスモーフィズム
- ステータス別の上部ラインカラー
- 時間バッジ（active/pending/ended）
- メタ情報（報酬/回答数/上限）のモダンレイアウト

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/components/quiz_simple.css)

---

### 2-12. `src/pages/list_quiz/list_quiz_top.jsx`

**変更概要:**
- ページヘッダー（タイトル + 説明文）追加
- `"now_loading"` テキスト → **スケルトンローディング**アニメーション
- `stagger-children` アニメーション適用
- CSS import追加

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/list_quiz/list_quiz_top.jsx)

---

### 2-13. `src/pages/answer_quiz/answer_quiz.jsx`

**変更概要:**
- `class="d-flex justify-content-end"` → `className`（React準拠）
- `<a>` タグの非セマンティック使用 → 適切な要素に変更
- 選択式回答: checkbox → **ラジオボタン付きカードUI**
- ステータスバナー追加（初回/不正解/正解済み）
- Markdown表示を `data-color-mode="dark"` に変更
- スケルトンローディング追加

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/answer_quiz/answer_quiz.jsx)

---

### 2-14. `src/pages/user_page/user_page.jsx`

**変更概要:**
- ページヘッダー（「マイページ」タイトル）追加
- `react-icons/lib` の不要 import 除去
- スケルトンローディング追加
- `stagger-children` アニメーション適用

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/user_page/user_page.jsx)

---

### 2-15. `src/pages/user_page/component/user_card.jsx`

**変更概要:**
- `if(true)` のデッドコード → **除去**
- `"margin-top"` → JSX標準の `marginTop`
- `Change_user` import（未使用）→ 除去
- 灰色フラットカード → 絵文字アイコン付き**スタッツグリッド**
- 「ウォレットにトークンを追加」ボタンのモダン化(btn-ghost)

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/user_page/component/user_card.jsx)

---

### 2-16. `src/pages/user_page/user_page.css`

**変更概要:**
- メディアクエリ重複（600px境界）→ CSS変数ベース
- `#d9d9d9` 灰色 → グラスモーフィズム
- `user_card`, `transaction_card` → グラスカード化
- スタッツグリッドのレスポンシブ対応（モバイルでは縦並び）

render_diffs(file:///c:/Users/takap/OneDrive%20-%20Chiba%20Institute%20of%20Technology/デスクトップ/web3-sotuken/src/pages/user_page/user_page.css)

---

## 検証結果

| テスト | 結果 |
|--------|------|
| `npm run build` | ✅ 成功（exit code 0） |
| 開発サーバー起動 | ✅ 成功（webpack compiled） |
| ダークテーマ背景描画 | ✅ 確認済み |

> [!NOTE]
> MetaMask入りのブラウザで完全な動作確認を行ってください。
