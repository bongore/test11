import { Contracts_MetaMask } from "../../contract/contracts";
import { useState, useEffect, useRef } from "react";
import Simple_quiz from "./components/quiz_simple";
import Quiz_list from "./components/quiz_list";
import "./edit_list_top.css";

function Edit_list_top(props) {
    let cont = new Contracts_MetaMask();

    const now_numRef = useRef(0);
    const [isTeacher, setIsTeacher] = useState(false);
    const [quiz_sum, Set_quiz_sum] = useState(null);
    const [quiz_list, Set_quiz_list] = useState([]);
    const [add_num, Set_add_num] = useState(7);
    const containerRef = useRef(null);

    const callback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                console.log("Target div is visible on the screen!");
            }
        });
    };

    useEffect(() => {
        cont.get_quiz_lenght().then((data) => {
            let now = parseInt(Number(data));
            Set_quiz_sum(now);
            now_numRef.current = now;
        });
        const set_is_teacher = async () => {
            setIsTeacher(await cont.isTeacher());
        };
        set_is_teacher();
    }, []);

    const targetRef = useRef(null);

    if (isTeacher) {
        if (quiz_sum != null) {
            return (
                <div className="edit-list-page">
                    <div className="page-header">
                        <h1 className="page-title">📝 クイズ管理</h1>
                        <p className="page-subtitle">作成したクイズの編集・報酬管理</p>
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

                    {quiz_list.map((quiz, index) => {
                        if (index !== quiz_list.length - add_num) {
                            return <div key={index}>{quiz_list[index]}</div>;
                        }
                        return null;
                    })}

                    <div ref={targetRef} className="loading-indicator">
                        <div className="skeleton-card">
                            <div className="skeleton-line" style={{ width: "60%" }}></div>
                            <div className="skeleton-line" style={{ width: "90%" }}></div>
                            <div className="skeleton-line" style={{ width: "40%" }}></div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return <></>;
        }
    } else {
        return <></>;
    }
}

export default Edit_list_top;
