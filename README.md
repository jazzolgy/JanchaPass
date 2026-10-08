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

## iPhone → BSC500 실기기 확인 (2026-10)

- **확인됨:** iPhone에서 JanchaPass 경로의 GPX 파일 다운로드 성공 (사용자 테스트).
- **미확인:** iGPSPORT 앱에서 GPX 가져오기 및 BSC500으로 전송/경로 표시.

### 다음 테스트

1. iPhone **파일** 앱 → **다운로드**에서 JanchaPass `.gpx` 파일을 찾습니다.
2. 파일을 길게 눌러 **공유** → iGPSPORT 앱이 보이면 선택합니다. 앱이 보이지 않으면 iGPSPORT 앱 내부의 경로/코스 가져오기 메뉴가 있는지 확인합니다.
3. 앱에 코스가 나타나면 BSC500과 블루투스 연결 후 코스/내비게이션 동기화를 시도합니다.
4. BSC500 화면에서 코스의 거리·트랙·출발 위치가 올바른지 확인합니다. 실제 도로 주행 전 안전한 장소에서 확인합니다.
5. 실패하면 **어느 단계에서**, **표시된 오류 메시지**, **iGPSPORT 앱 버전**을 기록합니다.

주의: 앱 메뉴명·GPX 가져오기 가능 여부는 iGPSPORT 앱 버전에 따라 다를 수 있습니다. 제조사 직접 클라우드 동기화 기능은 구현되지 않았습니다.

## BSC500 end-to-end validation (2026-10-08)

**Confirmed by user on actual iPhone and iGPSPORT BSC500:** JanchaPass GPX downloaded on iPhone → imported into iGPSPORT app → transferred to BSC500 → applied as navigation route.

**Not yet verified:** on-road turn-by-turn cue accuracy, off-route alerts, rerouting, long-distance track handling, Garmin/BiNavi compatibility, map SDK authentication. This is manual GPX import, **not** a direct manufacturer API integration.

## v1.1 mobile + map provider setup

The app now includes a web manifest, scalable icon, responsive Android/iOS touch layout, and `config.js` for browser-public map SDK credentials. GitHub Pages serves the same URL on Android Chrome and iPhone Safari. **Android hardware transfer has not been tested yet.** This is a PWA shell, not a Play Store native app; offline route calculation is not supported.

### Naver Maps

1. In Naver Cloud Platform create a Maps application with **Dynamic Map** (Web SDK) enabled, subject to the provider's current product/approval requirements.
2. Register the actual service origin `https://jazzolgy.github.io` in the provider's permitted web origins (follow the provider's current exact URL/origin registration rules).
3. Put the browser-public Maps **ncpKeyId** in `config.js` as `naver`. Never use a secret key.

### Kakao Maps

1. In Kakao Developers create an app and enable the **JavaScript Maps SDK** for the current service, following its current permissions and billing policies.
2. Register the web site domain/origin `https://jazzolgy.github.io` as required by Kakao Developers.
3. Put the **JavaScript key** (not REST/admin key) in `config.js` as `kakao`.

Browser SDK keys are publicly visible to anyone visiting the site. Use provider-side domain restrictions, monitor usage and quotas, and do not store secret credentials in this public repository. No actual SDK credentials have been supplied or validated. If keys are blank, OSM is used automatically. Naver and Kakao maps are display SDKs here; route geometry still comes from public Valhalla, so provider license terms for third-party overlays need review before commercial launch.

### Android

Open `https://jazzolgy.github.io/Janchpass/` in Chrome. Chrome menu → **Add to Home screen** or **Install app** if offered. Create a route → download GPX → use the phone's Files/Downloads or Share menu to import to the device maker's app. Manufacturer app import steps depend on Android version and vendor app; not yet verified on a real Android phone.

## Naver Dynamic Map live validation (2026-10-08)

User confirmed Naver Maps SDK successfully renders on deployed JanchaPass site using their own browser Client ID. **Do not commit Client Secret.** The ID has not been provided to the repository, so automatic Naver map startup is not yet configured. Pending: tap-to-select points on Naver map, Valhalla route overlay and GPX export; Android device verification; Kakao SDK credential test.
