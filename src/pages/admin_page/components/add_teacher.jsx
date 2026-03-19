import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

function formatInternalId(prefix, index) {
    return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function Add_teacher(props) {
    const [addTeacher, setAddTeacher] = useState("");
    const [teachers, setTeachers] = useState([]);

    async function loadTeachers() {
        try {
            const result = await props.cont.get_teachers();
            setTeachers(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Failed to load teachers", error);
            setTeachers([]);
        }
    }

    async function add_teacher() {
        if (!addTeacher.trim()) return;
        await props.cont.add_teacher(addTeacher.trim());
        setAddTeacher("");
        await loadTeachers();
    }

    useEffect(() => {
        loadTeachers();
    }, [props.cont]);

    return (
        <div>
            <h3 className="section-title">先生 / TA を追加</h3>
            <p className="section-desc">
                追加する先生または TA のウォレットアドレスを入力してください。登録済み一覧では `STAFF-*` の識別番号も確認できます。
            </p>

            <Form>
                <Form.Group controlId="form_teacher" style={{ textAlign: "left" }}>
                    <Form.Label>ウォレットアドレス</Form.Label>
                    <Form.Control
                        type="text"
                        value={addTeacher}
                        onChange={(event) => setAddTeacher(event.target.value)}
                        placeholder="0x1234..."
                    />
                </Form.Group>
            </Form>

            <button className="btn-action" onClick={add_teacher}>
                先生 / TA をコントラクトに追加
            </button>

            <div className="address-list" style={{ marginTop: "var(--space-8)" }}>
                <div className="address-list-title">登録済み先生 / TA ({teachers.length}件)</div>
                {teachers.length === 0 ? (
                    <div className="address-item">登録済みの先生 / TA はまだありません。</div>
                ) : (
                    teachers.map((item, index) => (
                        <div key={`${item}-${index}`} className="address-item">
                            <div className="address-item-id">{formatInternalId("STAFF", index)}</div>
                            <div>{item}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Add_teacher;
