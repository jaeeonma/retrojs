function generateHandoverDoc(classes, methods, callRelations, externalRelations) {
    const lines = [];

    lines.push("# 인수인계 문서");
    lines.push("");

    if (classes.length > 0) {
        lines.push("## 클래스 목록");
        lines.push("");
        classes.forEach((c) => lines.push(`- ${c.name}`));
        lines.push("");
    }

    lines.push("## 주요 메서드 목록");
    lines.push("");
    methods.forEach((m) => {
        lines.push(`### ${m.name}`);
        if (m.start && m.end) {
            lines.push(`- 위치: ${m.start}번 줄 ~ ${m.end}번 줄`);
        }
        const calls = callRelations[m.name];
        const externalCalls = externalRelations[m.name];
        const allCalls = [
            ...(calls ?? []),
            ...(externalCalls ?? []).map((c) => `${c} (외부)`),
        ];
        if (allCalls.length > 0) {
            lines.push(`- 호출하는 메서드: ${allCalls.join(", ")}`);
        } else {
            lines.push("- 호출하는 메서드: 없음");
        }
        lines.push("");
    });

    lines.push("## 메서드 간 호출 관계");
    lines.push("");
    let hasRelation = false;
    methods.forEach((m) => {
        const calls = callRelations[m.name];
        const externalCalls = externalRelations[m.name];
        const allCalls = [
            ...(calls ?? []).map((c) => `\`${c}\``),
            ...(externalCalls ?? []).map((c) => `\`${c}\` (외부)`),
        ];
        if (allCalls.length > 0) {
            lines.push(`- \`${m.name}\` → ${allCalls.join(", ")}`);
            hasRelation = true;
        }
    });
    if (!hasRelation) lines.push("- 호출 관계 없음");
    
    lines.push("");
    lines.push("## 주의 사항");
    lines.push("- 위 문서는 AST 정적 분석 기반으로 자동 생성되었습니다.");
    lines.push("- (외부) 표시는 현재 파일 외부 클래스의 메서드 호출입니다.");
    lines.push("- AI 설명 가능 연동 후 내용이 보강될 예정입니다.");

    return lines.join("\n");
}

module.exports = { generateHandoverDoc };