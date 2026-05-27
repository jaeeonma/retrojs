# [RetroJS] Java 레거시 코드 분석 도구

> 단순 코드 설명을 넘어, AST 기반 정적 분석으로 Java 레거시 코드의 이해부터 인수인계 문서화까지 지원하는 사내 전용 코드 분석 도구

---

##  프로젝트 개요

Java 레거시 코드를 인수인계 받은 주니어 개발자가 코드 구조와 영향도를 빠르게 파악할 수 있도록 돕는 코드 분석 웹 서비스입니다.

외부 AI(ChatGPT, Claude 등)에 코드를 붙여넣는 방식은 **사내 코드 유출** 위험이 있습니다. RetroJS는 코드가 외부로 나가지 않는 **사내 전용 도구**로, AST 기반 정적 분석을 통해 정확한 분석 결과를 제공합니다.

---

##  기술 스택

| 구분 | 기술 | 용도 |
|---|---|---|
| 프론트엔드 | React + Vite | UI 렌더링, 사용자 입력 처리, 백엔드 API 호출 |
| 프론트엔드 | @monaco-editor/react | VSCode 기반 Java 코드 에디터 컴포넌트 |
| 백엔드 | Node.js + Express | REST API 서버, 코드 분석 처리 |
| 백엔드 | java-parser | Java 코드를 AST로 파싱하는 라이브러리 |
| 백엔드 | cors | 프론트엔드-백엔드 간 Cross-Origin 요청 허용 |
| 백엔드 | dotenv | 환경변수 관리 (.env 파일로 설정값 분리) |
| 추후 개발 | Claude API (Anthropic) | AI 기반 코드 자연어 설명 및 리팩토링 제안 |

---

##  프로젝트 구조

```
retrojs/
└── retrojs/
    ├── .gitignore
    ├── backend/                    ← Node.js + Express 서버
    │   ├── src/
    │   │   ├── parser.js           ← Java 코드 AST 파싱 (parseCode, findAll)
    │   │   ├── extractor.js        ← 클래스/메서드 추출 (extractClasses, extractMethods)
    │   │   ├── analyzer.js         ← 호출 관계 분석 및 영향도 분석 (extractCallRelations, getAffectedMethods)
    │   │   └── docGenerator.js     ← 인수인계 문서 생성 (generateHandoverDoc)
    │   ├── .env                    ← 환경변수 (포트 등)
    │   ├── server.js               ← Express 서버 및 API 엔드포인트
    │   └── package.json
    └── frontend/                   ← React + Vite 프로젝트
        ├── src/
        │   ├── components/
        │   │   ├── CodeEditor.jsx  ← 코드 입력창 UI
        │   │   └── ResultPanel.jsx ← 분석 결과 탭 패널 UI
        │   ├── App.jsx             ← 전체 레이아웃 및 API 호출 관리
        │   ├── App.css             ← 전체 스타일
        │   └── index.css           ← 전역 초기화
        └── index.html              ← 브라우저 탭 타이틀 설정
```

---

##  역할 분리 원칙

- **프론트엔드**: 시각적 요소만 담당. 코드 입력 UI, 결과 출력, 버튼 이벤트, 백엔드 API 호출
- **백엔드**: 데이터 처리 전담. AST 파싱, 클래스/메서드 추출, 호출 관계 분석, 영향도 분석, 문서 생성
- 데이터 가공 및 계산 로직은 프론트엔드에 절대 포함하지 않는다
- 단, UI 이벤트 처리(클립보드 복사, 탭 전환, 로딩 상태 표시 등)는 프론트엔드에서 담당한다
- 프론트엔드는 `.env` 를 사용하지 않는다. API 주소(`http://localhost:3001`)는 코드에 직접 작성한다

---

##  실행 방법

### 1. 백엔드 실행

```bash
cd retrojs/retrojs/backend
npm install
node server.js
```

서버 실행 확인: `http://localhost:3001`

### 2. 프론트엔드 실행

```bash
cd retrojs/retrojs/frontend
npm install
npm run dev
```

브라우저 접속: `http://localhost:5173`

---

##  API 엔드포인트

### POST `/api/analyze`

Java 코드 분석 요청

**요청 바디**
```json
{ "code": "Java 코드 문자열" }
```

**응답**
```json
{
  "classes": [{ "name": "UserService" }],
  "methods": [{ "name": "validateUser", "start": 5, "end": 15 }],
  "callRelations": { "validateUser": ["checkEmailFormat"] },
  "externalRelations": { "validateUser": ["println"] },
  "handoverDoc": "# 인수인계 문서 ..."
}
```

### POST `/api/affected`

영향도 분석 요청

**요청 바디**
```json
{
  "targetMethod": "validateUser",
  "callRelations": { "registerUser": ["validateUser"] }
}
```

**응답**
```json
{ "affected": ["registerUser"] }
```

---

## 🔍 주요 기능

| 기능 | 설명 |
|---|---|
| 클래스/메서드 구조 추출 | AST 파싱으로 클래스, 메서드 목록, 위치 자동 추출 |
| 외부 메서드 호출 표시 | 내부 호출과 외부 클래스 호출을 `(외부)` 표시로 구분 |
| 영향도 분석 | 메서드 클릭 시 해당 메서드를 호출하는 메서드 하이라이트 |
| 인수인계 문서 자동 생성 | 분석 결과 기반 문서 자동 생성 + 클립보드 복사 |
| 분석 범위 안내 | 분석 가능/불가능 항목을 별도 탭으로 안내 |

---

## ✅ 분석 가능 / ❌ 불가능 항목

**✅ 분석 가능**
- 단일 Java 파일 내 클래스 구조
- 클래스 내 메서드 목록 및 위치
- 같은 파일 내 메서드 간 직접 호출 관계
- 객체를 통한 메서드 호출 (같은 파일 내)
- 메서드 수정/삭제 시 영향받는 메서드
- 외부 클래스 메서드 호출 표시 `(외부)`

**❌ 분석 불가능**
- 여러 파일 간 의존성 분석
- 외부 클래스 메서드의 내부 동작
- 인터페이스, 추상 클래스, enum 구조
- 람다식, 스트림 내부 호출
- 리플렉션을 통한 동적 호출
- 상속 관계 분석

> ⚠️ 같은 파일 내 메서드라도 `객체.메서드()` 형식으로 호출하면 외부 호출로 분류될 수 있습니다.

---

##  추후 개발 계획 (AI API 확보 후)

- **F-07 코드 자연어 설명** — Claude API 연동하여 클래스/메서드 역할을 한국어로 자동 설명
- **F-08 개선 및 리팩토링 제안** — 순환 복잡도(Cyclomatic Complexity) 수치 기반 리팩토링 방향 제시
- **C언어 지원 추가**
- **파일 단위 → 프로젝트 전체 의존성 분석**
- **팀 공유 기능**
