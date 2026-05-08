// ════════════════════════════════════════
//  포털 테마 커스터마이저 — content.js
//  페이지 로드 시 저장된 테마 자동 적용
// ════════════════════════════════════════

const STYLE_ID = '__ptheme_style__';

function generateCSS(theme) {
  if (!theme) return '';
  let css = '/* 포털 테마 커스터마이저 */\n';
  const c = theme.colors || {};

  // ── 색상 오버라이드 ──
  const en = c.enabled || {};

  if (en.headerBg && c.headerBg)
    css += `header { background-color: ${c.headerBg} !important; }\n`;

  if (en.gnbBg && c.gnbBg)
    css += `header nav, header nav .inner, header nav #lnb, header nav .darkGnbWrap { background-color: ${c.gnbBg} !important; }\n`;

  if (en.gnbText && c.gnbText)
    css += `header nav a, header nav span, header nav li { color: ${c.gnbText} !important; }\n`;

  if (en.widgetHeaderBg && c.widgetHeaderBg)
    css += `.ui-widget-header { background-color: ${c.widgetHeaderBg} !important; background-image: none !important; }\n`;

  if (en.widgetHeaderText && c.widgetHeaderText)
    css += `.ui-widget-header, .ui-widget-header a { color: ${c.widgetHeaderText} !important; }\n`;

  if (en.menuHd && c.menuHdBg) {
    const sel = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} h4`).join(',\n');
    css += `${sel} { background-color: ${c.menuHdBg} !important; background-image: none !important; }\n`;
  }
  if (en.menuHd && c.menuHdText) {
    const sel = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} h4`).join(',\n');
    css += `${sel} { color: ${c.menuHdText} !important; }\n`;
  }

  if (en.menuText && c.menuText)
    css += `.menu_infoArea div.menuText, .menu_infoArea div.menuRight { color: ${c.menuText} !important; }\n`;

  if (en.accent && c.accent) {
    css += `.btnSmallA, .btnAll, .btnSmallA_01 { background-color: ${c.accent} !important; }\n`;
    const spans = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} ul li div.menuRight span.on`).join(',\n');
    css += `${spans} { color: ${c.accent} !important; }\n`;
    css += `.board_title ul li .boardTabMore:hover { border-color: ${c.accent} !important; color: ${c.accent} !important; }\n`;
  }

  if (en.btnDefault && c.btnDefault)
    css += `.btnSmall { background-color: ${c.btnDefault} !important; }\n`;

  if (en.btnReset && c.btnReset)
    css += `.btnreset { background-color: ${c.btnReset} !important; }\n`;

  if (en.boardBg && c.boardBg)
    css += `.boardArea, .rightContents { background-color: ${c.boardBg} !important; }\n`;

  // ── 배경 이미지 ──
  const bgs = theme.backgrounds || [];
  bgs.forEach(bg => {
    if (!bg.selector || !bg.imageData) return;
    const overlay = bg.overlay !== undefined ? bg.overlay : 0;
    const rgba = `rgba(0,0,0,${overlay.toFixed(2)})`;
    const size = bg.size || 'cover';
    const pos  = bg.position || 'center';
    const rep  = bg.repeat || 'no-repeat';
    css += `${bg.selector} {\n`;
    css += `  background: linear-gradient(${rgba},${rgba}), url("${bg.imageData}") ${pos}/${size} ${rep} !important;\n`;
    css += `}\n`;
  });

  // ── 메뉴 표시/숨김 ──
  const mc = theme.menuConfig || {};
  ['menu01','menu02','menu03','menu04','menu05'].forEach(m => {
    if (mc[m] === false)
      css += `.menu_infoArea div.${m} { display: none !important; }\n`;
  });
  if (mc.lnb === false)    css += `header nav #lnb { display: none !important; }\n`;
  if (mc.gnbInner === false) css += `header nav .darkGnbWrap { display: none !important; }\n`;
  if (mc.result === false)   css += `header nav .inner:not(#lnb):not(.darkGnbWrap) { display: none !important; }\n`;

  // ── 게시판 · 알림판 패널 ──
  const BOARD_SEL = {
    board_01: '.notice1.board_01',
    board_02: '.notice1.board_02',
    board_03: '.notice2.board_03',
    board_04: '.notice2.board_04',
    popzone:  'div.popzone',
  };
  const bp = theme.boardPanels || {};
  Object.entries(BOARD_SEL).forEach(([key, sel]) => {
    const cfg = bp[key] || {};
    if (cfg.hidden) {
      css += `${sel} { display: none !important; }\n`;
    } else if (cfg.imageData) {
      css += `${sel} { position: relative !important; overflow: hidden !important; }\n`;
      if (cfg.mode === 'cover') {
        css += `${sel}::after { content:'' !important; position:absolute !important; inset:0 !important; background: white url("${cfg.imageData}") center/contain no-repeat !important; z-index:100 !important; }\n`;
      } else {
        css += `${sel}::after { content:'' !important; position:absolute !important; inset:0 !important; background: url("${cfg.imageData}") center/contain no-repeat !important; z-index:100 !important; pointer-events:none !important; }\n`;
      }
    }
  });

  // ── 커스텀 CSS ──
  if (theme.customCSS && theme.customCSS.trim())
    css += '\n/* ─ 커스텀 CSS ─ */\n' + theme.customCSS + '\n';

  return css;
}

function applyTheme(theme) {
  document.getElementById(STYLE_ID)?.remove();
  if (!theme) return;
  const css = generateCSS(theme);
  if (!css.trim()) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function removeTheme() {
  document.getElementById(STYLE_ID)?.remove();
}

// 페이지 로드 시 자동 적용
chrome.storage.local.get('portalTheme', data => {
  if (data.portalTheme) applyTheme(data.portalTheme);
});

// 팝업 메시지 수신
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'apply')  applyTheme(msg.theme);
  if (msg.type === 'remove') removeTheme();
});
