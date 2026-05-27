function extractCallRelations(ast, methods) {
    const methodNames = new Set(methods.map((m) => m.name));
    const relations = {};
    const externalRelations = {};
    methods.forEach((m) => {
        relations[m.name] = new Set();
        externalRelations[m.name] = new Set();
    });

    const tokens = [];
    function collectTokens(node) {
        if (!node || typeof node !== "object") return;
        if (node.image !== undefined && node.startLine  !== undefined) {
            tokens.push(node);
            return;
        }
        if (node.children) {
            Object.values(node.children).forEach((children) => {
                if (Array.isArray(children)) children.forEach(collectTokens);
            });
        }
    }
    collectTokens(ast);
    tokens.sort((a, b) => a.startOffset - b.startOffset);

    tokens.forEach((token, i) => {
        if (token.image !== "(") return;
        const prevToken = tokens[i - 1];
        if (!prevToken || prevToken.tokenType?.name !== "Identifier") return;
        const callee = prevToken.image;
        const callLine = prevToken.startLine;
        const prevPrevToken = tokens[i - 2];
        const isExternal = prevPrevToken?.image === ".";

        methods.forEach((m) => {
            if (
                m.name !== callee &&
                m.start &&
                m.end &&
                callLine >= m.start &&
                callLine <= m.end
            ) {
                if (methodNames.has(callee) && !isExternal) {
                    relations[m.name].add(callee);
                } else if (isExternal) {
                    externalRelations[m.name].add(callee);
                }
            }
        });
    });

    const result = {};
    const externalResult = {};
    Object.keys(relations).forEach((k) => {
        result[k] = Array.from(relations[k]);
        externalResult[k] = Array.from(externalRelations[k]);
    });
    return { callRelations: result, externalRelations: externalResult };
}

function getAffectedMethods(targetMethod, callRelations) {
    const affected = new Set();
    Object.entries(callRelations).forEach(([caller, callees]) => {
        if (callees.includes(targetMethod)) affected.add(caller);
    });
    return Array.from(affected);
}

module.exports = { extractCallRelations, getAffectedMethods };