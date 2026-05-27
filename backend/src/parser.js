const { parse } = require("java-parser");

function parseCode(code) {
    try {
        const ast = parse(code);
        return { ast, error: null };
    } catch (e) {
        return { ast: null, error: e.mesage };
    }
}

function findAll(node, targetName, results = []) {
    if (!node || typeof node !== "object") return results;
    if (node.name === targetName) results.push(node);
    if (node.children) {
        for (const key of Object.keys(node.children)) {
            const children = node.children[key];
            if (Array.isArray(children)) {
                children.forEach((child) => findAll(child, targetName, results));
            }
        }
    }
    return results;
}

module.exports = { parseCode, findAll };