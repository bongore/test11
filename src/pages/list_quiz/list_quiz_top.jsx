import { Contracts_MetaMask } from "../../contract/contracts";
import { useState, useEffect, useMemo, useRef } from "react";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";
import { useAccessControl } from "../../utils/accessControl";
import "./list_quiz_top.css";

function List_quiz_top(props) {
    const cont = useMemo(() => new Contracts_MetaMask(), []);
    const access = useAccessControl(cont);

    const now_numRef = useRef(0);
    const [quiz_sum, Set_quiz_sum] = useState(null);
    const [quiz_list, Set_quiz_list] = useState([]);
    const [add_num, Set_add_num] = useState(7);
    const containerRef = useRef(null);
    const targetRef = useRef(null);

    useEffect(() => {
        cont.get_quiz_lenght().then((data) => {
            let now = parseInt(Number(data));
            Set_quiz_sum(now);
            now_numRef.current = now;
        });
    }, []);

    if (quiz_sum != null) {
        return (
            <div className="quiz-list-page animate-fadeIn">
                <div className="quiz-list-header">
                    <h1 className="heading-xl">クイズ一覧</h1>
                    <p style={{ color: "#ffffff", opacity: 0.9 }}>出題されたクイズに回答してトークンを獲得しよう</p>
                </div>

                <Quiz_list
                    cont={cont}
                    add_num={add_num}
                    Set_add_num={Set_add_num}
                    quiz_sum={quiz_sum}
                    Set_quiz_sum={Set_quiz_sum}
                    quiz_list={quiz_list}
                    Set_quiz_list={Set_quiz_list}
                    targetRef={targetRef}
                    now_numRef={now_numRef}
                />

                <div className="quiz-list-items">
                    {quiz_list.map((quiz, index) => (
                        <div key={`${Number(quiz?.[0] ?? index)}-${index}`}>
                            <Simple_quiz quiz={quiz} canAnswerQuiz={access.canAnswerQuiz} />
                        </div>
                    ))}
                </div>

                <div ref={targetRef} className="quiz-loading">
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="quiz-list-page">
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
            </div>
        );
    }
}
export default List_quiz_top;
