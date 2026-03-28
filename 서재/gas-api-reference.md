# 서재 어구록 DB — GAS API 참조

> 이 문서는 서재 AGENTS.md에서 분리된 상세 참조 문서다.
> GAS URL: https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec
> 토큰: claude-feedback

---

## add_book (책 추가)

같은 책 제목이 이미 있으면 덮어쓴다.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"add_book","token":"claude-feedback","book":"책제목","author":"저자","tags":["태그1","태그2"],"quotes":["발췌문1","발췌문2"]}'
```

---

## load_quotes (어구록 검색)

태그 검색:
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"load_quotes","token":"claude-feedback","tags":["태그1","태그2"]}'
```

키워드 검색:
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"load_quotes","token":"claude-feedback","keyword":"검색어"}'
```

GET으로도 호출 가능 (오늘의내비 트랙 C에서 사용):
```
GAS_URL?action=load_quotes&token=claude-feedback&tags=태그1,태그2
GAS_URL?action=load_quotes&token=claude-feedback&keyword=검색어
```

---

## list_books (등록된 책 목록)

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"list_books","token":"claude-feedback"}'
```

---

## update_author (저자 일괄 업데이트)

quotes/tags를 건드리지 않고 author만 수정. 여러 책 한 번에 가능.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"update_author","token":"claude-feedback","entries":[{"book":"책제목","author":"저자명"}]}'
```

---

## import_from_doc (Google Docs 일괄 임포트)

Code.js의 BOOK_TITLES에 등록된 책을 자동 추출.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"import_from_doc","token":"claude-feedback","docId":"GOOGLE_DOC_ID"}'
```

| 파일 | docId |
|---|---|
| 100권 | 1XnV6UEx0ORogBbapzKE850Kvpu979WPUtXIJdvYi6NY |
| 15권 | 1MzIo40WbuSUlqBCK4WRLXpT7LpzOQ1BpsPzYjPXFrGE |
| 2026년 | 11dSrGX3j9y4vEXWSSoQMXet2Df8z0ca84ISmyIER3tU |

---

## scan_doc (Docs 구조 사전 점검)

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"scan_doc","token":"claude-feedback","docId":"GOOGLE_DOC_ID"}'
```

---

## update_quote_tags (발췌문별 태그)

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "GAS_URL" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"update_quote_tags","token":"claude-feedback","entries":[{"book":"책제목","quotes":[{"i":0,"tags":["태그1","t:톤","f:형식"]}]}]}'
```

---

## JSON 데이터 구조

```json
[
  {
    "id": "book_001",
    "book": "신경 끄기의 기술",
    "author": "마크 맨슨",
    "tags": ["행복", "고통", "자기수용"],
    "quotes": [
      "발췌문1...",
      "발췌문2..."
    ],
    "added": "2026-03-23"
  }
]
```

---

## GAS 배포 절차

1. `C:\dev\docs\서재\gas\Code.js` 수정
2. `cd "C:\dev\docs\서재\gas"` → `npx clasp push --force`
3. GAS 에디터에서 배포 관리 → 기존 배포 수정 → 새 버전 → 배포. ⚠️ "새 배포"를 누르면 URL이 바뀐다.
4. git add → commit → push
