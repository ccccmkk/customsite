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

  // ── 레이아웃 설정 ──
  const lc = theme.layoutConfig || {};
  if (lc.showHeader === false)   css += `header#header { display: none !important; }\n`;
  if (lc.showFooter === false)   css += `footer#footer { display: none !important; }\n`;
  if (lc.showMyLink === false)   css += `.myLink { display: none !important; }\n`;
  if (lc.showDauriFaq === false) css += `.dauri_faq { display: none !important; }\n`;
  if (lc.menuUlHidden) {
    const s = [1,2,3,4,5].map(i => `.menu_infoArea div.menu0${i} ul`).join(', ');
    css += `${s} { display: none !important; }\n`;
  }
  if (lc.menuAreaCentered) {
    css += `.menu_infoArea { display: flex !important; justify-content: center !important; align-items: flex-start !important; flex-wrap: wrap !important; gap: 16px !important; background: transparent !important; border: none !important; box-shadow: none !important; padding: 16px 0 !important; width: 100% !important; }\n`;
    css += `.menu_infoArea > div { float: none !important; width: auto !important; min-width: 160px !important; max-width: 240px !important; flex: 0 0 auto !important; }\n`;
  }

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

const LAYOUT_ID = '__ptheme_layout__';

function applyTheme(theme) {
  document.getElementById(STYLE_ID)?.remove();
  removeCustomLayout();
  if (!theme) return;

  // 커스텀 레이아웃이 활성화된 경우 전체 화면 교체
  const cl = theme.customLayout;
  if (cl?.enabled && cl.shapes?.length) {
    injectCustomLayout(cl);
    return; // CSS 테마는 적용하지 않음 (레이아웃이 덮으므로)
  }

  const css = generateCSS(theme);
  if (!css.trim()) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function injectCustomLayout(layout) {
  const existing = document.getElementById(LAYOUT_ID);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = LAYOUT_ID;
  overlay.style.cssText = [
    'position:fixed;inset:0;z-index:2147483647',
    `background:${layout.background||'#f0f2f5'}`,
    'overflow:hidden;font-family:\'Malgun Gothic\',sans-serif',
  ].join(';');

  (layout.shapes || []).forEach(shape => {
    const el = document.createElement(shape.link ? 'a' : 'div');
    if (shape.link) { el.href = shape.link; el.target = '_blank'; }
    el.style.cssText = [
      'position:absolute',
      `left:${shape.x / 12}%`, // scale 1200px → 100vw
      `top:${shape.y / 7}%`,   // scale 700px → 100vh
      `width:${shape.w / 12}%`,
      `height:${shape.h / 7}%`,
      `background:${shape.fill||'#2a8080'}`,
      `color:${shape.color||'#fff'}`,
      `border-radius:${shape.borderRadius||0}px`,
      `font-size:${(shape.fontSize||14)/12}vw`,
      `font-weight:${shape.fontWeight||'bold'}`,
      `border:${shape.borderWidth||0}px solid ${shape.borderColor||'transparent'}`,
      `box-shadow:${shape.shadow?'0 2px 8px rgba(0,0,0,.2)':'none'}`,
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'text-align:center;text-decoration:none;cursor:' + (shape.link ? 'pointer' : 'default'),
      'overflow:hidden;box-sizing:border-box;padding:4px',
      `z-index:${shape.zIndex||1}`,
    ].join(';');
    if (shape.icon) {
      const ic = document.createElement('div');
      ic.style.cssText = `font-size:${(shape.fontSize||14)*1.6/12}vw;line-height:1;margin-bottom:0.2em`;
      ic.textContent = shape.icon;
      el.appendChild(ic);
    }
    if (shape.text) {
      const tx = document.createElement('div');
      tx.style.cssText = `line-height:1.25;word-break:break-word`;
      tx.textContent = shape.text;
      el.appendChild(tx);
    }
    overlay.appendChild(el);
  });

  document.body.appendChild(overlay);
}

function removeCustomLayout() {
  document.getElementById(LAYOUT_ID)?.remove();
}

function removeTheme() {
  document.getElementById(STYLE_ID)?.remove();
  removeCustomLayout();
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
