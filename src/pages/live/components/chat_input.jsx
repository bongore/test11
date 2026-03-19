import React, { useEffect, useRef, useState } from "react";
import Superchat_modal from "./superchat_modal";
import { AiOutlineSend } from "react-icons/ai";
import { FaMoneyBillWave } from "react-icons/fa";
import { ACTION_TYPES, appendActivityLog, getDraft, saveDraft, clearDraft } from "../../../utils/activityLog";
import "./chat.css";

const CHAT_DRAFT_KEY = "live_chat_message";
const BAD_WORDS = ["ばか", "あほ", "死ね", "くそ", "fuck", "shit", "bitch", "spam"];

function Chat_input({ onSendMessage, cont, isRegistered, isLoadingAuth }) {
    const [text, setText] = useState(() => getDraft(CHAT_DRAFT_KEY));
    const [showModal, setShowModal] = useState(false);
    const changeCountRef = useRef(0);

    useEffect(() => {
        if (text === "") {
            clearDraft(CHAT_DRAFT_KEY);
            appendActivityLog(ACTION_TYPES.LIVE_CHAT_DRAFT_CLEARED, {
                page: "live",
                reason: "empty_input",
            });
            return;
        }
        const timer = setTimeout(() => {
            saveDraft(CHAT_DRAFT_KEY, text);
            appendActivityLog(ACTION_TYPES.LIVE_CHAT_DRAFT_SAVED, {
                page: "live",
                contentLength: text.length,
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [text]);

    const containsBadWords = (inputText) => BAD_WORDS.some((word) => inputText.toLowerCase().includes(word.toLowerCase()));

    const handleInputChange = (value) => {
        setText(value);
        changeCountRef.current += 1;
        appendActivityLog(ACTION_TYPES.LIVE_CHAT_INPUT_CHANGED, {
            page: "live",
            contentLength: value.length,
            changeCount: changeCountRef.current,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;

        if (containsBadWords(trimmed)) {
            appendActivityLog(ACTION_TYPES.LIVE_MESSAGE_BLOCKED, {
                page: "live",
                channel: "live",
                reason: "bad_words",
                contentLength: trimmed.length,
                type: "normal",
            });
            alert("不適切な表現が含まれているため送信できません。");
            return;
        }

        onSendMessage(trimmed, "normal");
        appendActivityLog(ACTION_TYPES.LIVE_MESSAGE_SENT, {
            page: "live",
            contentLength: trimmed.length,
            channel: "live",
            draftUsed: Boolean(getDraft(CHAT_DRAFT_KEY)),
        });
        setText("");
        clearDraft(CHAT_DRAFT_KEY);
    };

    const handleSuperchat = (amount, message) => {
        const trimmed = (message || "").trim();
        if (trimmed && containsBadWords(trimmed)) {
            appendActivityLog(ACTION_TYPES.LIVE_MESSAGE_BLOCKED, {
                page: "live",
                reason: "bad_words",
                contentLength: trimmed.length,
                type: "superchat",
                amount,
            });
            alert("スーパーチャットのメッセージに不適切な表現が含まれています。");
            return;
        }
        onSendMessage(trimmed, "superchat", amount);
        appendActivityLog(ACTION_TYPES.LIVE_SUPERCHAT_SENT, {
            page: "live",
            contentLength: trimmed.length,
            amount,
            channel: "live",
        });
    };

    return (
        <div className="chat-input-wrapper">
            {isLoadingAuth ? (
                <div className="text-muted text-center py-2" style={{ fontSize: "14px" }}>
                    認証状態を確認中...
                </div>
            ) : !isRegistered ? (
                <div className="auth-warning glass-card text-center" style={{ padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-red)", background: "rgba(255, 50, 50, 0.1)" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#ff8888" }}>
                        コメントするには MetaMask を接続してください。
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="chat-form">
                    <input
                        type="text"
                        className="form-control-custom chat-input-field"
                        placeholder="コメントを入力..."
                        value={text}
                        maxLength={200}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                    <div className="chat-form-actions">
                        <div className="chat-draft-hint">{text ? `${text.length}/200` : "下書き自動保存"}</div>
                        <button
                            type="button"
                            className="btn-superchat"
                            onClick={() => {
                                setShowModal(true);
                                appendActivityLog(ACTION_TYPES.LIVE_MODAL_OPENED, { page: "live", modal: "superchat" });
                            }}
                            title="スーパーチャットを送る"
                        >
                            <FaMoneyBillWave />
                        </button>
                        <button type="submit" className="btn-primary btn-send">
                            <AiOutlineSend />
                        </button>
                    </div>
                </form>
            )}

            <Superchat_modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    appendActivityLog(ACTION_TYPES.LIVE_MODAL_CLOSED, { page: "live", modal: "superchat" });
                }}
                onSend={handleSuperchat}
                cont={cont}
            />
        </div>
    );
}

export default Chat_input;
