import { useState, useEffect } from "react";
import { Contracts_MetaMask } from "../../contract/contracts";
import "./ranking.css";

function Ranking() {
    const [results, setResults] = useState(null);
    const [myAddress, setMyAddress] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [myScore, setMyScore] = useState(null);
    const [loading, setLoading] = useState(true);

    const cont = new Contracts_MetaMask();

    useEffect(() => {
        async function loadData() {
            try {
                const addr = await cont.get_address();
                setMyAddress(addr);

                // 全生徒の成績を取得（学生のアドレスとスコア）
                const studentResults = await cont.get_results();
                
                if (studentResults && studentResults.length > 0) {
                    // スコアでソート（降順）
                    const sorted = [...studentResults].sort((a, b) => {
                        return Number(b.result) - Number(a.result);
                    });
                    setResults(sorted);

                    // 自分のスコアとランクを計算
                    const myResult = sorted.find(
                        r => r.student && r.student.toLowerCase() === addr.toLowerCase()
                    );
                    if (myResult) {
                        setMyScore(Number(myResult.result) / (10 ** 18));
                        const idx = sorted.findIndex(
                            r => r.student && r.student.toLowerCase() === addr.toLowerCase()
                        );
                        setMyRank(idx + 1);
                    }
                }
            } catch (err) {
                console.error("Ranking load error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const MEDALS = ["🥇", "🥈", "🥉"];

    if (loading) {
        return (
            <div className="ranking-page">
                <div className="page-header">
                    <h1 className="page-title">🏆 ランキング</h1>
                    <p className="page-subtitle">読み込み中...</p>
                </div>
                <div className="ranking-skeleton">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton-stat-card">
                            <div className="skeleton-line" style={{ width: "80%" }}></div>
                            <div className="skeleton-line" style={{ width: "40%" }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="ranking-page">
                <div className="page-header">
                    <h1 className="page-title">🏆 ランキング</h1>
                    <p className="page-subtitle">まだランキングデータがありません</p>
                </div>
            </div>
        );
    }

    const top3 = results.slice(0, 3);

    return (
        <div className="ranking-page">
            <div className="page-header">
                <h1 className="page-title">🏆 ランキング</h1>
                <p className="page-subtitle">全生徒のトークン獲得スコアによる順位</p>
            </div>

            {/* My Rank Card */}
            {myRank !== null && (
                <div className="my-rank-card">
                    <div className="my-rank-left">
                        <span style={{ fontSize: "1.5rem" }}>🎯</span>
                        <div>
                            <div className="my-rank-label">あなたの順位</div>
                            <div className="my-rank-value">{myRank}位 / {results.length}人</div>
                        </div>
                    </div>
                    <div className="my-rank-score">{myScore?.toFixed(1)} pts</div>
                </div>
            )}

            {/* Top 3 Podium */}
            {top3.length >= 3 && (
                <div className="podium-section">
                    {[1, 0, 2].map(idx => (
                        <div key={idx} className={`podium-item ${idx === 0 ? 'first' : idx === 1 ? 'second' : 'third'}`}>
                            <div className="podium-medal">{MEDALS[idx]}</div>
                            <div className="podium-bar">
                                <div className="podium-score">
                                    {(Number(top3[idx].result) / (10 ** 18)).toFixed(1)}
                                </div>
                                <div className="podium-label">
                                    {top3[idx].student 
                                        ? `${top3[idx].student.slice(0, 6)}...` 
                                        : "---"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Ranking List */}
            <div className="ranking-list-card">
                {results.map((item, index) => {
                    const isMe = myAddress && item.student && 
                        item.student.toLowerCase() === myAddress.toLowerCase();
                    const score = Number(item.result) / (10 ** 18);
                    
                    return (
                        <div key={index} className={`ranking-row ${isMe ? 'highlight' : ''}`}>
                            <div className="rank-number">
                                {index < 3 ? MEDALS[index] : index + 1}
                            </div>
                            <div className="rank-info">
                                <div className="rank-address">
                                    {isMe ? "👤 あなた" : item.student}
                                </div>
                            </div>
                            <div className="rank-score">{score.toFixed(1)} pts</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Ranking;
