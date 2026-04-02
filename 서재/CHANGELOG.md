# Changelog — 서재 어구록

형식: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## 2026-04-03

### Added
- GAS 백업 함수 추가: `_getSeojaiBackupFolder()`, `_backupQuotesIfNeeded()`. 매일 1회 자동 백업, 30일 보관. (gas/Code.js)

### Changed
- 백업 파일 저장 경로를 backups/ 폴더로 분리 — `apps/서재/` → `backups/서재/`. 운영 DB 경로는 유지. `saveQuotesData` 호출 시 백업 자동 실행. (gas/Code.js)

## 2026-04-02

### Changed
- GAS Drive 경로 변경: getQuotesFile 기준점을 DriveApp.getRootFolder()/seojai-quotes에서 apps/서재/로 이동 — Drive 정리에 맞춘 경로 통일. (gas/Code.js)
