import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import ResultPanel from "./components/ResultPanel";
import './App.css';

const SAMPLE_CODE = `public class UserService {

    private String userData;
    private boolean isLoggedIn;

    public boolean validateUser(String name, String email) {
        if (name == null || email == null) {
            return false;
        }
        return checkEmailFormat(email);
    }

    private boolean checkEmailFormat(String email) {
        return email.contains("@") && email.contains(".");
    }

    public String registerUser(String name, String email) {
        if (!validateUser(name, email)) {
            return redirectLogin();
        }
        saveToDatabase(name, email);
        return notifyUser(email);
    }

    private String redirectLogin() {
        return "로그인 페이지로 이동합니다.";
    }

    private void saveToDatabase(String name, String email) {
        System.out.println("DB 저장: " + name + ", " + email);
    }

    private String notifyUser(String email) {
        return "이메일 발송: " + email;
    }
}`;
  export default function App() {
    const [code, setCode] = useState(SAMPLE_CODE);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [affected, setAffected] = useState([]);

    const handleAnalyze = async () => {
      if (!code.trim()) return;
      setLoading(true);
      setError(null);
      setSelectedMethod(null);
      setAffected([]);

      try {
        const response = await fetch("https://retrojs-production.up.railway.app/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "분석 중 오류가 발생했습니다.");
          return;
        }

        setAnalysisResult(data);
      } catch (e) {
        setError("서버에 연결할 수 없습니다. 백엔드 서버를 확인해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    const handleSelectMethod = async (methodName) => {
      setSelectedMethod(methodName);
      setAffected([]);

      try {
        const response = await fetch("https://retrojs-production.up.railway.app/api/affected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetMethod: methodName,
            callRelations: analysisResult.callRelations,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("영향도 분석 오류:", data.error);
          return;
        }

        setAffected(data.affected);
      } catch(e) {
        console.error("서버 연결 오류:", e);
      }
    };

    return (
      <div className="app">
          <header className="app-header">
            <div className="header-inner">
              <div className="logo">
                <span className="logo-bracket">[</span>
                <span className="logo-text">RetroJS</span>
                <span className="logo-bracket">]</span>
              </div>
              <p className="header-sub">Java 레거시 코드 분석 도구</p>
            </div>
          </header>
          <main className="app-main">
            <div className="panel left-panel">
              <div className="panel-header">
                <span className="panel-title">코드입력</span>
                <span className="panel-hint">Java 단일 파일</span>
              </div>
              <CodeEditor value={code} onChange={setCode} language="java" />
              <div className="analyze-bar">
                {error && <span className="error-msg">{error}</span>}
                <button
                  className={`analyze-btn ${loading ? "loading" : ""}`}
                  onClick={handleAnalyze}
                  disabled={loading || !code.trim()}  
                  >
                  {loading ? "분석 중..." : "분석 요청"}
                </button>
              </div>
            </div>
            <div className="panel right-panel">
              <ResultPanel
                result={analysisResult}
                selectedMethod={selectedMethod}
                onSelectMethod={handleSelectMethod}
                affected={affected}
                loading={loading}
                />
                </div>
          </main>
      </div>
    );
  }