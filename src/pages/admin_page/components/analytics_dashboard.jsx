import React, { useEffect, useMemo, useState } from "react";
import {
    ACTION_TYPES,
    clearActivityLogs,
    exportLogsAsCsv,
    exportLogsAsJson,
    formatActionLabel,
    formatDateTime,
    getActivityLogs,
} from "../../../utils/activityLog";
import "./activity_logs.css";

function average(values) {
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalizeAddress(value) {
    return String(value || "").trim().toLowerCase();
}

function makeInternalId(prefix, index) {
    return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function buildActorDirectory(students, staffs) {
    const directory = {};
    staffs.forEach((address, index) => {
        directory[normalizeAddress(address)] = {
            role: "staff",
            roleLabel: "先生 / TA",
            internalId: makeInternalId("STAFF", index),
            address,
        };
    });

    students.forEach((address, index) => {
        const key = normalizeAddress(address);
        if (!directory[key]) {
            directory[key] = {
                role: "user",
                roleLabel: "ユーザー",
                internalId: makeInternalId("USER", index),
                address,
            };
        }
    });

    return directory;
}

function resolveActorMeta(log, directory) {
    const candidate = normalizeAddress(log.actor && !String(log.actor).startsWith("guest:") ? log.actor : (log.address || ""));
    if (candidate && directory[candidate]) {
        return directory[candidate];
    }

    if (candidate) {
        return {
            role: "user",
            roleLabel: "ユーザー",
            internalId: `USER-TEMP-${candidate.slice(-4).toUpperCase()}`,
            address: log.actor || log.address || "",
        };
    }

    const guestSource = String(log.actor || log.sessionId || "guest");
    const suffix = guestSource.replace("guest:", "").slice(-6).toUpperCase();
    return {
        role: "guest",
        roleLabel: "未接続",
        internalId: `GUEST-${suffix || "LOCAL"}`,
        address: "-",
    };
}

function stringifyDetails(log) {
    const ignored = new Set([
        "id", "action", "actor", "createdAt", "sessionId", "route", "url", "referrer",
        "online", "userAgent", "viewportWidth", "viewportHeight", "language", "timezone",
        "actorMeta",
    ]);
    return Object.entries(log)
        .filter(([key, value]) => !ignored.has(key) && value !== "" && value != null)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(" | ");
}

function groupActorAction(logs) {
    const counts = new Map();
    logs.forEach((log) => {
        const key = `${log.actorMeta.internalId}__${log.action}`;
        const current = counts.get(key) || {
            internalId: log.actorMeta.internalId,
            roleLabel: log.actorMeta.roleLabel,
            action: log.action,
            label: formatActionLabel(log.action),
            count: 0,
        };
        current.count += 1;
        counts.set(key, current);
    });
    return [...counts.values()].sort((a, b) => b.count - a.count);
}

function Analytics_dashboard({ cont }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [actionFilter, setActionFilter] = useState("all");
    const [pageFilter, setPageFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [actorFilter, setActorFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const logs = getActivityLogs();

    useEffect(() => {
        let mounted = true;
        const loadActors = async () => {
            try {
                const [studentList, staffList] = await Promise.all([
                    cont?.get_student_list?.(),
                    cont?.get_teachers?.(),
                ]);
                if (!mounted) return;
                setStudents(Array.isArray(studentList) ? studentList : []);
                setStaffs(Array.isArray(staffList) ? staffList : []);
            } catch (error) {
                console.error("Failed to load actor directory", error);
                if (!mounted) return;
                setStudents([]);
                setStaffs([]);
            }
        };

        loadActors();
        return () => {
            mounted = false;
        };
    }, [cont]);

    const actorDirectory = useMemo(() => buildActorDirectory(students, staffs), [students, staffs]);

    const enrichedLogs = useMemo(() => logs.map((log) => ({
        ...log,
        actorMeta: resolveActorMeta(log, actorDirectory),
    })), [logs, actorDirectory]);

    const summary = useMemo(() => {
        const loginSuccess = enrichedLogs.filter((log) => log.action === ACTION_TYPES.LOGIN_SUCCESS).length;
        const answerSubmitted = enrichedLogs.filter((log) => log.action === ACTION_TYPES.ANSWER_SUBMITTED).length;
        const liveMessages = enrichedLogs.filter((log) => (
            log.action === ACTION_TYPES.LIVE_MESSAGE_SENT
            || log.action === ACTION_TYPES.LIVE_SUPERCHAT_SENT
            || log.action === ACTION_TYPES.LIVE_DUMMY_MESSAGE_EMITTED
        )).length;
        const quizLoads = enrichedLogs
            .filter((log) => log.action === ACTION_TYPES.QUIZ_LOAD_SUCCESS && typeof log.durationMs === "number")
            .map((log) => log.durationMs);
        const submissions = enrichedLogs
            .filter((log) => log.action === ACTION_TYPES.ANSWER_SUBMITTED && typeof log.submitDurationMs === "number")
            .map((log) => log.submitDurationMs);

        return {
            totalLogs: enrichedLogs.length,
            loginSuccess,
            answerSubmitted,
            liveMessages,
            avgQuizLoadMs: average(quizLoads),
            avgSubmitMs: average(submissions),
        };
    }, [enrichedLogs]);

    const actionSummary = useMemo(() => {
        const counts = new Map();
        enrichedLogs.forEach((log) => {
            counts.set(log.action, (counts.get(log.action) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([action, count]) => ({
                action,
                label: formatActionLabel(action),
                count,
            }));
    }, [enrichedLogs]);

    const pageOptions = useMemo(() => [...new Set(enrichedLogs.map((log) => log.page).filter(Boolean))].sort(), [enrichedLogs]);
    const actorOptions = useMemo(() => {
        return [...new Set(enrichedLogs.map((log) => log.actorMeta.internalId).filter(Boolean))].sort();
    }, [enrichedLogs]);

    const filteredLogs = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return enrichedLogs.filter((log) => {
            const searchable = [
                stringifyDetails(log),
                log.action,
                formatActionLabel(log.action),
                log.page || "",
                log.quizId || "",
                log.actorMeta.internalId,
                log.actorMeta.roleLabel,
                log.actorMeta.address,
            ].join(" ").toLowerCase();

            if (actionFilter !== "all" && log.action !== actionFilter) return false;
            if (pageFilter !== "all" && log.page !== pageFilter) return false;
            if (roleFilter !== "all" && log.actorMeta.role !== roleFilter) return false;
            if (actorFilter !== "all" && log.actorMeta.internalId !== actorFilter) return false;
            if (!normalizedSearch) return true;
            return searchable.includes(normalizedSearch);
        });
    }, [enrichedLogs, actionFilter, pageFilter, roleFilter, actorFilter, searchTerm]);

    const filteredActorActionSummary = useMemo(() => groupActorAction(filteredLogs), [filteredLogs]);

    const handleClear = () => {
        clearActivityLogs();
        setRefreshKey((current) => current + 1);
        setActionFilter("all");
        setPageFilter("all");
        setRoleFilter("all");
        setActorFilter("all");
        setSearchTerm("");
    };

    return (
        <div key={refreshKey}>
            <h3 className="section-title">分析ログ</h3>
            <p className="section-desc">
                先生 / TA のみが利用者識別番号を確認できます。ログは `USER-*`、`STAFF-*`、`GUEST-*` 単位で検索・集計できます。
            </p>

            <div className="analytics-grid">
                <div className="analytics-card"><div className="analytics-label">総ログ件数</div><div className="analytics-value">{summary.totalLogs}</div></div>
                <div className="analytics-card"><div className="analytics-label">ログイン成功</div><div className="analytics-value">{summary.loginSuccess}</div></div>
                <div className="analytics-card"><div className="analytics-label">回答送信</div><div className="analytics-value">{summary.answerSubmitted}</div></div>
                <div className="analytics-card"><div className="analytics-label">ライブ送信</div><div className="analytics-value">{summary.liveMessages}</div></div>
                <div className="analytics-card"><div className="analytics-label">平均読込時間</div><div className="analytics-value">{summary.avgQuizLoadMs}ms</div></div>
                <div className="analytics-card"><div className="analytics-label">平均送信待ち</div><div className="analytics-value">{summary.avgSubmitMs}ms</div></div>
            </div>

            <div className="analytics-actions">
                <button className="btn-action" onClick={exportLogsAsCsv}>CSV を出力</button>
                <button className="btn-action" onClick={exportLogsAsJson}>JSON を出力</button>
                <button className="btn-action" onClick={handleClear}>ログを初期化</button>
            </div>

            <div className="analytics-filters">
                <input
                    className="form-control"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="識別番号、権限、行動、詳細、クイズIDで検索"
                />
                <select className="form-control" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
                    <option value="all">すべての行動</option>
                    {actionSummary.map((item) => (
                        <option key={item.action} value={item.action}>{item.label}</option>
                    ))}
                </select>
                <select className="form-control" value={pageFilter} onChange={(event) => setPageFilter(event.target.value)}>
                    <option value="all">すべてのページ</option>
                    {pageOptions.map((page) => (
                        <option key={page} value={page}>{page}</option>
                    ))}
                </select>
                <select className="form-control" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                    <option value="all">すべての権限</option>
                    <option value="user">ユーザー</option>
                    <option value="staff">先生 / TA</option>
                    <option value="guest">未接続</option>
                </select>
                <select className="form-control" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)}>
                    <option value="all">すべての識別番号</option>
                    {actorOptions.map((actor) => (
                        <option key={actor} value={actor}>{actor}</option>
                    ))}
                </select>
            </div>

            {actionSummary.length > 0 && (
                <div className="results-table-wrap" style={{ marginBottom: "var(--space-6)" }}>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>行動</th>
                                <th>ログキー</th>
                                <th>件数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionSummary.map((item) => (
                                <tr key={item.action}>
                                    <td>{item.label}</td>
                                    <td>{item.action}</td>
                                    <td>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredActorActionSummary.length > 0 && (
                <div className="results-table-wrap" style={{ marginBottom: "var(--space-6)" }}>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>識別番号</th>
                                <th>権限</th>
                                <th>行動</th>
                                <th>件数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActorActionSummary.map((item) => (
                                <tr key={`${item.internalId}-${item.action}`}>
                                    <td className="analytics-text">{item.internalId}</td>
                                    <td>{item.roleLabel}</td>
                                    <td>{item.label}</td>
                                    <td>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredLogs.length === 0 ? (
                <div className="analytics-empty">対象に一致するログがありません。</div>
            ) : (
                <div className="results-table-wrap">
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>時刻</th>
                                <th>識別番号</th>
                                <th>権限</th>
                                <th>ウォレット</th>
                                <th>行動</th>
                                <th>ページ</th>
                                <th>対象ID</th>
                                <th>経過時間</th>
                                <th>詳細</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{formatDateTime(log.createdAt)}</td>
                                    <td className="analytics-text">{log.actorMeta.internalId}</td>
                                    <td>{log.actorMeta.roleLabel}</td>
                                    <td className="analytics-text">{log.actorMeta.address}</td>
                                    <td>{formatActionLabel(log.action)}</td>
                                    <td>{log.page || "-"}</td>
                                    <td>{log.quizId || "-"}</td>
                                    <td>{log.durationMs || log.submitDurationMs || "-"}</td>
                                    <td className="analytics-text">{stringifyDetails(log) || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="analytics-table-note">
                        表示中 {filteredLogs.length} 件 / 全体 {logs.length} 件
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analytics_dashboard;
