import { useState } from "react"

const TABS = ["메서드 목록", "호출 관계", "영향도", "인수인계 문서", "분석 범위"];

export default function ResultPanel({ result, selectedMethod, onSelectMethod, affected, loading }) {
    const [activeTab, setActiveTab] = useState("메서드 목록");

    const handleMethodClick = (methodName) => {
        onSelectMethod(methodName);
        setActiveTab("영향도");
    };
    
    if (loading) {
        return (
            <div className="result-empty">
                <span className="loading-text">분석 중...</span>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="result-empty">
                <span>코드를 입력하고 분석 요청을 눌러주세요.</span>
            </div>
        );
    }

    const { classes, methods, callRelations, externalRelations, handoverDoc } = result;

    const handleCopy = () => {
        navigator.clipboard.writeText(handoverDoc);
        alert("클립보드에 복사됐습니다.");
    };

    return (
        <div className="result-panel">
            <div className="tab-bar">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                ))}
            </div>

            <div className="tab-content">

                {/* 메서드 목록 탭 */}
                {activeTab === "메서드 목록" && (
                    <div>
                        {classes.length > 0 && (
                          <div className="class-section">
                            <p className="class-label">클래스</p>
                            <ul className="class-list">
                                {classes.map((c) => (
                                    <li key={c.name} className="class-item">
                                        {c.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}
                        <p className="section-label">메서드 목록 — 클릭하면 영향도를 확인할 수 있어요</p>
                        <ul className="func-list">
                            {methods.map((m) => (
                                <li
                                    key={m.name}
                                    className={`func-item ${selectedMethod === m.name ? "selected" : ""}`}
                                    onClick={() => handleMethodClick(m.name)}
                                >
                                    <span className="func-name">{m.name}</span>
                                    {m.start && m.end && (
                                        <span className="func-lines">{m.start} ~ {m.end}번 줄</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 호출 관계 탭 */}
                {activeTab === "호출 관계" && (
                    <div>
                        {methods.length === 0 ? (
                            <p className="result-desc">분석한 메서드가 없습니다.</p>
                        ) : (
                            <ul className="call-list">
                                {methods.map((m) => {
                                    const internal = callRelations[m.name] ?? [];
                                    const external = externalRelations[m.name] ?? [];
                                    return (
                                        <li key={m.name} className="call-item">
                                            <span className="func-name">{m.name}</span>
                                            {internal.length === 0 && external.length === 0 ? (
                                                <span className="call-none">호출 없음</span>
                                            ) : (
                                                <span className="call-arrows">
                                                     →{" "}
                                                     {[
                                                        ...internal,
                                                        ...external.map((c) => `${c} (외부)`),
                                                     ].join(", ")}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}

                {/* 영향도 탭 */}
                {activeTab === "영향도" && (
                    <div>
                        {!selectedMethod ? (
                            <p className="result-desc">메서드 목록 탭에서 메서드를 클릭해주세요.</p>
                        ) : (
                            <div>
                                <div className="impact-target">
                                    <span className="impact-label">선택된 메서드</span>
                                    <span className="func-name">{selectedMethod}</span>
                                </div>
                                <div className="impact-result">
                                    <span className="impact-label">영향받는 메서드</span>
                                    {affected.length > 0 ? (
                                        <ul className="func-list">
                                            {affected.map((name) => (
                                                <li key={name} className="func-item highlighted">
                                                    <span className="func-name">{name}</span>
                                                    <span className="impact-badge">영향받음</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="call-none">이 메서드를 호출하는 메서드가 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    )}

                    {/* 인수인계 문서 탭 */}
                    {activeTab === "인수인계 문서" && (
                        <div className="doc-tab">
                            <button className="copy-btn" onClick={handleCopy}>
                                클립보드 복사
                            </button>
                            <pre className="doc-content">{handoverDoc}</pre>
                        </div>
                    )}

                    {/* 분석 범위 탭 */}
                    {activeTab === "분석 범위" && (
                        <div className="scope-tab">
                            <div className="scope-section">
                                <p className="scope-title">✅ 분석 가능한 항목</p>
                                <ul className="scope-list">
                                    <li>단일 Java 파일 내 클래스 구조</li>
                                    <li>클래스 내 메서드 목록 및 위치</li>
                                    <li>같은 파일 내 메서드 간 직접 호출 관계</li>
                                    <li>객첼르 통한 메서드 호출 (같은 파일 내)</li>
                                    <li>메서드 수정/삿제 시 영향 받는 메서드</li>
                                    <li>외부 클래스 메서드 호출 표시 (외부 표시)</li>
                                </ul>
                            </div>
                            <div className="scope-section">
                                <p className="scope-title">❌ 분석 불가능한 항목</p>
                                <ul className="scope-list">
                                    <li>여러 파일 간 의존성 분석</li>
                                    <li>외부 클래스 메서드의 내부 동작</li>
                                    <li>인터페이스, 추상 클래스 구조</li>
                                    <li>람다식, 스트림 내부 호출</li>
                                    <li>리플렉션을 통한 동적 호출</li>
                                    <li>상속 관계 분석</li>
                                </ul>
                            </div>
                            <div className="scope-section">
                                <p className="scope-title">⚠️ 주의 사항</p>
                                <ul className="scope-list">
                                    <li>분석 범위는 단일 파일로 제한됩니다.</li>
                                    <li>(외부) 표시는 현재 파일 외부 클래스의 메서드 호출입니다.</li>
                                    <li>AI 설명 기능 연동 후 분석 범위가 확장될 예정입니다.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                </div>
    );
}