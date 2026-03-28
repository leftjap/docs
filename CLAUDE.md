# CLAUDE.md — docs

> 공통 실행 규칙은 playbook CLAUDE.md 참조.
> 이 파일은 docs 레포 고유 주의사항만 담는다.

## docs 레포 구조
이 레포는 여러 프로젝트의 문서를 담는다. 각 프로젝트에 AGENTS.md가 있다.
- 서재/ — 어구록 관리. AGENTS.md + gas-api-reference.md
- 오늘의내비/ — 일기 아카이브 + AI 피드백. AGENTS.md
- 투자 전략/ — 크립토 투자 마스터 문서. AGENTS.md

## docs 고유 주의
- gas/Code.js 수정 후 반드시 clasp push + 웹앱 재배포
- 서재 archive/ 폴더 파일은 수정하지 않는다
- 오늘의내비 원문 일기를 임의로 수정하지 않는다
- 크립토 마스터 문서의 분석 결론을 자의적으로 변경하지 않는다

## 소스 파일 확인
- 서재 소스: PROJECT: seojai-quotes
- 오늘의내비 소스: PROJECT: onenavi
- 크립토 소스: PROJECT: crypto
- 업로드된 파일의 PROJECT 주석이 현재 작업 프로젝트와 불일치하면 즉시 중단
