import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Contracts_MetaMask } from "../../contract/contracts";
import "./dashboard.css";

function Dashboard() {
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [rank, setRank] = useState(null);
    const [quizTotal, setQuizTotal] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [loading, setLoading] = useState(true);

    const cont = new Contracts_MetaMask();

    useEffect(() => {
        async function loadData() {
            try {
                const addr = await cont.get_address();
                setAddress(addr);

                const [bal, total, teacher, user] = await Promise.all([
                    cont.get_token_balance(addr),
                    cont.get_quiz_lenght(),
                    cont.isTeacher(),
                    cont.get_user_data(addr),
                ]);

                setBalance(bal);
                setQuizTotal(Number(total));
                setIsTeacher(teacher);
                setUserData(user);

                // ランクを計算
                if (user && user[2]) {
                    const r = await cont.get_rank(user[2]);
                    setRank(r);
                }
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "---";

    const answeredCount = userData ? userData[2] : 0;
    const score = userData ? Number(userData[2]) / (10 ** 18) : 0;

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h1 className="page-title">📊 ダッシュボード</h1>
                    <p className="page-subtitle">読み込み中...</p>
                </div>
                <div className="dashboard-skeleton">
                    <div className="skeleton-stat-grid">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="skeleton-stat-card">
                                <div className="skeleton-line" style={{ width: "30%" }}></div>
                                <div className="skeleton-line large"></div>
                                <div className="skeleton-line" style={{ width: "60%" }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1 className="page-title">📊 ダッシュボード</h1>
                <p className="page-subtitle">あなたの学習状況の概要</p>
            </div>

            {/* Welcome Card */}
            <div className="welcome-card">
                <div className="welcome-avatar">👤</div>
                <div className="welcome-info">
                    <h2>ようこそ！</h2>
                    <span className="welcome-address">{address}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card cyan">
                    <div className="stat-card-icon">💰</div>
                    <div className="stat-card-value">
                        {balance !== null ? balance.toFixed(2) : "---"}
                    </div>
                    <div className="stat-card-label">TFT トークン残高</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-icon">🏆</div>
                    <div className="stat-card-value">
                        {rank !== null ? `${rank}位` : "---"}
                    </div>
                    <div className="stat-card-label">全体ランキング</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-icon">📝</div>
                    <div className="stat-card-value">
                        {quizTotal !== null ? quizTotal : "---"}
                    </div>
                    <div className="stat-card-label">クイズ総数</div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-card-icon">⭐</div>
                    <div className="stat-card-value">
                        {score > 0 ? score.toFixed(1) : "0"}
                    </div>
                    <div className="stat-card-label">獲得スコア</div>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="section-header">クイックアクション</h3>
            <div className="quick-actions">
                <Link to="/list_quiz" className="action-card">
                    <div className="action-icon cyan">📋</div>
                    <span className="action-text">クイズに挑戦</span>
                </Link>

                <Link to="/ranking" className="action-card">
                    <div className="action-icon purple">🏅</div>
                    <span className="action-text">ランキングを見る</span>
                </Link>

                {isTeacher && (
                    <Link to="/create_quiz" className="action-card">
                        <div className="action-icon green">✏️</div>
                        <span className="action-text">クイズを作成</span>
                    </Link>
                )}

                <Link to={`/user_page/${address}`} className="action-card">
                    <div className="action-icon yellow">👤</div>
                    <span className="action-text">マイページ</span>
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;
