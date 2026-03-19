import { Contracts_MetaMask } from "../../contract/contracts";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import MDEditor from "@uiw/react-md-editor";
import Wait_Modal from "../../contract/wait_Modal";
import "../create_quiz/create_quiz.css";

const { ethereum } = window;

function Edit_quiz() {
    const [id, setId] = useState(useParams()["id"]);
    const [owner, setOwner] = useState(null);

    const [title, setTitle] = useState("");
    const [explanation, setExplanation] = useState("");
    const [thumbnail_url, setThumbnail_url] = useState("");
    const [content, setContent] = useState("");
    const [reply_startline, setReply_startline] = useState(
        new Date()
            .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
            .replace(/[/]/g, "-")
            .replace(/\s(\d):/, " 0$1:"),
    );
    const [reply_deadline, setReply_deadline] = useState(getLocalizedDateTimeString(addDays(new Date(), 0)));
    let Contract = new Contracts_MetaMask();

    const [now, setnow] = useState(null);
    const [show, setShow] = useState(false);
    const [isteacher, setisteacher] = useState(null);

    const location = useLocation();
    const quiz = location.state.args;

    const edit_quiz = async () => {
        console.log(id, owner, title, explanation, thumbnail_url, content, reply_startline, reply_deadline);
        if (new Date(reply_startline).getTime() < new Date(reply_deadline).getTime()) {
            Contract.edit_quiz(id, owner, title, explanation, thumbnail_url, content, reply_startline, reply_deadline, setShow);
        } else {
            alert("回答開始日時を回答締切日時より前に設定してください");
        }
    };

    function getLocalizedDateTimeString(now = new Date()) {
        const formatter = new Intl.DateTimeFormat("ja-JP", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const localizedDateTimeString = formatter
            .format(now)
            .replace(/\u200E|\u200F/g, "")
            .replace(/\//g, "-")
            .replace(/ /, "T");

        return localizedDateTimeString;
    }

    function addDays(date, days) {
        date.setDate(date.getDate() + days);
        return date;
    }

    async function is_teacher() {
        setisteacher(await Contract.isTeacher());
    }

    useEffect(() => {
        console.log(id);
        setOwner(quiz[1]);
        setTitle(quiz[2]);
        setExplanation(quiz[3]);
        setThumbnail_url(quiz[4]);
        setContent(quiz[5]);
        setReply_startline(getLocalizedDateTimeString(new Date(quiz[8] * 1000)));
        setReply_deadline(getLocalizedDateTimeString(new Date(quiz[9] * 1000)));
        setnow(getLocalizedDateTimeString());
        is_teacher();
    }, []);

    if (isteacher) {
        return (
            <div className="quiz-form-page">
                <div className="page-header">
                    <h1 className="page-title">✏️ クイズを編集</h1>
                    <p className="page-subtitle">クイズID: {id} の内容を編集します</p>
                </div>

                <div className="quiz-form-card">
                    {/* タイトル */}
                    <div className="quiz-form-group">
                        <Form.Group controlId="form_titile" style={{ textAlign: "left" }}>
                            <Form.Label>📌 タイトル</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter Title" 
                                value={title} 
                                onChange={(event) => setTitle(event.target.value)} 
                            />
                        </Form.Group>
                    </div>

                    {/* 説明 */}
                    <div className="quiz-form-group">
                        <Form.Group style={{ textAlign: "left" }}>
                            <Form.Label>📄 説明</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={explanation.split("\n").length + 3} 
                                value={explanation} 
                                onChange={(event) => setExplanation(event.target.value)} 
                            />
                        </Form.Group>
                    </div>

                    {/* サムネイル */}
                    <div className="quiz-form-group">
                        <Form.Group style={{ textAlign: "left" }}>
                            <Form.Label>🖼️ サムネイル</Form.Label>
                            <Form.Control 
                                type="url" 
                                value={thumbnail_url} 
                                onChange={(event) => setThumbnail_url(event.target.value)} 
                            />
                        </Form.Group>
                        {thumbnail_url && (
                            <div className="thumbnail-preview">
                                <img src={thumbnail_url} alt="サムネイルプレビュー" />
                            </div>
                        )}
                    </div>

                    {/* 内容 */}
                    <div className="quiz-form-group">
                        <Form.Group data-color-mode="dark" style={{ textAlign: "left" }}>
                            <Form.Label>📋 内容</Form.Label>
                            <MDEditor height={500} value={content} onChange={setContent} />
                        </Form.Group>
                    </div>

                    {/* 日時設定 */}
                    <div className="quiz-form-group">
                        <div className="date-row">
                            <Form.Group style={{ textAlign: "left" }}>
                                <Form.Label>🕐 回答開始日時</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    defaultValue={reply_startline}
                                    onChange={(event) => setReply_startline(new Date(event.target.value))}
                                />
                            </Form.Group>

                            <Form.Group style={{ textAlign: "left" }}>
                                <Form.Label>⏰ 回答締切日時</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    defaultValue={reply_deadline}
                                    onChange={(event) => setReply_deadline(new Date(event.target.value))}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div className="submit-area">
                        <button className="btn-submit-quiz" onClick={() => edit_quiz()}>
                            💾 編集を保存
                        </button>
                    </div>
                </div>

                <Wait_Modal showFlag={show} />
            </div>
        );
    } else {
        return (<></>);
    }
}

export default Edit_quiz;