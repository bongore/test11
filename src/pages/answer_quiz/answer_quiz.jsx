import { useEffect, useMemo, useRef, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import Wait_Modal from "../../contract/wait_Modal";
import { Contracts_MetaMask } from "../../contract/contracts";
import { useAccessControl } from "../../utils/accessControl";
import {
    ACTION_TYPES,
    appendActivityLog,
    clearDraft,
    getDraft,
    logPageView,
    saveDraft,
} from "../../utils/activityLog";

function Show_correct(props) {
    if (!props.cont) return null;
    return (
        <div className="glass-card" style={{ marginTop: "var(--space-4)", padding: "var(--space-4)" }}>
            <span className="text-accent">正解: </span>
            <strong>{props.answer}</strong>
        </div>
    );
}

function Answer_type1(props) {
    return (
        <div className="answer-section">
            <h4 className="heading-md" style={{ marginBottom: "var(--space-4)", color: "#ffffff" }}>選択式回答</h4>
            <div className="answer-options">
                {props.quiz[6]
                    .split(",")
                    .filter((item) => item.trim() !== "")
                    .map((item) => (
                        <label
                            key={item}
                            className={`answer-option ${props.answer === item ? "answer-option--selected" : ""} ${props.disabled ? "opacity-75" : ""}`}
                            style={{
                                cursor: props.disabled ? "not-allowed" : "pointer",
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "var(--radius-sm)",
                                border: props.answer === item ? "1px solid var(--accent-blue)" : "1px solid transparent",
                                background: props.answer === item ? "rgba(30, 136, 229, 0.1)" : "transparent",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <input
                                type="radio"
                                name="quiz-answer"
                                value={item}
                                checked={props.answer === item}
                                onChange={() => props.onSelect(item)}
                                className="answer-radio"
                                disabled={props.disabled}
                            />
                            <span className="answer-text" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", marginLeft: "4px" }}>{item}</span>
                        </label>
                    ))}
            </div>
        </div>
    );
}

function Answer_type2(props) {
    const answerData = props.quiz[6].split(",");
    const pattern = answerData[0];
    const example = answerData[1];
    const [hasError, setHasError] = useState(true);

    const handleTestPattern = (value) => {
        const valid = new RegExp(pattern).test(value);
        setHasError(!valid);
        props.onValidation(valid, value.length);
    };

    return (
        <div className="answer-section">
            <h4 className="heading-md" style={{ marginBottom: "var(--space-4)", color: "#ffffff" }}>記述式回答</h4>
            <p style={{ marginBottom: "var(--space-2)", color: "#ffffff", opacity: 0.9 }}>例: {example}</p>
            <input
                type="text"
                className="form-control-custom"
                value={props.answer || ""}
                placeholder="回答を入力してください"
                disabled={props.disabled}
                onChange={(event) => {
                    if (props.disabled) return;
                    handleTestPattern(event.target.value);
                    props.onTextChange(event.target.value);
                }}
                style={{ cursor: props.disabled ? "not-allowed" : "text", opacity: props.disabled ? 0.7 : 1 }}
            />
            {!props.disabled && (
                <div
                    className={`answer-validation ${hasError ? "answer-validation--error" : "answer-validation--ok"}`}
                    style={{ color: hasError ? "var(--accent-red)" : "var(--accent-green)", marginTop: "var(--space-2)" }}
                >
                    {hasError ? "入力形式が正しくありません" : "入力形式は問題ありません"}
                </div>
            )}
        </div>
    );
}

function Answer_quiz() {
    const [answer, setAnswer] = useState("");
    const [now, setNow] = useState(null);
    const [show, setShow] = useState(false);
    const [content, setContent] = useState("");
    const [isCorrectShow, setIsCorrectShow] = useState(false);
    const [savedAnswerStr, setSavedAnswerStr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [simpleQuiz, setSimpleQuiz] = useState(null);
    const [draftSavedAt, setDraftSavedAt] = useState("");
    const [loadDurationMs, setLoadDurationMs] = useState(null);
    const [loadError, setLoadError] = useState("");
    const contract = useMemo(() => new Contracts_MetaMask(), []);
    const access = useAccessControl(contract);
    const id = useParams().id;
    const draftKey = `quiz_answer_${id}`;
    const pageOpenedAtRef = useRef(Date.now());
    const answerStartedAtRef = useRef(null);
    const textChangeCountRef = useRef(0);

    const convertFullWidthNumbersToHalf = (text) => {
        const full = "０１２３４５６７８９";
        const half = "0123456789";
        return String(text || "").replace(/[０-９]/g, (char) => half[full.indexOf(char)] || char);
    };

    const markAnswerInputStarted = (mode) => {
        if (!answerStartedAtRef.current) {
            answerStartedAtRef.current = Date.now();
            appendActivityLog(ACTION_TYPES.ANSWER_INPUT_STARTED, {
                page: "answer_quiz",
                quizId: id,
                mode,
            });
        }
    };

    const handleSelectOption = (value) => {
        markAnswerInputStarted("choice");
        setAnswer(value);
        appendActivityLog(ACTION_TYPES.ANSWER_OPTION_SELECTED, {
            page: "answer_quiz",
            quizId: id,
            value,
            valueLength: value.length,
        });
    };

    const handleTextChange = (value) => {
        markAnswerInputStarted("text");
        setAnswer(value);
        textChangeCountRef.current += 1;
        appendActivityLog(ACTION_TYPES.ANSWER_TEXT_CHANGED, {
            page: "answer_quiz",
            quizId: id,
            textLength: value.length,
            changeCount: textChangeCountRef.current,
        });
    };

    const handleValidation = (valid, textLength) => {
        appendActivityLog(ACTION_TYPES.ANSWER_PATTERN_VALIDATION, {
            page: "answer_quiz",
            quizId: id,
            valid,
            textLength,
        });
    };

    const get_quiz = async () => {
        const startedAt = performance.now();
        setLoadError("");
        appendActivityLog(ACTION_TYPES.QUIZ_LOAD_STARTED, {
            page: "answer_quiz",
            quizId: id,
        });

        try {
            const quizData = await contract.get_quiz(id);
            const simpleQuizData = await contract.get_quiz_simple(id);
            setQuiz(quizData);
            setSimpleQuiz(simpleQuizData);

            if (Number(simpleQuizData[10]) !== 0) {
                try {
                    const confirmedAnswer = await contract.get_confirm_answer(id);
                    const normalized = Array.isArray(confirmedAnswer) ? confirmedAnswer.join(",") : confirmedAnswer;
                    setSavedAnswerStr(normalized || "");
                    setAnswer(normalized || "");
                } catch (error) {
                    console.error("Failed to fetch confirm answer", error);
                }
            } else {
                const draft = getDraft(draftKey);
                if (draft) {
                    setAnswer(draft);
                    appendActivityLog(ACTION_TYPES.ANSWER_DRAFT_RESTORED, {
                        page: "answer_quiz",
                        quizId: id,
                        answerLength: draft.length,
                    });
                }
            }

            const durationMs = Math.round(performance.now() - startedAt);
            setLoadDurationMs(durationMs);
            appendActivityLog(ACTION_TYPES.QUIZ_LOAD_SUCCESS, {
                page: "answer_quiz",
                quizId: id,
                durationMs,
            });
            appendActivityLog(ACTION_TYPES.PERFORMANCE_SAMPLE, {
                page: "answer_quiz",
                category: "quiz_load",
                quizId: id,
                durationMs,
            });
        } catch (error) {
            console.error(error);
            setLoadError("問題データの読み込みに失敗しました。通信状態を確認して再試行してください。");
            appendActivityLog(ACTION_TYPES.QUIZ_LOAD_FAILURE, {
                page: "answer_quiz",
                quizId: id,
                errorMessage: error?.message || "quiz_load_failed",
                durationMs: Math.round(performance.now() - startedAt),
            });
        }
    };

    const create_answer = async () => {
        if (!quiz) return;

        if (quiz[15] === true) {
            setIsCorrectShow(true);
            appendActivityLog(ACTION_TYPES.QUIZ_CORRECT_REVEALED, {
                page: "answer_quiz",
                quizId: id,
                source: "already_correct",
            });
            return;
        }

        if (parseInt(quiz[8], 10).toString() > now) {
            appendActivityLog(ACTION_TYPES.ANSWER_BLOCKED_BEFORE_START, {
                page: "answer_quiz",
                quizId: id,
                now,
                replyStart: String(quiz[8]),
            });
            alert("まだ回答開始時間になっていません。");
            return;
        }

        setIsSubmitting(true);
        const startedAt = performance.now();
        const finalAnswer = convertFullWidthNumbersToHalf(answer);
        appendActivityLog(ACTION_TYPES.ANSWER_SUBMIT_CLICKED, {
            page: "answer_quiz",
            quizId: id,
            answerLength: finalAnswer.length,
            answerType: Number(quiz[13]) === 0 ? "choice" : "text",
        });

        try {
            await contract.create_answer(id, finalAnswer, setShow, setContent);
            clearDraft(draftKey);
            appendActivityLog(ACTION_TYPES.ANSWER_DRAFT_CLEARED, {
                page: "answer_quiz",
                quizId: id,
                reason: "submit_success",
            });
            appendActivityLog(ACTION_TYPES.ANSWER_SUBMITTED, {
                page: "answer_quiz",
                quizId: id,
                answerLength: finalAnswer.length,
                answerType: Number(quiz[13]) === 0 ? "choice" : "text",
                openedAt: new Date(pageOpenedAtRef.current).toISOString(),
                startedAt: answerStartedAtRef.current ? new Date(answerStartedAtRef.current).toISOString() : null,
                totalDurationSeconds: Math.round((Date.now() - pageOpenedAtRef.current) / 1000),
                solvingDurationSeconds: answerStartedAtRef.current ? Math.round((Date.now() - answerStartedAtRef.current) / 1000) : null,
                submitDurationMs: Math.round(performance.now() - startedAt),
            });
        } catch (error) {
            console.error(error);
            appendActivityLog(ACTION_TYPES.ANSWER_SUBMIT_FAILED, {
                page: "answer_quiz",
                quizId: id,
                answerLength: finalAnswer.length,
                errorMessage: error?.message || "answer_submit_failed",
                submitDurationMs: Math.round(performance.now() - startedAt),
            });
            alert("回答送信に失敗しました。ウォレットの確認や通信状態を確認してください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (access.isLoading || !access.canAnswerQuiz) return;
        pageOpenedAtRef.current = Date.now();
        answerStartedAtRef.current = null;
        textChangeCountRef.current = 0;
        logPageView("answer_quiz", { action: ACTION_TYPES.QUIZ_PAGE_VIEWED, quizId: id });
        appendActivityLog(ACTION_TYPES.QUIZ_PAGE_VIEWED, {
            page: "answer_quiz",
            quizId: id,
        });
        get_quiz();
        setNow(Math.floor(Date.now() / 1000));
        // contract instance is intentionally recreated locally.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [access.canAnswerQuiz, access.isLoading, id]);

    useEffect(() => {
        if (!answer || !simpleQuiz || Number(simpleQuiz[10]) !== 0) return;
        const timer = setTimeout(() => {
            saveDraft(draftKey, answer);
            const nowLabel = new Date().toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            setDraftSavedAt(nowLabel);
            appendActivityLog(ACTION_TYPES.ANSWER_DRAFT_SAVED, {
                page: "answer_quiz",
                quizId: id,
                answerLength: answer.length,
                savedAtLabel: nowLabel,
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [answer, draftKey, id, simpleQuiz]);

    useEffect(() => {
        if (!simpleQuiz) return;
        const localCachedAnswer = localStorage.getItem(`quiz_${id}_answer`);
        const isLocallyAnswered = Boolean(localCachedAnswer);
        const rawStatus = Number(simpleQuiz[10]);
        const derivedStatus = rawStatus === 0 && isLocallyAnswered ? 3 : rawStatus;
        appendActivityLog(ACTION_TYPES.QUIZ_STATUS_DETECTED, {
            page: "answer_quiz",
            quizId: id,
            rawStatus,
            derivedStatus,
            hasLocalCachedAnswer: isLocallyAnswered,
        });
    }, [id, simpleQuiz]);

    if (access.isLoading) {
        return (
            <div className="answer-page">
                <div className="glass-card" style={{ padding: "var(--space-6)" }}>
                    権限を確認中です...
                </div>
            </div>
        );
    }

    if (!access.canAnswerQuiz) {
        return (
            <div className="answer-page">
                <div className="glass-card" style={{ padding: "var(--space-6)" }}>
                    <h3 className="heading-md">解答権限がありません</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
                        問題解答は登録済みユーザー、または先生 / TA のみ利用できます。
                    </p>
                </div>
            </div>
        );
    }

    if (!quiz || !simpleQuiz) {
        return (
            <div className="answer-page">
                {loadError ? (
                    <div className="glass-card" style={{ padding: "var(--space-6)" }}>
                        <h3 className="heading-md">読み込みエラー</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>{loadError}</p>
                        <button
                            className="btn-primary-custom"
                            onClick={() => {
                                appendActivityLog(ACTION_TYPES.QUIZ_RETRY_CLICKED, { page: "answer_quiz", quizId: id });
                                get_quiz();
                            }}
                        >
                            再読み込み
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="skeleton skeleton-card" style={{ height: "60px" }}></div>
                        <div className="skeleton skeleton-card" style={{ height: "400px" }}></div>
                    </>
                )}
            </div>
        );
    }

    const localCachedAnswer = localStorage.getItem(`quiz_${id}_answer`);
    const isLocallyAnswered = Boolean(localCachedAnswer);
    const rawStatus = Number(simpleQuiz[10]);
    const status = rawStatus === 0 && isLocallyAnswered ? 3 : rawStatus;
    const savedAnswerDisplay = savedAnswerStr || localCachedAnswer || "";
    const visibleDraft = status === 0 ? answer : "";
    const statusMessages = {
        0: { text: "未回答です。回答後に結果を確認してください。", className: "status-first" },
        1: { text: "回答済みです。必要なら正解を確認してください。", className: "status-wrong" },
        2: { text: "正解済みです。", className: "status-correct" },
        3: { text: "このブラウザでは回答済みの記録があります。", className: "status-first" },
    };
    const statusInfo = statusMessages[status] || { text: "", className: "" };

    return (
        <div className="answer-page animate-fadeIn">
            {statusInfo.text && (
                <div className={`answer-status-banner glass-card ${statusInfo.className}`} style={{ color: "#ffffff", fontWeight: "600", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                    {statusInfo.text}
                </div>
            )}

            <div className="quiz-detail-card glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
                    <h2 className="heading-lg" style={{ marginBottom: 0 }}>{quiz[2]}</h2>
                    <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "14px" }}>
                        <span>読込時間: {loadDurationMs == null ? "-" : `${loadDurationMs}ms`}</span>
                        <span>下書き保存: {draftSavedAt || "未保存"}</span>
                    </div>
                </div>

                {quiz[3] && (
                    <p style={{ whiteSpace: "pre-wrap", marginBottom: "var(--space-4)", color: "#ffffff", opacity: 0.9 }}>
                        {quiz[3]}
                    </p>
                )}

                <div style={{ marginBottom: "var(--space-6)", color: "#ffffff", opacity: 0.9 }}>
                    <span>出題時刻: </span>
                    <span className="text-accent">{quiz[1] ? `${quiz[1].slice(0, 10)}...` : ""}</span>
                </div>

                <div data-color-mode="dark" style={{ marginBottom: "var(--space-6)" }}>
                    <MDEditor.Markdown source={quiz[5]} />
                </div>

                {Number(quiz[13]) === 0 && (
                    <Answer_type1
                        quiz={quiz}
                        answer={answer}
                        onSelect={handleSelectOption}
                        disabled={status !== 0 || isSubmitting}
                    />
                )}
                {Number(quiz[13]) === 1 && (
                    <Answer_type2
                        quiz={quiz}
                        answer={answer}
                        onTextChange={handleTextChange}
                        onValidation={handleValidation}
                        disabled={status !== 0 || isSubmitting}
                    />
                )}

                {status === 0 ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "var(--space-6)", gap: "var(--space-4)", flexWrap: "wrap" }}>
                        <button className="btn-primary-custom" onClick={create_answer} disabled={isSubmitting || !answer}>
                            {isSubmitting ? "送信中..." : "回答を送信"}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
                        <button className="btn-secondary-custom" disabled style={{ cursor: "not-allowed", opacity: 0.6 }}>
                            回答済み
                        </button>
                    </div>
                )}

                {status === 0 && visibleDraft && (
                    <div className="glass-card" style={{ marginTop: "var(--space-4)", padding: "var(--space-4)" }}>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "var(--space-2)" }}>
                            現在の下書き内容
                        </div>
                        <div style={{ color: "#ffffff", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {visibleDraft}
                        </div>
                    </div>
                )}

                {status !== 0 && savedAnswerDisplay && (
                    <div className="glass-card" style={{ marginTop: "var(--space-4)", padding: "var(--space-4)" }}>
                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>あなたの回答: </span>
                        <strong style={{ color: "#ffffff", fontSize: "16px" }}>{savedAnswerDisplay}</strong>
                    </div>
                )}

                <Show_correct cont={isCorrectShow} answer={quiz[14]} />
            </div>

            <Wait_Modal showFlag={show} content={content} />
        </div>
    );
}

export default Answer_quiz;
