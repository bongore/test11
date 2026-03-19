import React, { useEffect, useRef, useState } from "react";
import "./chat.css";

function Chat_feed({ messages }) {
    const feedEndRef = useRef(null);

    const [isAtBottom, setIsAtBottom] = useState(true);

    // 金額に応じたスーパーチャットのカラークラスを取得
    const getSuperchatColorClass = (amount) => {
        if (amount >= 1000) return "superchat-red";
        if (amount >= 500) return "superchat-magenta";
        if (amount >= 100) return "superchat-orange";
        if (amount >= 50) return "superchat-green";
        return "superchat-blue";
    };

    // Auto-scroll to bottom only if user was already at the bottom
    useEffect(() => {
        if (isAtBottom && feedEndRef.current) {
            feedEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isAtBottom]);

    // Track scroll position to determine if user is reading past history
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // 50px の誤差を許容して一番下にいるか判定
        const isBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsAtBottom(isBottom);
    };

    return (
        <div className="chat-feed" onScroll={handleScroll} style={{ overflowY: 'auto', height: '100%', paddingRight: '12px' }}>
            {messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.type === "superchat" ? `chat-superchat ${getSuperchatColorClass(msg.amount)}` : ""}`}>
                    {msg.type === "superchat" && (
                        <div className="superchat-header">
                            <span className="superchat-amount">¥{msg.amount} TFT</span>
                            <span className="superchat-user">{msg.user}</span>
                        </div>
                    )}
                    <div className="chat-message-content">
                        {msg.type !== "superchat" && (
                            <span className="chat-user text-muted">{msg.user}: </span>
                        )}
                        <span className="chat-text" style={{ color: "#ffffff", opacity: 0.9 }}>{msg.text}</span>
                    </div>
                </div>
            ))}
            <div ref={feedEndRef} />
        </div>
    );
}

export default Chat_feed;
