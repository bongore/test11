import React, { useEffect, useState } from "react";
import { formatDateTime } from "../../../utils/activityLog";
import { getLiveBroadcastHistory, subscribeToLiveBroadcast } from "../../../utils/liveBroadcast";
import "./activity_logs.css";

function formatDurationMs(durationMs) {
    if (!durationMs || durationMs < 0) return "-";
    const totalSeconds = Math.round(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分 ${seconds}秒`;
}

function View_live_history() {
    const [history, setHistory] = useState(() => getLiveBroadcastHistory());

    useEffect(() => {
        const sync = () => setHistory(getLiveBroadcastHistory());
        const unsubscribe = subscribeToLiveBroadcast(sync);
        sync();
        return unsubscribe;
    }, []);

    return (
        <div className="log-section">
            <h3 className="section-title">配信履歴</h3>
            <p className="section-desc">
                先生 / TA が開始したライブ出力セッションの履歴です。必要なときだけ管理画面から確認できます。
            </p>

            <div className="log-summary-grid">
                <div className="log-summary-card"><div className="log-summary-label">配信回数</div><div className="log-summary-value">{history.length}</div></div>
                <div className="log-summary-card"><div className="log-summary-label">最新開始</div><div className="log-summary-value">{history[0] ? formatDateTime(history[0].startedAt) : "-"}</div></div>
            </div>

            {history.length === 0 ? (
                <div className="log-empty">まだ配信履歴はありません。</div>
            ) : (
                <div className="results-table-wrap">
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>開始</th>
                                <th>終了</th>
                                <th>配信者</th>
                                <th>ロール</th>
                                <th>時間</th>
                                <th>モード</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id}>
                                    <td>{formatDateTime(item.startedAt)}</td>
                                    <td>{formatDateTime(item.endedAt)}</td>
                                    <td className="address-cell">{item.broadcasterAddress || "-"}</td>
                                    <td>{item.broadcasterRole || "-"}</td>
                                    <td>{formatDurationMs(item.durationMs)}</td>
                                    <td>{item.outputType || "camera"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default View_live_history;
