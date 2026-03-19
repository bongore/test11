# 2026-03-18 日本語表記統一

## 概要
- 直近の改修で追加した英語UI文言を日本語へ統一しました。
- 管理画面のログ種別表示を内部コードではなく日本語ラベル表示に変更しました。
- ログイン画面、解答画面、ライブログ、待機モーダル、問題一覧の追加文言を日本語化しました。

## 変更対象
- `src/pages/answer_quiz/answer_quiz.jsx`
- `src/contract/wait_Modal.jsx`
- `src/pages/admin_page/admin.jsx`
- `src/pages/admin_page/components/view_login_logs.jsx`
- `src/pages/admin_page/components/view_answer_logs.jsx`
- `src/pages/admin_page/components/view_live_logs.jsx`
- `src/pages/live/components/chat_input.jsx`
- `src/pages/list_quiz/components/quiz_simple.jsx`
- `src/contract/login.jsx`
- `src/contract/contracts.jsx`
- `src/utils/activityLog.js`

## 補足
- 元のソースは変更せず、`_codex_working_copy` 側のみ更新しています。
- 変更履歴は今後も `docs/change_history` 配下に追加していきます。
