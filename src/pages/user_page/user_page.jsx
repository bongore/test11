import { Contracts_MetaMask } from "../../contract/contracts";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./user_page.css";
import History_list from "./component/history_list";
import User_card from "./component/user_card";
import { useRef } from "react";

function User_page(props) {
    const { address } = useParams();

    const [icons, SetIcons] = useState(null);
    const [user_name, Setuser_name] = useState(null);
    const [result, SetResult] = useState(null);
    const [token, Set_token] = useState(null);
    const [state, Set_state] = useState(null);
    const [rank, setRank] = useState(null);
    const [num_of_student, setNum_of_student] = useState(null);
    const [history_sum, Set_history_sum] = useState(null);
    const now_numRef = useRef(0);
    const targetRef = useRef(null);

    const cont = props.cont || new Contracts_MetaMask();
    const [history_list, Set_history_list] = useState([]);

    const get_variable = async () => {
        Set_token(await cont.get_token_balance(address));
        let [user_name, image, result, state] = await cont.get_user_data(address);
        Setuser_name(user_name);
        SetIcons(image);
        SetResult(result / 10 ** 18);
        setRank(await cont.get_rank(result));
        setNum_of_student(await cont.get_num_of_students());
        Set_state(state);

        cont.get_user_history_len(address).then((data) => {
            Set_history_sum(Number(data));
            now_numRef.current = Number(data);
        });
    };

    useEffect(() => {
        get_variable();
    }, []);

    if (history_sum != null) {
        return (
            <div className="user-page animate-fadeIn">
                <div className="user-page-header">
                    <h1 className="heading-xl">マイページ</h1>
                </div>

                <User_card
                    address={address}
                    icons={icons}
                    user_name={user_name}
                    token={token}
                    result={result}
                    state={state}
                    rank={rank}
                    num_of_student={num_of_student}
                    cont={cont}
                />

                <History_list
                    cont={cont}
                    history_sum={history_sum}
                    Set_history_sum={Set_history_sum}
                    history_list={history_list}
                    Set_history_list={Set_history_list}
                    targetRef={targetRef}
                    now_numRef={now_numRef}
                    address={address}
                />

                <div className="token-history">
                    <h2 className="heading-md" style={{ marginBottom: "var(--space-4)" }}>
                        📊 トークン履歴
                    </h2>
                    <div className="timeline stagger-children">
                        {history_list.map((history, index) => {
                            return <div key={index}>{history}</div>;
                        })}
                    </div>
                    <div ref={targetRef} className="quiz-loading">
                        <div className="skeleton skeleton-card"></div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="user-page">
                <div className="skeleton skeleton-card" style={{ height: "200px" }}></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
            </div>
        );
    }
}

export default User_page;
