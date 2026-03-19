import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
function Quiz_list(props) {
    const location = useLocation();
    const add_num = useRef(Math.floor(window.innerHeight / 100) + 2);

    const get_quiz_list = async (now) => {
        let add_quiz_list = [];

        if (now - add_num.current < 0) {
            add_quiz_list = await props.cont.get_quiz_list(now, 0);
            props.now_numRef.current = 0;
        } else {
            add_quiz_list = await props.cont.get_quiz_list(now, now - add_num.current);
            props.now_numRef.current = now - add_num.current;
        }

        props.Set_quiz_list((quiz_list) => [...quiz_list, ...add_quiz_list]);
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    get_quiz_list(props.now_numRef.current);
                }
            }
        }, {
            root: null,
            rootMargin: "-10px",
            threshold: 0,
        });

        const targetElement = props.targetRef.current;
        if (targetElement) {
            observer.observe(targetElement);
        }

        return () => {
            if (targetElement) {
                observer.unobserve(targetElement);
            }
            observer.disconnect();
        };
        // location is intentionally referenced so list resets on route change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.key]);

    return null;
}

export default Quiz_list;
