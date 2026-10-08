# JanchaPass (잔차패스)

한국 자전거 경로 생성 및 GPX/TCX 다운로드 웹 시제품입니다.

## 이용 및 테스트

1. GitHub Pages를 활성화한 후 `https://jazzolgy.github.io/Janchpass/`에 접속합니다.
2. 지도에서 **OpenStreetMap**을 선택해 API 키 없이 테스트합니다.
3. 출발지와 도착지를 지정하고 경로를 계산해 GPX를 내려받습니다.
4. iPhone에서 GPX를 iGPSPORT 앱에 가져오고 BSC500으로 동기화할 수 있는지 실제 확인합니다.

## GitHub Pages 활성화

Settings → Pages → Build and deployment → **Deploy from a branch** → **main / (root)** → Save.

## 중요 제한

- 네이버/카카오/구글 지도는 SDK용 인증키와 사이트 도메인 등록이 필요하며 아직 실인증 미검증입니다.
- Valhalla·Nominatim 공용 데모 API를 사용하므로 요청 실패·한국 지역 경로 품질 문제가 있을 수 있습니다. 상용 서비스용 백엔드는 추후 구축해야 합니다.
- GPX 및 TCX 파일을 만들지만 BSC500·Garmin·BiNavi 실기기 전송은 아직 검증되지 않았습니다.
- API 키와 약관을 확인하지 않고 지도 SDK나 경로 데이터의 상용 사용을 진행하지 마세요.

브랜드: **JanchaPass**, GitHub 저장소 이름: **Janchpass** (현재 주소 유지).
