import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange }) {
    return (
        <div className="code-editor-wrapper">
            <Editor
                height="100%"
                defaultLanguage="java"
                value={value}
                onChange={(val) => onChange(val || "")}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    tabSize: 2,
                }}
            />
        </div>
    );
}