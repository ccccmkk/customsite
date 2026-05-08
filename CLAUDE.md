# 다우리 포털 테마 커스터마이저

크롬 확장 프로그램. 대상 사이트: `http://dauri.moel.go.kr` (고용노동부 내부 포털)

## 프로젝트 구조

```
extension/
├── manifest.json   MV3, permissions: activeTab / scripting / storage
├── popup.html      팝업 UI (탭 4개: 색상 / 배경이미지 / 메뉴구성 / 커스텀CSS)
├── popup.js        팝업 로직 (테마 빌드, CSS 생성, storage 저장/불러오기)
└── content.js      페이지 로드 시 자동 적용 (storage → CSS 주입)
```

## 사이트 DOM 구조 (dauri.moel.go.kr 메인)

실제 추출한 DOM 트리 기준. 2026-05-08 확인.

```
body.main
└── div#wrap
    ├── header#header
    │   ├── div.inner                          ← 로고 + 상단 우측 유저 메뉴
    │   │   ├── h1.logo > a#dauriLogo > img
    │   │   └── div.topNavi > ul.gnb
    │   │       ├── li.workArea                 ← 출퇴근 영역
    │   │       ├── li.color1                   ← 이름/ID 표시
    │   │       ├── li > a#nyroModalDeAuth       ← 로그아웃
    │   │       ├── li > a                       ← 개인설정
    │   │       ├── li.themeToggle > button#themeToggleBtn  ← 다크모드
    │   │       ├── li.color2                   ← 소속기관별 관리자
    │   │       ├── li.color3                   ← 관할구역 / 직원검색
    │   │       ├── li.color4                   ← 게시판검색
    │   │       └── li#afwHeaderBar             ← AI 직원검색 헤더 바
    │   ├── div.cr
    │   └── nav
    │       ├── div#lnb > div.inner > ul.topmenu
    │       │   └── li × 5                      ← 온나라 / 관리 / 알림 / 소통ㆍ지원 / 온나라지식
    │       ├── div.inner.darkGnbWrap > ul.darkGnbList
    │       │   └── li.darkGnbItem × 5          ← 드로어 GNB (각각 darkGnbDrawer 포함)
    │       └── div.inner > div.menu_allArea > ul.menu_allList
    │           ├── li#snb1.snb.f_list           ← 온나라 서브메뉴
    │           ├── li#snb2.snb                  ← 관리 서브메뉴
    │           ├── li#snb3.snb                  ← 알림 서브메뉴
    │           ├── li#snb4.snb                  ← 소통ㆍ지원 서브메뉴
    │           └── li#snb5.snb.l_list           ← 온나라지식 서브메뉴
    │
    ├── section.con_01
    │   ├── div.menu_infoArea
    │   │   ├── div.menu01                       ← 메일
    │   │   │   ├── h4 > a "메일"
    │   │   │   └── ul > li × N > div.menuText + div.menuRight
    │   │   ├── div.menu02                       ← 온-나라
    │   │   │   ├── h4 > a "온-나라" + a#nyroModalBmsSort.btnSmallA_01 "설정"
    │   │   │   └── ul#indexBms > li × N
    │   │   ├── div.menu03                       ← e-사람
    │   │   ├── div.menu04                       ← 배우리 / 문자발송
    │   │   │   └── h4 안에 슬래시("/")+img+a+a 혼재 (특이 구조)
    │   │   └── div.menu05                       ← 노사누리
    │   └── div.popzone                          ← 알림판 슬라이드
    │       ├── div.popTitle > h5 + div.popBtn
    │       └── div#issueList.popImg > a > img × N
    │
    ├── section.con_02
    │   ├── div#noticeZone.boardArea
    │   │   ├── div.notice1.board_01             ← 정책공지 / 교육공지 / 일반공지 / 인사(6급이하)
    │   │   │   ├── div.board_title > ul > li.noticeTab_1 × 4 + li.more
    │   │   │   │   └── a.boardTabLink + button.boardTabMore
    │   │   │   └── div#noticeList_1 > ul.bd_list > li × N
    │   │   │       └── span.list_txt > a + span.list_date + div.bbsCnL
    │   │   ├── div.notice1.board_02             ← 오늘의 보도자료 / 보도·설명자료 / 홍보물창고
    │   │   │   └── (board_01과 동일 패턴, bbsCnR)
    │   │   ├── div.notice2.board_03             ← 우리부소식 / 서울청소식 / 지식SOS / 재난안전
    │   │   └── div.notice2.board_04             ← 업무노하우 / 장터마당 / 경조사 / 백인백색
    │   │
    │   └── div.rightContents
    │       ├── div#aiFinderWidget.ai-finder-widget   ← AI 직원 검색 위젯 (신규)
    │       │   ├── div.afw-head
    │       │   ├── div.afw-body > div.afw-bar > input#afwInput + button#afwBtn
    │       │   └── div.afw-chips > span.afw-chip × N
    │       ├── div.myLink                        ← 나의 업무링크
    │       │   ├── h5 + div.linkBtn > a.btnAll + a#nyroModalJoblinkSort
    │       │   └── div#indexJoblink.link_area > ul > li × N
    │       └── div.dauri_faq                    ← 빠른 링크 + 헬프데스크
    │           ├── h5.dauri_faq_link_l/r × N    ← 인사/언론스크랩/업무자료실 등
    │           └── div#helpdeskInfo.helpdesk_info
    │
    └── footer#footer
        ├── div.bannerLink > div.inner
        │   ├── div.footer_nav > ul > li × N     ← 나의게시판설정 / G드라이브 등
        │   └── div.footer_nav1                  ← IP / 최종접속시간
        └── div.inner > div.footer_info
```

## 주요 셀렉터 맵

### 헤더 / GNB

| 영역 | 셀렉터 |
|------|--------|
| 전체 헤더 | `header#header` |
| 로고+유저메뉴 영역 | `header#header > div.inner` |
| LNB (상단 탭) | `div#lnb` |
| 다크 드로어 GNB | `div.inner.darkGnbWrap` |
| SNB (서브메뉴 전체) | `div.menu_allArea` |
| GNB 전체 배경 대상 | `header nav, header nav .inner, header nav #lnb, header nav .darkGnbWrap` |

### 메뉴 위젯 (section.con_01)

| 위젯 | 셀렉터 | 헤더 셀렉터 |
|------|--------|------------|
| 메일 | `.menu_infoArea div.menu01` | `.menu_infoArea div.menu01 h4` |
| 온-나라 | `.menu_infoArea div.menu02` | `.menu_infoArea div.menu02 h4` |
| e-사람 | `.menu_infoArea div.menu03` | `.menu_infoArea div.menu03 h4` |
| 배우리/문자발송 | `.menu_infoArea div.menu04` | `.menu_infoArea div.menu04 h4` |
| 노사누리 | `.menu_infoArea div.menu05` | `.menu_infoArea div.menu05 h4` |
| 알림판 | `div.popzone` | `div.popzone div.popTitle` |

### 게시판 (section.con_02)

| 게시판 | 셀렉터 | 탭 구성 |
|--------|--------|---------|
| 게시판① | `.notice1.board_01` | 정책공지 / 교육공지 / 일반공지 / 인사(6급이하) |
| 게시판② | `.notice1.board_02` | 오늘의 보도자료 / 보도·설명자료 / 홍보물창고 |
| 게시판③ | `.notice2.board_03` | 우리부소식 / 서울청소식 / 지식SOS / 재난안전 |
| 게시판④ | `.notice2.board_04` | 업무노하우 / 장터마당 / 경조사 / 백인백색 |
| 게시판 전체 컨테이너 | `div#noticeZone.boardArea` | |

### 우측 영역

| 영역 | 셀렉터 |
|------|--------|
| 우측 전체 | `div.rightContents` |
| AI 직원검색 위젯 | `div#aiFinderWidget` / `.ai-finder-widget` |
| AI 검색 입력 | `input#afwInput` |
| 나의 업무링크 | `div.myLink` |
| 빠른링크/헬프데스크 | `div.dauri_faq` |

### 공통 버튼 클래스

| 클래스 | 용도 |
|--------|------|
| `.btnSmallA` | 강조 버튼 (go 버튼 등) |
| `.btnSmallA_01` | 온-나라 설정 버튼 |
| `.btnSmall` | 일반 소형 버튼 |
| `.btnreset` | 리셋 버튼 |
| `.btnAll` | 전체보기 버튼 |
| `.boardTabMore` | 게시판 탭 + 버튼 |
| `.boardTabLink` | 게시판 탭 링크 |

### 게시판 리스트 아이템

```css
ul.bd_list > li > span.list_txt > a    /* 제목 링크 */
ul.bd_list > li > span.list_date       /* 날짜 또는 추천수 */
div.bbsCnL                             /* 본문 미리보기 (board_01) */
div.bbsCnR                             /* 본문 미리보기 (board_02) */
```

## 테마 데이터 스키마 (chrome.storage.local → 'portalTheme')

```json
{
  "colors": {
    "headerBg": "#1a3a6e",
    "gnbBg": "#0f2744",
    "gnbText": "#ffffff",
    "widgetHeaderBg": "#3366cc",
    "widgetHeaderText": "#ffffff",
    "menuHdBg": "#f1f1f1",
    "menuHdText": "#333333",
    "menuText": "#444444",
    "accent": "#0a808f",
    "btnDefault": "#435a7c",
    "btnReset": "#2d7ee1",
    "boardBg": "#ffffff",
    "enabled": {
      "headerBg": true,
      "gnbBg": true,
      "gnbText": false,
      "widgetHeaderBg": false,
      "widgetHeaderText": false,
      "menuHd": false,
      "menuText": false,
      "accent": false,
      "btnDefault": false,
      "btnReset": false,
      "boardBg": false
    }
  },
  "backgrounds": [
    {
      "id": "_xxxxx",
      "selector": ".menu_infoArea",
      "imageData": "data:image/png;base64,...",
      "size": "cover",
      "position": "center",
      "repeat": "no-repeat",
      "overlay": 0.3
    }
  ],
  "menuConfig": {
    "lnb": true,
    "gnbInner": true,
    "result": true,
    "menu01": true,
    "menu02": true,
    "menu03": true,
    "menu04": true,
    "menu05": true
  },
  "layoutConfig": {
    "showHeader":       true,
    "showFooter":       true,
    "showMyLink":       true,
    "showDauriFaq":     true,
    "menuAreaCentered": false,
    "menuUlHidden":     false
  },
  "boardPanels": {
    "board_01": { "hidden": false, "imageData": null, "mode": "overlay" },
    "board_02": { "hidden": false, "imageData": null, "mode": "overlay" },
    "board_03": { "hidden": false, "imageData": null, "mode": "overlay" },
    "board_04": { "hidden": false, "imageData": null, "mode": "overlay" },
    "popzone":  { "hidden": false, "imageData": null, "mode": "overlay" }
  },
  "customCSS": ""
}
```

### layoutConfig 옵션

| 키 | 기본값 | 설명 |
|----|--------|------|
| `showHeader` | true | false → `header#header { display:none }` |
| `showFooter` | true | false → `footer#footer { display:none }` |
| `showMyLink` | true | false → `.myLink { display:none }` |
| `showDauriFaq` | true | false → `.dauri_faq { display:none }` |
| `menuAreaCentered` | false | true → `.menu_infoArea` flex 가운데 정렬, 박스 제거 |
| `menuUlHidden` | false | true → 각 메뉴 위젯 내 `ul` 숨김 (h4 헤더만 표시) |

### boardPanels.mode 옵션

- `overlay`: CSS `::after`로 이미지 오버레이, PNG 투명도 유지 (캐릭터 누끼용)
- `cover`: CSS `::after` 흰 배경 + 이미지, 원본 콘텐츠 완전 교체

## 배경이미지 타겟 옵션 (popup.js TARGET_OPTIONS)

```
.menu_infoArea    메뉴 전체 영역
body              페이지 전체
header            헤더
.con_01           메뉴+알림판 섹션
.con_02           게시판+우측 섹션
.boardArea        게시판 영역 전체
.rightContents    우측 컨텐츠
__custom__        직접 입력
```

## 특이사항 / 주의

- `div.menu04 h4` 내부 구조가 특이함: `"/" + img + a("배우리") + a("문자발송")` 혼재
- `generateCSS` 함수가 `content.js`와 `popup.js` 양쪽에 중복 존재 (미세한 차이 있음, 수정 시 양쪽 동기화 필요)
- `menuConfig.result` 숨김 대상은 `header nav .inner:not(#lnb):not(.darkGnbWrap)` → SNB(menu_allArea) 영역
- `.ui-widget-header`는 datepicker 위젯에만 존재, 메뉴 h4와 무관
- AI 직원검색(`#aiFinderWidget`) 관련 클래스는 `.afw-*` 접두사 사용
- 다크모드 토글 버튼 `button#themeToggleBtn` 은 사이트 자체 기능 (확장과 별개)
