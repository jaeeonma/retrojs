const { findAll } = require("./parser");

function extractClasses(ast) {
    const classes = [];
    const classDeclarations = findAll(ast, "normalClassDeclaration");
    classDeclarations.forEach((node) => {
        const nameTokens = node.children?.typeIdentifier?.[0]?.children?.Identifier;
        const name = nameTokens?.[0]?.image ?? null;
        if (name) classes.push({ name });
    });
    return classes;
}

function extractMethods(ast) {
    const methods = [];
    const methodDeclarators = findAll(ast, "methodDeclarator");
    methodDeclarators.forEach((node) => {
        const nameToken = node.children?.Identifier?.[0];
        const name = nameToken?.image ?? null;
        const startLine = nameToken?.startLine ?? null;
        const allMethodDecls = findAll(ast, "methodDeclaration");
        const methodDecl = allMethodDecls.find((m) => {
            const ident =   
             m.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0]
               ?.children?.Identifier?.[0];
            return ident?.image === name && ident?.startLine === startLine;
        });
        const endLine = methodDecl?.location?.endLine ?? null;
        if (name) methods.push({ name, start: startLine, end: endLine });
    });
    return methods;
}

module.exports = { extractClasses, extractMethods };