function User_card(props) {
    const addNetworkHandler = async () => {
        if (!window.ethereum) {
            alert("MetaMask が見つかりません。MetaMask をインストールしてから再度お試しください。");
            return;
        }

        try {
            await props.cont.request_wallet_access();

            try {
                await props.cont.change_network();
                alert("Polygon Amoy に切り替えました。");
                return;
            } catch (switchError) {
                if (switchError?.code !== 4902 && !String(switchError?.message || "").includes("4902")) {
                    throw switchError;
                }
            }

            await props.cont.add_network();
            await props.cont.change_network();
            alert("Polygon Amoy を MetaMask に追加し、切り替えました。");
        } catch (error) {
            console.error("Failed to ensure Polygon Amoy network", error);
            if (error?.code === 4001) {
                alert("MetaMask 側で操作がキャンセルされました。");
                return;
            }
            alert("Polygon Amoy の追加または切り替えに失敗しました。MetaMask のポップアップを確認してください。");
        }
    };

    const addTokenHandler = async () => {
        if (!window.ethereum) {
            alert("MetaMask が見つかりません。MetaMask をインストールしてから再度お試しください。");
            return;
        }

        try {
            await addNetworkHandler();
            await props.cont.add_token_wallet();
            alert("TFT を MetaMask に追加しました。");
        } catch (error) {
            console.error("Failed to add token to MetaMask", error);
            alert("TFT の追加に失敗しました。MetaMask の確認画面を確認してください。");
        }
    };

    return (
        <div className="user-card glass-card animate-slideUp">
            <div className="user-address">
                <span className="user-address-label">アドレス</span>
                <span className="user-address-value">
                    {props.address ? `${props.address.slice(0, 10)}...${props.address.slice(-6)}` : ""}
                </span>
            </div>

            <div className="user-stats">
                <div className="user-stat-item">
                    <div className="user-stat-icon">T</div>
                    <div className="user-stat-info">
                        <span className="user-stat-label">保有トークン</span>
                        <span className="user-stat-value">{props.token} TFT</span>
                    </div>
                </div>
                <div className="user-stat-item">
                    <div className="user-stat-icon">#</div>
                    <div className="user-stat-info">
                        <span className="user-stat-label">順位</span>
                        <span className="user-stat-value">
                            {props.rank}位 / {props.num_of_student}人
                        </span>
                    </div>
                </div>
                <div className="user-stat-item">
                    <div className="user-stat-icon">S</div>
                    <div className="user-stat-info">
                        <span className="user-stat-label">獲得点数</span>
                        <span className="user-stat-value">{Number(props.result) / 40}点</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gap: "12px", marginTop: "var(--space-4)" }}>
                <button type="button" className="btn-ghost" style={{ width: "100%" }} onClick={addNetworkHandler}>
                    Polygon Amoy を MetaMask に追加
                </button>
                <button type="button" className="btn-ghost" style={{ width: "100%" }} onClick={addTokenHandler}>
                    TFT を MetaMask に追加
                </button>
            </div>
        </div>
    );
}

export default User_card;
