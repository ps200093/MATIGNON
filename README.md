# MATIGNON · Mobile invitation

모바일 전용 브랜드 행사/프라이빗 파티 초대장입니다. 공식 MATIGNON 로고와 새로 생성한 재즈 라운지 이미지를 사용합니다. 버건디 벨벳·월넛·앰버 조명, 아이보리 초대 문구, 느린 이미지 모션, RSVP 바텀시트, 링크 공유와 다운로드 가능한 QR을 포함합니다. 생성 이미지는 실제 매장 사진이 아닌 콘셉트이며 화면에도 표시합니다. 이미지 경로와 프롬프트는 `docs/image-assets.md`에 기록했습니다.

## 실행

Node.js 24 이상:

```powershell
npm install
npm run dev
```

`http://localhost:5173`에서 미리보기. 휴대폰에서는 같은 Wi-Fi의 PC IPv4 주소에 `:5173`을 붙여 접속합니다. 개발 서버 접근은 방화벽 설정에 영향을 받습니다. 해당 휴대폰 주소로 열면 그 주소의 QR이 생성됩니다. 외부 공유용 URL은 공개 HTTPS 배포가 필요합니다.

## 설정 및 실제 RSVP

기본값은 **preview**입니다. 미리보기에서도 API 호출·검증·응답 확인까지 동작하지만 개인정보를 서버에 저장하지 않습니다. 실제 행사명/일정/주소는 아직 제공되지 않았습니다.

`.env.example`을 `.env`로 복사해 실제 값을 입력합니다. `EVENT_START`와 `EVENT_END`는 `2026-12-01T19:00:00+09:00` 같은 ISO 형식입니다. `PUBLIC_URL`은 사이트의 HTTPS 루트 주소입니다. `PRIVACY_NOTICE`에는 주최 측이 승인한 수집 항목/목적/보유 기간/거부 안내 등을 넣으세요. 값이 모두 준비되면 `RSVP_MODE=live`로 변경합니다. 실제 행사 초대장 배포 전 미리보기 문구, OG 이미지 절대 주소, 운영 정책을 확인하세요.

```powershell
npm run build
npm start
```

Node 서버가 `dist`와 API를 함께 제공합니다. 기본 바인딩은 127.0.0.1:3001이며 필요한 환경에서 `HOST=0.0.0.0`으로 설정합니다. HTTPS 리버스 프록시와 영구 디스크가 있는 Node 호스팅을 사용하세요. 일회성/서버리스 파일시스템은 SQLite 영구 저장에 적합하지 않습니다. 다중 서버, 개인별 초대 권한, 잔여석/대기명단, 중복 인물 확인, 관리자 웹 화면은 현재 범위에 없습니다. 링크 소유자는 응답할 수 있으며 이름만으로 동일인을 판정하지 않습니다.

실제 응답은 `data/rsvp.sqlite`에 저장하며 외부 조회 API는 없습니다. 반복 클릭·네트워크 재시도는 idempotency key로 중복 저장을 방지합니다. 이름 외 연락처는 수집하지 않습니다. 기본 레이트 제한은 단일 프로세스 IP당 분당 30회이며 프록시 뒤에서는 하나의 IP로 집계될 수 있습니다. 실운영 규모에 맞는 제한 및 운영자가 정한 보존·삭제/백업 절차가 필요합니다.

운영자가 로컬에서 조회/내보내기:

```powershell
npm run export:rsvp --silent > responses.json
```

생성된 응답 파일은 개인정보이므로 공개 폴더나 Git에 넣지 마세요.

## Vercel 배포

Vercel은 Vite 프런트엔드(`dist`)와 `api/event.js`, `api/rsvp.js`를 함께 배포합니다. 두 함수는 로컬 Node 서버와 동일한 요청 처리 로직을 사용합니다. 개발용 Vite 프록시나 `npm start`는 Vercel에서 API를 생성하지 않습니다. Node 버전은 24.x로 고정합니다.

현재 Vercel 배포는 `RSVP_MODE=preview`(기본값)로 초대장 조회와 RSVP 미리보기를 제공합니다. 개인정보를 저장하지 않습니다. 실제 응답 수집에는 영구 저장소 연동이 필요하며, Vercel에서 `RSVP_MODE=live`만 켜면 SQLite 데이터가 유실될 수 있어 명시적으로 차단합니다. 영구 디스크가 있는 독립 Node 서버의 live 모드는 계속 지원됩니다.

배포 후 `/api/event`가 HTTP 200 JSON을 반환하는지 확인하고, 공개 주소를 대상으로 브라우저 검증을 실행합니다:

```powershell
$env:TEST_URL='https://matignon.vercel.app'
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run verify
```

## 검증

```powershell
npm test
npm run build
npm run verify
```

`verify`는 실행 중인 개발 서버(`http://127.0.0.1:5173`)를 사용합니다. Chromium 설치가 필요할 경우 `npx playwright install chromium`을 실행합니다. 설치된 Chrome을 쓰려면 PowerShell에서 `$env:PLAYWRIGHT_CHANNEL='chrome'`을 설정하세요. 브라우저 검증 스크린샷은 `artifacts/`에 저장됩니다. 실제 공개 배포나 실제 휴대폰 테스트와 로컬 Chromium 검증은 별개입니다.
