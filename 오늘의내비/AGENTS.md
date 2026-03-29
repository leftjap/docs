<!-- PROJECT: onenavi -->

# AGENTS.md — 오늘의내비

> **공통 규칙**: https://raw.githubusercontent.com/leftjap/opus/main/common-rules.md

---

## 관리 대상 파일

| 파일 | 경로 | 용도 |
|---|---|---|
| 지오 내비 (현재) | `C:\dev\docs\오늘의내비\지오\오늘의 내비(2026~).md` | 2026~ 일기 |
| 지오 내비 (2025) | `C:\dev\docs\오늘의내비\지오\오늘의 내비_2025.md` | 2025년 일기 |
| 지오 내비 (과거) | `C:\dev\docs\오늘의내비\지오\오늘의 내비_2022~2025.md` | 2022~2025 일기 |
| 지오 피드백지침서 | `C:\dev\docs\오늘의내비\지오\피드백지침서.md` | 지오 일기 피드백 지침 |
| 소연 내비 | `C:\dev\docs\오늘의내비\소연\소연 내비.md` | 소연의 일기 |
| 소연 피드백지침서 | `C:\dev\docs\오늘의내비\소연\피드백지침서.md` | 소연 피드백 지침 (**Opus 참조용**) |

---

## 트랙 판단

트랙 A/B는 common-rules.md를 따른다. 오늘의내비 고유 트랙:

### 트랙 C — 소연/지오 내비 글 추가 + 피드백 댓글

**전제:**
- 사용자가 AGENTS.md + 새 글 텍스트를 동시에 업로드한다
- "소연 글" 또는 "지오 글"을 명시한다. 미명시 시 AI가 판단하되 확신 없으면 묻는다
- "아카이빙만" 명시 → 피드백 없이 삽입 + git push만

---

### 소연 글 — 전체 흐름

#### 1단계: 피드백 재료 수집 (Opus가 직접 수행)

**(a) 어구록 DB 검색 — `load_quotes` (GET)**

새 글의 핵심 주제/감정 키워드로 검색:

```
https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec?action=load_quotes&token=claude-feedback&tags=태그1,태그2
```

키워드 검색:
```
https://script.google.com/macros/s/AKfycbyldcNzji4n3p7J83aDR86udPYXKaa8_BAu-E6uNFLTc7VIld_v3UKjGQPtRa0QpaQE/exec?action=load_quotes&token=claude-feedback&keyword=검색어
```

**(b) 소연 대시보드 DB 조회 — `load_partner_db` (GET)**

```
https://script.google.com/macros/s/AKfycbw3WUMJJyab2uZ33OtZVU1Rv4kvo47cqTaRecEZta4gAtaizN667CV4oZLS8q4nNUTY/exec?action=load_partner_db&token=claude-feedback
```

응답 `dbData.gb_docs`에서 새 글과 일치하는 문서의 **docId**와 **날짜(created)**를 확인.

#### 2단계: 피드백 댓글 작성 (Opus가 직접 수행)

**IMPORTANT: 피드백 지침서를 반드시 먼저 크롤링한 후 작성한다.**

```
https://raw.githubusercontent.com/leftjap/docs/main/오늘의내비/소연/피드백지침서.md
```

1단계(a) 어구록 결과 + 피드백 지침서 + AI 자체 지식을 참조하여 댓글 완성.

#### 2.5단계: 소연의 맥락 대조 (Opus가 직접 수행)

새 글 내용을 피드백지침서.md의 "소연의 맥락" 섹션과 대조.
기존에 없는 중요 맥락 발견 → 3단계 작업지시서에 피드백지침서.md 수정 Step 포함.
기존 맥락 반복 → 해당 Step 생략. 판단 근거를 작업지시서 하단에 "맥락 대조 결과"로 기록.

#### 3단계: 작업지시서 출력 (Opus 출력 → Haiku 실행)

**Step 구성:**

1. **소연 내비.md에 새 글 삽입** — `C:\dev\docs\오늘의내비\소연\소연 내비.md` 열어 마지막 항목 서식 확인, 동일 서식으로 삽입. 날짜는 1단계(b) 값 사용.

2. **`post_comment` 호출** — 2단계 댓글 텍스트를 아래 PowerShell로 등록:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbw3WUMJJyab2uZ33OtZVU1Rv4kvo47cqTaRecEZta4gAtaizN667CV4oZLS8q4nNUTY/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"post_comment","token":"claude-feedback","docId":"DOC_ID","docOwner":"soyoun312@gmail.com","text":"댓글내용","source":"claude"}'
```

응답에 `cmt_` ID 포함 시 성공. 같은 docId 재호출 금지.

3. **(조건부) 피드백지침서.md 업데이트** — "소연의 맥락" 또는 "잘 쓴 장면들" 갱신 필요 시에만. 파일: `C:\dev\docs\오늘의내비\소연\피드백지침서.md`

4. **git add → commit → push**

```bash
cd "C:\dev\docs"
git add -A
git commit -m "소연 내비 추가: [날짜 또는 요약]"
git push origin main
```

**댓글 텍스트 규칙:** 줄바꿈 → `\n`, 큰따옴표 → `\"`. 작성자 자동 "클로드".

**댓글 오등록 시 삭제:**
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://script.google.com/macros/s/AKfycbw3WUMJJyab2uZ33OtZVU1Rv4kvo47cqTaRecEZta4gAtaizN667CV4oZLS8q4nNUTY/exec" -Method POST -ContentType "text/plain;charset=utf-8" -Body '{"action":"delete_comment","token":"claude-feedback","commentId":"CMT_ID","docOwner":"soyoun312@gmail.com"}'
```

---

### 소연 글 — "아카이빙만" 모드

1. 소연 내비.md에 새 글 삽입 (서식 동일)
2. git add → commit → push
3. 피드백 없음. API 호출 없음.

---

### 지오 글

1. `C:\dev\docs\오늘의내비\지오\오늘의 내비(2026~).md` 열어 마지막 항목 서식 확인, 파일 끝에 삽입.
2. git add → commit → push
3. 피드백 없음이 기본. 별도 요청 시 `지오/피드백지침서.md`를 크롤링하고 어구록 DB 검색을 활용한다.

---

## 파일 구조

```
오늘의내비/
├── AGENTS.md          ← 이 문서
├── 지오/
│   ├── 오늘의 내비(2026~).md
│   ├── 오늘의 내비_2025.md
│   ├── 오늘의 내비_2022~2025.md
│   └── 피드백지침서.md
└── 소연/
    ├── 소연 내비.md
    └── 피드백지침서.md   ← Opus 크롤링 대상
```

## GitHub

- 레포: `leftjap/docs` (private)
- Raw base: `https://raw.githubusercontent.com/leftjap/docs/main/`
- 소연 피드백지침서: `https://raw.githubusercontent.com/leftjap/docs/main/오늘의내비/소연/피드백지침서.md`

크롤링 제외: 현재 없음 — 모든 파일 크롤링 가능.

## 변경 이력

- 3/28: AGENTS.md 경량화 (35KB→~5KB). 소연 피드백 지침서를 소연/피드백지침서.md로 분리 (B-31). common-rules.md 중복 제거.
