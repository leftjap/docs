# Sentry MCP 연동 기록

## 배경
Claude Desktop 코드 탭에서 OAuth 인증이 필요한 MCP 서버를 사용할 수 없는 버그 존재 (GitHub issue #11585, #16097). 코드 탭은 내부적으로 CLI를 실행하므로 브라우저 OAuth 팝업이 뜨지 않음.

## 해결 방법: stdio + Access Token
설정 파일: C:\Users\leftj\.claude.json

```json
"mcpServers": {
  "sentry": {
    "command": "npx",
    "args": ["@sentry/mcp-server@latest", "--access-token=YOUR_TOKEN"],
    "env": {}
  }
}
```

토큰 생성: Sentry → Settings → API → Auth Tokens
필요 권한: org:read, project:read, team:read, event:read

## 연동 확인
organization: leftjap / 프로젝트: explorer, gym, keep, study

## 문서 반영 설계

핵심 고민: 경량화 원칙 vs Haiku 실수 방지

검토 후 기각된 안:
- docs/sentry-mcp-guide.md 별도 생성 → Opus가 로컬 파일 읽기 불가
- common-rules.md에 파라미터 상세 기재 → Haiku 스키마 자동 로드하므로 불필요
- opus.md에 20개 도구 전체 기재 → lost in the middle 문제
- 도구명만 쓰고 파라미터 생략 → Haiku가 값을 임의 추론

최종 결론: Haiku 실수 원인은 스키마가 아니라 값(leftjap 등)을 모르는 것.
- opus.md 2줄: Opus에게 도구명+값 명시 리마인드
- common-rules.md 4줄: Haiku에게 org/프로젝트 값 직접 제공
- 이중 안전장치로 값 누락 원천 차단

## 최종 반영 내용
1. common-rules.md 끝에 Sentry MCP 블록 4줄 추가
2. opus.md 상태표 2개 라인에 ", MCP(stdio) 연동" 추가
3. opus.md 운영 방침에 2줄 추가
4. 별도 파일 생성 없음, 기존 내용 수정 없음

## 보안 주의
- 연동 확인 후 노출된 토큰을 Sentry에서 폐기하고 새로 발급할 것
- Sentry 데이터는 untrusted input으로 취급

## 주의사항
- docs 폴더가 없으면 생성한다
- 파일 생성 후 내용을 다시 읽어 확인한다
