const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { parseCode } = require("./src/parser");
const { extractClasses, extractMethods } = require("./src/extractor");
const { extractCallRelations, getAffectedMethods } = require("./src/analyzer");
const { generateHandoverDoc } = require("./src/docGenerator");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "grand-harmony-production-606e.up.railway.app"
}));
app.use(express.json({ limit: "10mb" }));

// Java 코드 분석 API
app.post("/api/analyze", (req, res) => {
    const { code } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({ error: "코드를 입력해주세요." });
    }

    const { ast, error: parseError } = parseCode(code);

    if (parseError || !ast) {
        return res.status(400).json({ error: "Java 코드만 지원합니다. 코드를 확인해주세요." });
    }

    const classes = extractClasses(ast);
    const methods = extractMethods(ast);
    const { callRelations, externalRelations } = extractCallRelations(ast, methods);
    const handoverDoc = generateHandoverDoc(classes, methods, callRelations, externalRelations);

    return res.json({
        classes,
        methods,
        callRelations,
        externalRelations,
        handoverDoc,
    });
});

// 영향도 분석 API
app.post("/api/affected", (req, res) => {
    const { targetMethod, callRelations } = req.body;

    if (!targetMethod || !callRelations) {
        return res.status(400).json({ error: "targetMethod와 callRelations가 필요합니다." });
    }

    const affected = getAffectedMethods(targetMethod, callRelations);
    return res.json({ affected });
});

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});