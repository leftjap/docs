<!-- PROJECT: seojai-quotes -->

# AGENTS.md — 서재 어구록 관리 가이드

> 이 문서는 서재 고유 규칙만 담는다.
> 공통 규칙(트랙 판단, 작업지시서 형식, Claude Code 규칙, 디버깅 프로토콜)은
> https://raw.githubusercontent.com/leftjap/playbook/main/common-rules.md 를 따른다.

---

## 0. 프로젝트 개요

어구록이란 독서 중 마음에 든 문장, 문단, 통찰을 발췌·메모한 것이다. 지오의 글쓰기 재료 창고이자 사고의 퇴적물이다.

**관리 대상:**
- `quotes/` 폴더 — 주제별 어구록 6파일 (문학, 자기계발, 심리학, 투자경제, 인문, 실용)
- `archive/` 폴더 — 기존 파일 보관 (서재_어구록_100권.md, 15권.md, 2026년.md). 더 이상 수정하지 않음
- `gas/Code.js` — 어구록 DB GAS 서버
- `quotes-data.json` — 어구록 DB JSON (GitHub 백업)

**신규 어구록은 해당 주제 파일(quotes/ 폴더)에 추가한다.**

---

## 1. 파일 구조 맵

```
C:\dev\docs\서재\
├── AGENTS.md                         ← 이 문서
├── gas\
│   ├── Code.js                       ← GAS 메인 코드
│   ├── .clasp.json
│   └── appsscript.json
├── archive\                          ← 기존 파일 보관 (수정 안 함)
│   ├── 서재_어구록_15권.md
│   ├── 서재_어구록_100권.md
│   └── 서재_어구록_2026년.md
├── quotes\                           ← 주제별 어구록 (현행)
│   ├── 문학.md
│   ├── 자기계발.md
│   ├── 심리학.md
│   ├── 투자경제.md
│   ├── 인문.md
│   └── 실용.md
├── quotes-data.json
└── scan_result.txt
```

---

## 2. 서재 고유 트랙 조건

common-rules.md 트랙 판단에 추가:
- 트랙 A 추가 조건: 발췌 원문의 정확성을 훼손하지 않는다
- 트랙 B 추가 조건: 기존 발췌 원문을 삭제/대폭 수정한다, 어구록 분류 체계를 변경한다

---

## 3. 절대 하지 않는 것

- 발췌 원문을 임의로 수정·요약·축약하지 않는다
- 기존 어구록 항목을 삭제하지 않는다 (사용자 명시 지시만 예외)
- 지오의 괄호 코멘트(개인 감상)를 자의적으로 추가·수정하지 않는다
- 책의 분류나 배치 순서를 임의로 변경하지 않는다

---

## 4. 문서 서식 규칙

| 파일 | 책 구분 | 발췌 형식 |
|---|---|---|
| quotes/ 각 파일 | 책 제목으로 구분 | 해당 파일 기존 서식 따름 |
| archive/ 100권 | 볼드 또는 ### | 산문 + 인용구 혼용 |
| archive/ 15권 | ## 제목 | 산문 + 불릿 + 인용구 혼용 |

원칙: 발췌 원문은 책의 표기 그대로. 강조는 원서 반영 또는 지오 직접 표시만. `{.mark}` 등 변환 잔여물은 건드리지 않는다.

---

## 5. 어구록 DB (GAS + Google Drive JSON)

상세 액션별 PowerShell 명령어와 파라미터는 참조 문서에 있다:
`C:\dev\docs\서재\gas-api-reference.md`

### 요약

| 액션 | 용도 |
|---|---|
| add_book | 책+발췌문 등록 |
| load_quotes | 태그/키워드로 발췌문 검색 |
| list_books | 등록된 책 목록 |
| update_author | 저자 일괄 수정 |
| import_from_doc | Google Docs 일괄 임포트 |
| scan_doc | Docs 구조 사전 점검 |
| update_quote_tags | 발췌문별 태그 업데이트 |

GAS URL: `https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec`
토큰: `claude-feedback`

### 태그 체계

- **topic**: 주제 (자기관찰, 습관, 관계, 일, 돈, 글쓰기, 죽음, 애도, 음식, 여행, 건강, 운동, 시간, 노화, 감정, 분노, 외로움, 가족, 직업, 반복, 동기부여, 소비, 행복, 고통, 자기수용, 평범함, 인간관계, 실패, 성공, 두려움, 자신감, 명상, 집중, 독서, 투자, 부, 교육, 사회, 정치, 자유, 창의성, 도덕, 정체성, 중독, 회복탄력성, 자존감, 결혼, 육아, 노동, 소통, 공감, 겸손, 욕망, 권력)
- **t:tone**: 어조 (t:용기, t:위로, t:경고, t:체념, t:유머, t:슬픔)
- **f:form**: 형식 (f:명문, f:논증, f:사례, f:비유)

새 태그 필요 시 topic 목록에 추가.

### DB 현황 (2026-03-23)

총 102권 991발췌문. 저자 100%. 89권 quote_tags 완료.

---

## 6. 소스 참조

| 항목 | 값 |
|---|---|
| 배포 URL | — (문서 프로젝트) |
| GitHub raw base | https://raw.githubusercontent.com/leftjap/docs/main/서재/ |

archive/서재_어구록_100권.md는 1.9MB — 크롤러 잘릴 가능성 높음. 수정 시 업로드 요청 또는 책 제목 특정 후 부분 작업.

---

## 7. 변경 이력

- 3/28: AGENTS.md 경량화. common-rules.md 중복 제거, GAS API 상세를 gas-api-reference.md로 분리, 관리 대상 파일을 현행(quotes/) 기준으로 갱신, playbook 경로 수정.
- 3/23: GAS update_quote_tags 추가. 89권 991발췌문 quote_tags 반영.
- 3/23: 폴더 구조 개편. archive + quotes 분리. 102권 DB 구축.
- 3/22: AGENTS.md 최초 생성.
