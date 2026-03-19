import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaMoneyBillWave } from "react-icons/fa";
import "./chat.css";

function Superchat_modal({ show, onHide, onSend, cont }) {
    const [amount, setAmount] = useState(10);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const amounts = [10, 50, 100, 500, 1000];

    const handleSend = async () => {
        if (amount <= 0 || message.trim() === "") return;
        
        setIsSending(true);
        try {
            // Call smart contract to send tokens
            await cont.send_superchat(amount);

            onSend(amount, message);
            setMessage("");
            setAmount(10);
            onHide();
        } catch (error) {
            console.error("Superchat failed:", error);
            alert("スーパーチャットの送信に失敗しました");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <div className="glass-card" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
                <Modal.Header closeButton style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "var(--space-4)" }}>
                    <Modal.Title className="heading-lg" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaMoneyBillWave style={{ color: "var(--accent-yellow)" }} /> 
                        スーパーチャットを送信
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body style={{ paddingTop: "var(--space-6)" }}>
                    <div className="mb-4">
                        <label className="text-muted" style={{ marginBottom: "var(--space-2)", display: "block" }}>
                            送信する金額 (TFT)
                        </label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
                            {amounts.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    className={`btn ${amount === preset ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setAmount(preset)}
                                    style={{ flex: 1, minWidth: "60px", padding: "8px" }}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            className="form-control-custom"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min="1"
                            style={{ color: "#222", backgroundColor: "#fff", border: "1px solid #ccc" }}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-muted" style={{ marginBottom: "var(--space-2)", display: "block" }}>
                            メッセージ
                        </label>
                        <textarea
                            className="form-control-custom"
                            rows="3"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="応援メッセージを入力..."
                            maxLength={100}
                            style={{ color: "#222", backgroundColor: "#fff", border: "1px solid #ccc" }}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: "none", padding: 0, marginTop: "var(--space-6)" }}>
                    <button 
                        className="btn-primary" 
                        style={{ width: "100%", padding: "16px", fontSize: "18px", fontWeight: "bold", background: "linear-gradient(135deg, var(--accent-yellow), #FF8C00)" }}
                        onClick={handleSend}
                        disabled={isSending || amount <= 0 || message.trim() === ""}
                    >
                        {isSending ? "送信中..." : `${amount} TFT を送る`}
                    </button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default Superchat_modal;
