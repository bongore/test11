import { useEffect, useMemo, useState } from "react";
import {
    QUIZ_INPUT_MODE_PLAIN,
    QUIZ_INPUT_MODE_REGEX,
    encodeQuizInputAnswerData,
    isRegexPatternValid,
    parseQuizInputAnswerData,
    testRegexPattern,
} from "../../../utils/quizAnswerInput";

function Answer_area2(props) {
    const initialConfig = useMemo(() => parseQuizInputAnswerData(props.variable), [props.variable]);
    const [inputMode, setInputMode] = useState(initialConfig.inputMode);
    const [pattern, setPattern] = useState(initialConfig.pattern);
    const [placeholder, setPlaceholder] = useState(initialConfig.placeholder);
    const [example, setExample] = useState(initialConfig.example);

    useEffect(() => {
        const nextConfig = parseQuizInputAnswerData(props.variable);
        setInputMode(nextConfig.inputMode);
        setPattern(nextConfig.pattern);
        setPlaceholder(nextConfig.placeholder);
        setExample(nextConfig.example);
    }, [props.variable]);

    useEffect(() => {
        props.set([
            encodeQuizInputAnswerData({
                inputMode,
                pattern,
                placeholder,
                example,
            }),
        ]);
    }, [example, inputMode, pattern, placeholder, props]);

    const regexValid = isRegexPatternValid(pattern);
    const exampleValid = inputMode === QUIZ_INPUT_MODE_PLAIN || !example ? true : testRegexPattern(pattern, example);
    const correctValid = inputMode === QUIZ_INPUT_MODE_PLAIN || !props.variable1 ? true : testRegexPattern(pattern, props.variable1);

    return (
        <>
            <p className="text-left" style={{ color: "var(--text-primary)" }}>
                <font size="5">{props.name}</font>
            </p>

            <div className="row" style={{ color: "var(--text-primary)", marginBottom: "16px" }}>
                <div className="col-12">
                    <div className="btn-group" role="group" aria-label="input-mode">
                        <button
                            type="button"
                            className={`btn ${inputMode === QUIZ_INPUT_MODE_REGEX ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setInputMode(QUIZ_INPUT_MODE_REGEX)}
                        >
                            正規表現
                        </button>
                        <button
                            type="button"
                            className={`btn ${inputMode === QUIZ_INPUT_MODE_PLAIN ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setInputMode(QUIZ_INPUT_MODE_PLAIN)}
                        >
                            通常テキスト
                        </button>
                    </div>
                </div>
            </div>

            {inputMode === QUIZ_INPUT_MODE_REGEX ? (
                <div className="row" style={{ color: "var(--text-primary)" }}>
                    <div className="col-10">
                        正規表現を入力
                        <input type="text" className="form-control" value={pattern} onChange={(event) => setPattern(event.target.value)} />
                        <div style={{ color: regexValid ? "var(--accent-green)" : "var(--accent-red)", marginTop: "8px" }}>
                            {regexValid ? "使用できる正規表現です" : "正規表現が不正です"}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row" style={{ color: "var(--text-primary)" }}>
                    <div className="col-10">
                        入力欄の案内文
                        <input
                            type="text"
                            className="form-control"
                            value={placeholder}
                            placeholder="例: 学籍番号を入力してください"
                            onChange={(event) => setPlaceholder(event.target.value)}
                        />
                        <div style={{ marginTop: "8px", color: "var(--text-secondary)" }}>
                            通常テキストでは自由入力として扱います。
                        </div>
                    </div>
                </div>
            )}

            <div className="row" style={{ color: "var(--text-primary)", marginTop: "16px" }}>
                <div className="col-10">
                    例を入力
                    <input
                        type="text"
                        className="form-control"
                        value={example}
                        onChange={(event) => setExample(event.target.value)}
                    />
                    {inputMode === QUIZ_INPUT_MODE_REGEX ? (
                        <div style={{ color: exampleValid ? "var(--accent-green)" : "var(--accent-red)", marginTop: "8px" }}>
                            {exampleValid ? "例は正規表現に一致しています" : "例が正規表現に一致していません"}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="row" style={{ color: "var(--text-primary)", marginTop: "16px" }}>
                <div className="col-10">
                    正解を入力
                    <input
                        type="text"
                        className="form-control"
                        value={props.variable1}
                        onChange={(event) => {
                            props.set1(event.target.value);
                        }}
                    />
                    {inputMode === QUIZ_INPUT_MODE_REGEX ? (
                        <div style={{ color: correctValid ? "var(--accent-green)" : "var(--accent-red)", marginTop: "8px" }}>
                            {correctValid ? "正解は正規表現に一致しています" : "正解が正規表現に一致していません"}
                        </div>
                    ) : (
                        <div style={{ marginTop: "8px", color: "var(--text-secondary)" }}>
                            通常テキストとして保存されます。
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Answer_area2;
