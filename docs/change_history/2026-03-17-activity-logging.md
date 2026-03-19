# 2026-03-17 Activity Logging and Admin Log Pages

## Summary
- Added persistent client-side activity logging based on `localStorage`.
- Added admin log pages for login activity, answer activity, and live comment activity.
- Added answer-session timing capture for quiz solving start/end and total duration.
- Added a standing change-history record so each implementation change can be tracked in the workspace.

## Changed Areas
- `src/utils/activityLog.js`
- `src/contract/login.jsx`
- `src/pages/answer_quiz/answer_quiz.jsx`
- `src/pages/live/live.jsx`
- `src/pages/admin_page/admin.jsx`
- `src/pages/admin_page/components/view_login_logs.jsx`
- `src/pages/admin_page/components/view_answer_logs.jsx`
- `src/pages/admin_page/components/view_live_logs.jsx`
- `src/pages/admin_page/components/activity_logs.css`

## Logging Model
- `login_success`
- `login_failure`
- `answer_viewed`
- `answer_started`
- `answer_submitted`
- `answer_submit_failed`
- `live_comment`
- `live_superchat`

## Notes
- Logs are stored per browser in `localStorage`, so they are suitable for research/demo inspection in the current architecture.
- If centralized logging is needed later, the same event model can be forwarded to a backend or contract-adjacent service.
