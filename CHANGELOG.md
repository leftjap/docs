# Changelog — docs

형식: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## 2026-04-02

### Removed
- 서재/scripts/node_modules를 레포에서 제거. .gitignore 추가. (정리)

## 2026-03-31

### Added (seojai)
- clasp 연결 설정 추가. (서재/gas/.clasp.json) (B-63)
- GAS 배포 자동화 스크립트 deploy.ps1 추가 — clasp push + deploy를 한 줄로 실행. (서재/gas/deploy.ps1) (B-63)
- GitHub Actions GAS 자동 배포 workflow — git push → clasp push → clasp deploy 자동 실행. (.github/workflows/deploy-gas-seojai.yml) (B-63)
