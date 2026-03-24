# AGENTS.md — 서재 어구록 관리 가이드

> **공통 규칙**: AI의 응답은 간결한 경어체로 작성합니다.

## 이 문서의 용도

이 문서는 AI가 서재 어구록의 수정 요청을 받았을 때 따라야 하는 규칙이다.

어구록이란 독서 중 마음에 든 문장, 문단, 통찰을 발췌·메모한 것이다. 지오의 글쓰기 재료 창고이자 사고의 퇴적물이다.

**관리 대상 파일:**
- `C:\dev\docs\서재\서재_어구록_2026년.md` — 2026년 독서 어구록 (현재 진행)
- `C:\dev\docs\서재\서재_어구록_15권.md` — 15권 분량 어구록
- `C:\dev\docs\서재\서재_어구록_100권.md` — 100권 분량 어구록

**작업 흐름 요약:**
1. 사용자가 이 문서(AGENTS.md)를 업로드하고 수정 요청을 보낸다.
   (대상 파일이 함께 업로드되면 그것을 우선 참조한다)
2. AI는 이 문서를 읽고 요청을 분석한다.
3. AI는 파일 구조 맵(5번)에서 대상 파일을 특정한 뒤,
   업로드된 파일이 없으면 GitHub raw URL로 직접 크롤링한다.
4. 트랙 A이면 바로 작업지시서를 출력한다.
   트랙 B이면 방향 확인서를 먼저 출력한다.
5. 사용자가 작업지시서를 VS Code 에이전트에 복사해서 실행한다.
6. VS Code 에이전트는 문서 수정 → git add → git commit → git push를 모두 완료한다.

---

## 0. 작업 흐름

### 프로토콜

AI는 사용자의 요청을 받으면, 먼저 **트랙 A(즉시 진행)** 또는 **트랙 B(방향 확인)** 중 어느 쪽인지 판단한다.

---

#### 트랙 A — 즉시 진행

**조건 (모두 충족해야 한다):**
- 요청이 명확하다 (어느 파일에 무엇을 추가/수정할지 특정할 수 있다)
- 기존 파일 내 내용 추가 또는 수정이다 (파일 분리/병합/구조 변경이 아니다)
- 원문 발췌의 정확성을 훼손하지 않는다

**예시:** 새 어구록 항목 추가, 책 제목/저자 오류 수정, 지오의 코멘트 추가, 오타 수정

**흐름:**
1. 사용자가 이 문서(AGENTS.md)와 수정 요청을 보낸다.
   대상 파일이 함께 업로드되면 그것을 우선 참조한다.
2. AI는 요청을 분석하고, 필요하면 GitHub raw URL에서 대상 파일을 크롤링한다.
3. AI는 **바로 작업지시서를 출력한다.**

---

#### 트랙 B — 방향 확인 후 진행

**조건 (하나라도 해당하면 트랙 B):**
- 새 파일을 생성한다
- 기존 파일을 분리하거나 병합한다
- 폴더 구조를 변경한다
- 기존 발췌 원문을 삭제하거나 대폭 수정한다
- 어구록의 분류 체계를 변경한다
- 요청이 모호하거나 해석이 여러 가지다

**흐름:**
1. 사용자가 이 문서(AGENTS.md)와 수정 요청을 보낸다.
2. AI는 요청을 분석하고 **방향 확인서**를 출력한다.
3. 사용자가 승인하면 AI는 **바로 작업지시서를 출력한다.** 재확인하지 않는다.
4. 사용자가 방향을 수정하면, AI는 수정된 방향으로 방향 확인서를 다시 출력한다.

---

#### 트랙 판단 규칙

- AI는 매 요청마다 트랙을 판단하고, 트랙 A이면 작업지시서 상단에 `[트랙 A]`를, 트랙 B이면 방향 확인서 상단에 `[트랙 B]`를 표기한다.
- 판단이 애매하면 트랙 B를 선택한다.
- 사용자가 "바로 만들어", "작업지시서 바로 줘" 등 즉시 진행을 명시하면, 트랙 B 조건이더라도 트랙 A로 전환한다.

---

### 방향 확인서 형식 (트랙 B에서만 사용)

```
방향 확인: [요청 요약]

요청 이해
[사용자의 요청을 AI가 어떻게 이해했는지 1~3문장으로 정리]

변경 내용
[어느 파일의 무엇을 어떻게 바꿀 것인지]

기존 구조와의 충돌 여부
[파일 분류 체계(권수별/연도별)와 모순되지 않는지]

대안 (있을 경우)
[다른 접근법이 있으면 제시]
```

---

## 1. 작업지시서 출력 규칙

### 형식

```
⚠️ 모든 Step을 빠짐없이 순서대로 실행하세요. 특히 마지막 커밋 Step을 절대 생략하지 마세요.

프로젝트 경로 (모든 Step에서 이 절대 경로를 사용하세요)
프로젝트: C:\dev\docs\

작업지시서: [변경 요약]
작업 유형: [내용 추가 / 내용 수정 / 구조 변경]

Step 1
파일: [절대 경로]
위치: [책 제목 또는 섹션]
작업: [정확히 무엇을 추가/수정/삭제하는지]
교체 내용: [수정할 블록 전체]
완료 확인: [이 단계가 끝나면 어떤 상태여야 하는지]

Step N — 커밋 & 푸시
명령어:
  cd "C:\dev\docs"
  git add -A
  git commit -m "[작업유형]: [변경 요약]"
  git push origin main
```

### 내용 제공 규칙

어구록은 책 단위로 구분되므로 블록 단위가 다른 문서와 다르다.

**블록의 단위:**
- 한 권의 어구록 전체 (책 제목/저자부터 다음 책 제목 전까지)
- 한 권 내의 개별 발췌 항목 (문단 또는 인용구 단위)

**금지 패턴:**
- ❌ "100권 파일에서 세 번째 책의 두 번째 인용을 수정한다" (위치 모호)
- ✅ "'제3의 부의 원칙' 어구록 끝에 아래 발췌를 추가한다" (책 제목으로 위치 특정)

**새 어구록 추가 시:**
- 삽입 위치를 "파일 맨 끝" 또는 "[책 제목] 어구록 뒤"로 명시한다.
- 추가할 내용 전체를 제공한다.
- 2026년에 읽은 책은 `서재_어구록_2026년.md`에 추가한다.

### AGENTS.md 갱신 규칙

아래가 바뀌면 AGENTS.md 갱신 Step을 포함한다:
- 5번(파일 구조 맵): 파일 추가·삭제·이름 변경

**갱신하지 않는 경우:**
- 기존 파일에 어구록 항목을 추가하거나 오타를 수정하는 경우

### AI 응답 규칙

- 작업 규모를 부풀리지 않는다. 한 번에 할 수 있으면 묻지 않고 한 번에 한다.
- 선택지를 나열하는 것으로 끝내지 않는다. AI의 추천을 반드시 붙이고 근거를 밝힌다.
- 확신 수준을 구분한다: "확실합니다" / "높은 확률이지만 검증 필요" / "추측입니다".
- 쉬운 방법과 올바른 방법이 있으면 올바른 방법을 추천하고 이유를 밝힌다.
- 코드 작업에서 사용자의 접근에 문제가 보이면 근거와 함께 지적한다. 단, 근거 없이 반대하지 않는다.

### playbook.md 갱신 규칙

모든 작업지시서의 커밋 & 푸시 Step 직전에 playbook.md 갱신 Step을 포함한다.

- 파일: `C:\dev\playbook-config\playbook.md`
- 갱신 대상: 2번 백로그 표에서 해당 작업의 상태를 변경한다.
  - 완료 시: 해당 행을 삭제하고 변경 이력(7번)에 완료 기록 추가
  - 새 이슈 발견 시: 🟡 대기에 새 행 추가 (ID는 B-XX 채번)
  - 진행 상태 변경 시: 상태/메모 컬럼 갱신
- 갱신 후 별도 커밋:
  ```
  cd "C:\dev\playbook-config"
  git add playbook.md
  git commit -m "update: playbook.md [변경 요약]"
  git push origin main
  ```
- playbook.md 갱신이 불필요한 경우: 기존 파일에 어구록 항목 추가, 오타 수정 등 백로그에 등록된 작업이 아닌 사소한 수정

---

## 2. 절대 하지 않는 것

- AI가 발췌 원문을 임의로 수정하지 않는다. 원문은 책에서 가져온 그대로 보존한다.
- AI가 발췌 원문을 요약하거나 축약하지 않는다.
- 기존 어구록 항목을 삭제하지 않는다. 사용자가 명시적으로 지시한 경우만 예외.
- 지오의 괄호 코멘트(개인 감상)를 AI가 자의적으로 추가하거나 수정하지 않는다.
- 책의 분류나 배치 순서를 임의로 변경하지 않는다.

---

## 3. 문서 서식 규칙

### 어구록 구조

어구록은 파일마다 서식이 조금씩 다르다. 새 내용 추가 시 해당 파일의 기존 형식을 따른다.

| 파일 | 책 구분 방식 | 발췌 형식 |
|---|---|---|
| 서재_어구록_100권.md | 책 제목을 볼드 또는 ### 소제목으로 | 산문 + 인용구(`>`) 혼용 |
| 서재_어구록_15권.md | `##` 제목으로 구분 | 산문 + 불릿 리스트 + 인용구 혼용 |
| 서재_어구록_2026년.md | 책 제목으로 구분 | 산문 |

### 서식 원칙

- 발췌 원문은 책의 표기를 최대한 그대로 유지한다.
- 지오의 개인 코멘트는 괄호 `()` 안에 넣어 원문과 구분한다.
- 강조(볼드, 이탤릭, 밑줄)는 원서의 강조를 반영하거나 지오가 직접 표시한 것이다. 임의로 추가하지 않는다.
- `{.mark}`, `\<aside\>` 등 Google Docs 변환 잔여물이 있을 수 있다. 내용 수정 시 건드리지 않는다.

---

## 4. 소스 참조 프로토콜

### GitHub 정보

| 항목 | 값 |
|---|---|
| 레포 | `https://github.com/leftjap/docs` (Private) |
| GitHub raw base | `https://raw.githubusercontent.com/leftjap/docs/main/` |
| 서재 base URL | `https://raw.githubusercontent.com/leftjap/docs/main/서재/` |

### 파일 참조 우선순위

1순위 — 사용자가 업로드한 파일
2순위 — AI가 GitHub raw URL에서 직접 크롤링
3순위 — 사용자에게 업로드 요청 (1, 2 모두 불가능할 때만)

### 크기 제한

`서재_어구록_100권.md`는 1.9MB이므로 크롤러가 잘릴 가능성이 높다. 이 파일 수정 시에는 사용자에게 업로드를 요청하거나, 수정 대상 책 제목을 먼저 특정한 뒤 해당 부분만 작업한다.

---

## 5. 파일 구조 맵

```
C:\dev\docs\서재\
├── AGENTS.md                         ← 이 문서
├── gas\                              ← GAS 소스코드 (clasp 연동)
│   ├── Code.js                       ← GAS 메인 코드
│   ├── .clasp.json                   ← clasp 프로젝트 설정
│   └── appsscript.json               ← GAS 매니페스트
├── scan_result.txt                   ← 100권 문서 스캔 결과 (참고용)
├── archive\                          ← 기존 파일 보관 (더 이상 수정 안 함)
│   ├── 서재_어구록_15권.md
│   ├── 서재_어구록_100권.md
│   └── 서재_어구록_2026년.md
└── quotes\                           ← 주제별 어구록 (현행)
    ├── 문학.md                       ← 문학, 글쓰기, 창작, 서사
    ├── 자기계발.md                    ← 자기계발, 습관, 동기부여, 루틴
    ├── 심리학.md                      ← 심리학, 뇌과학, 인지, 감정
    ├── 투자경제.md                    ← 투자, 경제, 부, 재무
    ├── 인문.md                       ← 인문, 철학, 사회, 행복, 죽음
    └── 실용.md                       ← 건강, 관계, 소통, 일, 리더십
```

---

## 6. 서재 어구록 DB (GAS + Google Drive JSON)

### 용도

피드백 시 어구록을 참조하기 위한 검색용 DB다. 마크다운 파일과 별도로 운용된다.
마크다운 파일은 원본 보관용이고, JSON DB는 AI가 피드백 쓸 때 빠르게 검색하기 위한 것이다.

### GAS URL

```
https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec
```

### Google Drive 저장 위치

- 폴더: `seojai-quotes`
- 파일: `quotes-data.json`
- 첫 호출 시 자동 생성됨

### 액션 1: add_book (책 추가)

사용자가 책 제목 + 저자 + 발췌문을 올리면, AI가 태그를 판단하고 아래 명령을 실행한다.
같은 책 제목이 이미 있으면 덮어쓴다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"add_book","token":"claude-feedback","book":"책제목","author":"저자","tags":["태그1","태그2"],"quotes":["발췌문1","발췌문2"]}'
```

### 액션 2: load_quotes (어구록 검색)

피드백을 쓸 때, 글의 주제에 맞는 태그 또는 키워드로 검색한다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"load_quotes","token":"claude-feedback","tags":["태그1","태그2"]}'
```

키워드 본문 검색도 가능하다:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"load_quotes","token":"claude-feedback","keyword":"검색어"}'
```

### 액션 3: list_books (등록된 책 목록 확인)

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"list_books","token":"claude-feedback"}'
```

### 액션 4: update_author (저자 일괄 업데이트)

기존 DB의 quotes/tags를 건드리지 않고 author 필드만 수정한다. 여러 책을 한 번에 업데이트할 수 있다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"update_author","token":"claude-feedback","entries":[{"book":"책제목","author":"저자명"},{"book":"책제목2","author":"저자명2"}]}'
```

### 액션 5: import_from_doc (Google Docs에서 일괄 임포트)

Google Docs 파일에서 BOOK_TITLES에 등록된 책을 자동으로 찾아 발췌문을 추출하고 DB에 저장한다. Code.js의 BOOK_TITLES 딕셔너리에 책 제목이 등록되어 있어야 한다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"import_from_doc","token":"claude-feedback","docId":"Google_Doc_ID"}'
```

Google Docs 파일 ID:

| 파일 | docId |
|---|---|
| 100권 | `1XnV6UEx0ORogBbapzKE850Kvpu979WPUtXIJdvYi6NY` |
| 15권 | `1MzIo40WbuSUlqBCK4WRLXpT7LpzOQ1BpsPzYjPXFrGE` |
| 2026년 | `11dSrGX3j9y4vEXWSSoQMXet2Df8z0ca84ISmyIER3tU` |

### 액션 6: scan_doc (Google Docs 구조 스캔)

Google Docs 파일의 줄 단위 구조를 분석하여 BOOK_TITLES와 매칭되는 책 제목을 찾는다. 임포트 전 사전 점검용.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"scan_doc","token":"claude-feedback","docId":"Google_Doc_ID"}'
```

### 액션 7: update_quote_tags (발췌문별 태그 업데이트)

기존 DB의 각 발췌문에 개별 태그를 부여한다. book 단위 tags와 별도로, quotes 배열의 각 항목에 quote_tags 배열이 추가된다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"update_quote_tags","token":"claude-feedback","entries":[{"book":"책제목","quotes":[{"i":0,"tags":["태그1","태그2","t:톤","f:형식"]},{"i":1,"tags":["태그3","t:톤","f:형식"]}]}]}'
```

태그 3레이어 구조:
- **topic**: 주제 태그 (기존 태그 목록에서 선택)
- **t:tone**: 어조 태그 (t:용기, t:위로, t:경고, t:체념, t:유머, t:슬픔)
- **f:form**: 형식 태그 (f:명문, f:논증, f:사례, f:비유)

### 태그 목록 (누적 관리)

자기관찰, 습관, 관계, 일, 돈, 글쓰기, 죽음, 애도, 음식, 여행, 건강, 운동, 시간, 노화, 감정, 분노, 외로움, 가족, 직업, 반복, 동기부여, 소비, 행복, 고통, 자기수용, 평범함, 인간관계, 실패, 성공, 두려움, 자신감, 명상, 집중, 독서, 투자, 부, 교육, 사회, 정치, 자유, 창의성, 도덕, 정체성, 중독, 회복탄력성, 자존감, 결혼, 육아, 노동, 소통, 공감, 겸손, 욕망, 권력

새 태그가 필요하면 이 목록에 추가한다.

### JSON 데이터 구조

```json
[
  {
    "id": "book_001",
    "book": "신경 끄기의 기술",
    "author": "마크 맨슨",
    "tags": ["행복", "고통", "자기수용", "평범함"],
    "quotes": [
      "행복을 추구하는 것은 자멸적이다...",
      "투쟁이 성공을 결정한다..."
    ],
    "added": "2026-03-23"
  }
]
```

### GAS 코드 배포 절차 (clasp)

Code.js를 수정한 뒤 GAS 서버에 반영하는 절차:

1. VS Code에서 `C:\dev\docs\서재\gas\Code.js` 수정
2. 터미널에서 실행:
   ```
   cd "C:\dev\docs\서재\gas"
   npx clasp push --force
   ```
3. GAS 에디터(https://script.google.com)에서 수동 배포:
   - 배포 → 배포 관리 → 연필 아이콘(수정) → 버전을 "새 버전"으로 변경 → 배포
   - ⚠️ "새 배포"를 누르면 URL이 바뀌므로, 반드시 "배포 관리"에서 기존 배포를 수정할 것
4. git add → commit → push (GitHub 백업)

clasp push만으로는 웹앱에 반영되지 않는다. 반드시 3번(수동 배포)을 거쳐야 한다.

### 현재 DB 상태 (2026-03-23 기준)

| 항목 | 값 |
|---|---|
| 총 책 수 | 102권 |
| 총 발췌문 수 | 991개 |
| 저자 입력률 | 100% (102/102) |
| 태그 상태 | 89권 991발췌문 quote_tags 완료 (3레이어: topic/t:tone/f:form) |
| 소스 | 100권 파일 87권 + 15권 파일 10권 + 2026년 파일 4권 + 수동 1권 |

---

## 7. 어구록 DB 등록 작업지시서 규칙

### 사용자 입력 형식

사용자가 아래와 같이 입력한다:

```
책: [제목]
저자: [저자명]

1. [발췌문1]
2. [발췌문2]
3. [발췌문3]
```

또는 자유 형식으로 올려도 된다. AI가 책 제목, 저자, 발췌문을 식별한다.

### AI가 하는 일

1. 입력에서 책 제목, 저자, 발췌문을 추출한다.
2. 발췌문 내용을 기반으로 태그를 3~7개 판단한다. 6번의 태그 목록에서 선택하되, 목록에 없는 태그가 필요하면 새로 만든다.
3. 작업지시서를 출력한다. 작업지시서에는 세 가지 Step이 포함된다:
   - Step 1: GAS `add_book` 호출 (PowerShell 명령 — JSON DB에 추가)
   - Step 2: 마크다운 파일에 어구록 추가 (해당 연도 파일에 append)
   - Step 3: git add → commit → push

### 작업지시서 예시

```
⚠️ 모든 Step을 빠짐없이 순서대로 실행하세요.

프로젝트 경로 (모든 Step에서 이 절대 경로를 사용하세요)
프로젝트: C:\dev\docs\

작업지시서: '신경 끄기의 기술' 어구록 등록
작업 유형: 어구록 추가

Step 1 — JSON DB에 추가
명령어:
  Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"add_book","token":"claude-feedback","book":"신경 끄기의 기술","author":"마크 맨슨","tags":["행복","고통","자기수용"],"quotes":["발췌문1","발췌문2"]}'
완료 확인: 응답에 "status":"ok" 포함

Step 2 — 마크다운 파일에 추가
파일: C:\dev\docs\서재\서재_어구록_2026년.md
위치: 파일 맨 끝
작업: 아래 내용을 추가
교체 내용:
  [어구록 전문]
완료 확인: 파일 끝에 새 어구록이 추가됨

Step 3 — 커밋 & 푸시
명령어:
  cd "C:\dev\docs"
  git add -A
  git commit -m "어구록 추가: 신경 끄기의 기술"
  git push origin main
```

---

## 8. 변경 이력

- 3/22: AGENTS.md 최초 생성. 파일 구조 맵 작성.
- 3/23: GAS 어구록 DB 시스템 추가 (섹션 6, 7). add_book/load_quotes/list_books 액션.
- 3/23: 폴더 구조 개편. 기존 파일 3개 archive로 이동. quotes 폴더에 주제별 6개 파일 생성 (문학, 자기계발, 심리학, 투자경제, 인문, 실용).
- 3/23: GAS Code.js에 update_author 액션 추가. 102권 저자 정보 일괄 입력 (100%).
- 3/23: 15권 파일 임포트 (9권 신규 + 1권 업데이트), 2026년 파일 임포트 (4권 신규). DB 총 102권 991발췌문.
- 3/23: AGENTS.md 업데이트 — gas/ 폴더 구조, 신규 액션 (update_author, import_from_doc, scan_doc), clasp 배포 절차, DB 현황 추가.
- 3/23: GAS update_quote_tags 액션 추가. 89권 991발췌문 quote_tags 반영 (3레이어: topic/t:tone/f:form).
