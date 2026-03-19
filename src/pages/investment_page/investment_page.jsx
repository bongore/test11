import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Contracts_MetaMask } from "../../contract/contracts";
import "./investment_page.css";

function Investment_to_quiz() {
    const location = useLocation();

    const [id, setId] = useState(location.state.args[0]);
    const [amount, setAmount] = useState(0);
    const [isNotPayingOut, setIsNotPayingOut] = useState("true");
    const [numOfStudent, setNumOfStudent] = useState(0);
    const [answer, setAnswer] = useState("");
    const [isteacher, setisteacher] = useState(null);
    const [isNotAddingReward, setIsNotAddingReward] = useState("true");
    const [students, setStudents] = useState(null);

    let Contract = new Contracts_MetaMask();

    const handleOptionChange = (event) => {
        setIsNotPayingOut(event.target.value);
    };

    const adding_reward = (event) => {
        setIsNotAddingReward(event.target.value);
    };

    const convertFullWidthNumbersToHalf = (() => {
        const diff = "０".charCodeAt(0) - "0".charCodeAt(0);
        return text => text.replace(
            /[０-９]/g,
            m => String.fromCharCode(m.charCodeAt(0) - diff)
        );
    })();

    const investment_to_quiz = async () => {
        if ((answer === "" && isNotPayingOut === "false") === false) {
            Contract.investment_to_quiz(id, amount, convertFullWidthNumbersToHalf(answer), isNotPayingOut, numOfStudent, isNotAddingReward, students);
        } else {
            alert("答えを入力してください");
        }
    };

    useEffect(() => {
        async function init() {
            setNumOfStudent((await Contract.get_num_of_students()) + 30);
            setisteacher(await Contract.isTeacher());
            setStudents(await Contract.get_student_list());
        }
        init();
    }, []);

    if (isteacher) {
        return (
            <div className="investment-page">
                <div className="page-header">
                    <h1 className="page-title">💰 報酬の管理</h1>
                    <p className="page-subtitle">クイズの報酬追加と払い出しの設定</p>
                </div>

                <div className="investment-card">
                    <div className="quiz-id-badge">
                        📋 クイズID: {id}
                    </div>

                    {/* 報酬額の設定 */}
                    <div className="invest-section">
                        <div className="invest-section-title">報酬額の設定</div>
                        <div className="invest-section-desc">追加するTFTトークンの量を指定してください</div>
                        <input
                            type="text"
                            className="form-control"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="報酬額を入力"
                        />
                        <div className="token-info">
                            <div className="token-info-item">
                                <div className="token-info-label">1人あたりの報酬</div>
                                <div className="token-info-value">{amount} TFT</div>
                            </div>
                            <div className="token-info-item">
                                <div className="token-info-label">あなたからの総払出量</div>
                                <div className="token-info-value">{amount * numOfStudent} TFT</div>
                            </div>
                        </div>
                    </div>

                    {/* 正解の入力 */}
                    <div className="invest-section">
                        <div className="invest-section-title">正解の確定</div>
                        <div className="invest-section-desc">確定する正解を入力してください</div>
                        <input
                            type="text"
                            className="form-control"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            placeholder="正解を入力"
                        />
                    </div>

                    {/* 払い出しオプション */}
                    <div className="invest-section">
                        <div className="invest-section-title">報酬の払い出し</div>
                        <div className="invest-section-desc">解答を確定して報酬の払い出しを行うか選択してください</div>
                        <div className="radio-group">
                            <label className={`radio-option ${isNotPayingOut === "true" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    value="true"
                                    onChange={handleOptionChange}
                                    checked={isNotPayingOut === "true"}
                                />
                                ⏳ まだ報酬の払い出しを行わない
                            </label>
                            <label className={`radio-option ${isNotPayingOut === "false" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    value="false"
                                    onChange={handleOptionChange}
                                    checked={isNotPayingOut === "false"}
                                />
                                ✅ 解答を確定して報酬を払い出す
                            </label>
                        </div>
                    </div>

                    {/* 発表者ボーナス */}
                    <div className="invest-section">
                        <div className="invest-section-title">発表者ボーナス</div>
                        <div className="invest-section-desc">この問題が発表されていれば、発表者に2倍のトークンを支払います</div>
                        <div className="radio-group">
                            <label className={`radio-option ${isNotAddingReward === "true" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    value="true"
                                    onChange={adding_reward}
                                    checked={isNotAddingReward === "true"}
                                />
                                ❌ 発表されていない
                            </label>
                            <label className={`radio-option ${isNotAddingReward === "false" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    value="false"
                                    onChange={adding_reward}
                                    checked={isNotAddingReward === "false"}
                                />
                                🎤 発表されている（2倍ボーナス）
                            </label>
                        </div>
                    </div>

                    {/* 送信 */}
                    <div className="invest-submit-area">
                        <button className="btn-invest-submit" onClick={() => investment_to_quiz()}>
                            🚀 報酬の追加・払い出しを実行
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (<></>);
    }
}

export default Investment_to_quiz;