// ════════════════════════════════════════
//  포털 테마 커스터마이저 — popup.js
// ════════════════════════════════════════

// ── 탭 전환 ──
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ── 색상 키 목록 ──
const COLOR_KEYS = [
  'headerBg','gnbBg','gnbText',
  'widgetHeaderBg','widgetHeaderText',
  'menuHdBg','menuHdText','menuText',
  'accent','btnDefault','btnReset','boardBg'
];

// ── 토글 ──
document.querySelectorAll('.toggle').forEach(tog => {
  tog.addEventListener('click', () => {
    tog.classList.toggle('on');
  });
});

function isEnabled(key) {
  return document.getElementById('tg_' + key)?.classList.contains('on') || false;
}

function setToggle(key, val) {
  const el = document.getElementById('tg_' + key);
  if (el) el.classList.toggle('on', val);
}

// ── 색상 피커 ↔ HEX 입력 연동 ──
function validHex(str) {
  str = str.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{3}$/.test(str)) {
    const [,a,b,c] = str;
    return '#'+a+a+b+b+c+c;
  }
  return null;
}

COLOR_KEYS.forEach(key => {
  const cp = document.getElementById('cp_' + key);
  const hx = document.getElementById('hx_' + key);
  if (!cp) return;

  if (cp) cp.addEventListener('input', () => {
    if (hx) hx.value = cp.value;
  });
  if (hx) {
    hx.addEventListener('input', () => {
      const v = validHex(hx.value);
      if (v) cp.value = v;
    });
    hx.addEventListener('change', () => {
      const v = validHex(hx.value);
      if (!v) hx.value = cp.value;
      else cp.value = v;
    });
  }
});

// ── 배경 이미지 ──
const TARGET_OPTIONS = [
  { val: '.menu_infoArea',  label: '메뉴 전체 영역' },
  { val: 'body',            label: '페이지 전체 (body)' },
  { val: 'header',          label: '헤더' },
  { val: '.con_01',         label: 'con_01 (메뉴+팝업)' },
  { val: '.con_02',         label: 'con_02 (게시판+우측)' },
  { val: '.boardArea',      label: '게시판 영역' },
  { val: '.rightContents',  label: '우측 컨텐츠' },
  { val: '__custom__',      label: '직접 입력...' },
];

let bgCards = [];
let bgEditId = null;

document.getElementById('addBgBtn').addEventListener('click', () => {
  const id = '_' + Math.random().toString(36).slice(2,7);
  bgCards.push({ id, selector: '.menu_infoArea', imageData: null, size: 'cover', position: 'center', repeat: 'no-repeat', overlay: 0.3 });
  renderBgList();
});

document.getElementById('bgFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const card = bgCards.find(c => c.id === bgEditId);
    if (card) { card.imageData = ev.target.result; renderBgList(); }
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

function renderBgList() {
  const list = document.getElementById('bgList');
  if (!bgCards.length) {
    list.innerHTML = '<div class="bg-none">배경 없음 — 아래 버튼으로 추가</div>';
    return;
  }
  list.innerHTML = '';
  bgCards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'bg-card';

    // 헤더
    const hd = document.createElement('div'); hd.className = 'bg-card-hd';
    const titleEl = document.createElement('div'); titleEl.className = 'bg-card-title';
    titleEl.textContent = TARGET_OPTIONS.find(o=>o.val===card.selector)?.label || card.selector;
    const rm = document.createElement('button'); rm.className = 'bg-remove'; rm.textContent = '✕';
    rm.addEventListener('click', () => { bgCards = bgCards.filter(c=>c.id!==card.id); renderBgList(); });
    hd.append(titleEl, rm); div.appendChild(hd);

    // 대상 선택
    const selRow = document.createElement('div'); selRow.className = 'row'; selRow.style.marginBottom='6px';
    const selLabel = document.createElement('span'); selLabel.className='row-label'; selLabel.textContent='적용 대상';
    const sel = document.createElement('select');
    TARGET_OPTIONS.forEach(opt => {
      const o = document.createElement('option'); o.value=opt.val; o.textContent=opt.label;
      if(opt.val===card.selector) o.selected=true;
      sel.appendChild(o);
    });
    const customInp = document.createElement('input');
    customInp.type='text'; customInp.className='hex-input';
    customInp.style.cssText='width:100%;margin-top:4px;display:'+(card.selector==='__custom__'?'block':'none');
    customInp.placeholder='.my-selector'; customInp.value=card.customSel||'';
    sel.addEventListener('change', () => {
      card.selector = sel.value;
      customInp.style.display = sel.value==='__custom__'?'block':'none';
      titleEl.textContent = TARGET_OPTIONS.find(o=>o.val===sel.value)?.label||sel.value;
    });
    customInp.addEventListener('input', () => { card.customSel=customInp.value; card.selector=customInp.value||'__custom__'; });
    selRow.append(selLabel, sel); div.appendChild(selRow); div.appendChild(customInp);

    // 이미지 업로드
    const upBtn = document.createElement('button'); upBtn.className='upload-btn';
    upBtn.textContent = card.imageData ? '🖼 이미지 변경' : '📁 이미지 선택 (PNG/JPG/GIF)';
    upBtn.addEventListener('click', () => { bgEditId=card.id; document.getElementById('bgFileInput').click(); });
    div.appendChild(upBtn);

    if (card.imageData) {
      const prev = document.createElement('img'); prev.className='img-preview'; prev.src=card.imageData;
      div.appendChild(prev);
    }

    // 크기
    const szRow = document.createElement('div'); szRow.className='row'; szRow.style.marginTop='6px';
    const szLbl = document.createElement('span'); szLbl.className='row-label'; szLbl.textContent='크기';
    const szSel = document.createElement('select'); szSel.style.flex='1';
    [['cover','꽉 채우기'],['contain','전체 보이기'],['auto','원본 크기'],['100% 100%','늘리기']].forEach(([v,l])=>{
      const o=document.createElement('option'); o.value=v; o.textContent=l;
      if(v===card.size) o.selected=true; szSel.appendChild(o);
    });
    szSel.addEventListener('change', ()=>card.size=szSel.value);
    szRow.append(szLbl,szSel); div.appendChild(szRow);

    // 위치
    const psRow = document.createElement('div'); psRow.className='row';
    const psLbl = document.createElement('span'); psLbl.className='row-label'; psLbl.textContent='위치';
    const psSel = document.createElement('select'); psSel.style.flex='1';
    [['center','가운데'],['top','상단'],['bottom','하단'],['left','왼쪽'],['right','오른쪽']].forEach(([v,l])=>{
      const o=document.createElement('option'); o.value=v; o.textContent=l;
      if(v===card.position) o.selected=true; psSel.appendChild(o);
    });
    psSel.addEventListener('change', ()=>card.position=psSel.value);
    psRow.append(psLbl,psSel); div.appendChild(psRow);

    // 어둡기
    const opRow = document.createElement('div'); opRow.className='slider-row'; opRow.style.marginTop='5px';
    const opLbl = document.createElement('div'); opLbl.className='slider-label'; opLbl.textContent='어둡기';
    const opSl = document.createElement('input'); opSl.type='range'; opSl.min=0; opSl.max=0.9; opSl.step=0.05; opSl.value=card.overlay;
    const opVl = document.createElement('div'); opVl.className='slider-val'; opVl.textContent=Math.round(card.overlay*100)+'%';
    opSl.addEventListener('input', ()=>{ card.overlay=parseFloat(opSl.value); opVl.textContent=Math.round(card.overlay*100)+'%'; });
    opRow.append(opLbl,opSl,opVl); div.appendChild(opRow);

    list.appendChild(div);
  });
}

// ── 메뉴 체크박스 ──
const MENU_KEYS = ['lnb','gnbInner','result','menu01','menu02','menu03','menu04','menu05'];

// ── 레이아웃 설정 ──
const LAYOUT_DEFAULTS = {
  showHeader:       true,
  showFooter:       true,
  showMyLink:       true,
  showDauriFaq:     true,
  menuAreaCentered: false,
  menuUlHidden:     false,
};

// ── 게시판 · 알림판 패널 ──
const BOARD_PANEL_DEFS = [
  { key: 'board_01', label: '게시판① 정책/교육/일반공지', icon: '📋' },
  { key: 'board_02', label: '게시판② 보도자료',           icon: '📰' },
  { key: 'board_03', label: '게시판③ 우리부소식',          icon: '📢' },
  { key: 'board_04', label: '게시판④ 업무노하우',          icon: '💡' },
  { key: 'popzone',  label: '알림판',                     icon: '🖼' },
];

let boardPanelConfig = {};
BOARD_PANEL_DEFS.forEach(d => {
  boardPanelConfig[d.key] = { hidden: false, imageData: null, mode: 'overlay' };
});

let panelFileKey = null;

document.getElementById('panelFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || !panelFileKey) return;
  const reader = new FileReader();
  reader.onload = ev => {
    boardPanelConfig[panelFileKey].imageData = ev.target.result;
    renderBoardPanels();
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

function renderBoardPanels() {
  const area = document.getElementById('boardPanelArea');
  area.innerHTML = '';
  BOARD_PANEL_DEFS.forEach(def => {
    const cfg = boardPanelConfig[def.key];

    const item = document.createElement('div');

    const row = document.createElement('div');
    row.className = 'menu-item';
    const icon = document.createElement('span'); icon.className = 'menu-icon'; icon.textContent = def.icon;
    const name = document.createElement('span'); name.className = 'menu-name'; name.textContent = def.label;
    const chk = document.createElement('input'); chk.type = 'checkbox'; chk.className = 'chk';
    chk.checked = !cfg.hidden;
    chk.addEventListener('change', () => { cfg.hidden = !chk.checked; });
    row.append(icon, name, chk);
    item.appendChild(row);

    const imgRow = document.createElement('div');
    imgRow.className = 'bp-img-row';

    const upBtn = document.createElement('button');
    upBtn.className = 'upload-btn';
    upBtn.textContent = cfg.imageData ? '🖼 이미지 변경' : '📁 캐릭터/이미지';
    upBtn.addEventListener('click', () => {
      panelFileKey = def.key;
      document.getElementById('panelFileInput').click();
    });
    imgRow.appendChild(upBtn);

    if (cfg.imageData) {
      const modeSel = document.createElement('select');
      [['overlay', '투명 오버레이'], ['cover', '전체 교체']].forEach(([v, l]) => {
        const o = document.createElement('option'); o.value = v; o.textContent = l;
        if (cfg.mode === v) o.selected = true;
        modeSel.appendChild(o);
      });
      modeSel.addEventListener('change', () => { cfg.mode = modeSel.value; });
      imgRow.appendChild(modeSel);

      const rmBtn = document.createElement('button');
      rmBtn.className = 'bg-remove'; rmBtn.textContent = '✕'; rmBtn.title = '이미지 제거';
      rmBtn.addEventListener('click', () => { cfg.imageData = null; renderBoardPanels(); });
      imgRow.appendChild(rmBtn);
    }
    item.appendChild(imgRow);

    if (cfg.imageData) {
      const prev = document.createElement('img');
      prev.className = 'bp-preview';
      prev.src = cfg.imageData;
      item.appendChild(prev);
    }

    area.appendChild(item);
  });
}

// ── 테마 빌드 ──
function buildTheme() {
  const colors = { enabled: {} };
  COLOR_KEYS.forEach(k => {
    const cp = document.getElementById('cp_'+k);
    if (cp) colors[k] = cp.value;
  });
  // enabled 상태
  ['headerBg','gnbBg','gnbText','widgetHeaderBg','widgetHeaderText','menuHd','menuText','accent','btnDefault','btnReset','boardBg'].forEach(k => {
    colors.enabled[k] = isEnabled(k);
  });

  const menuConfig = {};
  MENU_KEYS.forEach(k => {
    const el = document.getElementById('mc_'+k);
    if (el) menuConfig[k] = el.checked;
  });

  const layoutConfig = {};
  Object.keys(LAYOUT_DEFAULTS).forEach(k => {
    const el = document.getElementById('lc_' + k);
    if (el) layoutConfig[k] = el.checked;
  });

  return {
    colors,
    backgrounds: bgCards.filter(c => c.imageData),
    menuConfig,
    layoutConfig,
    boardPanels: boardPanelConfig,
    customCSS: document.getElementById('customCSS').value
  };
}

// ── CSS 생성 (popup에서도 사용) ──
function generateCSS(theme) {
  if (!theme) return '';
  let css = '/* 포털 테마 커스터마이저 */\n';
  const c = theme.colors || {};
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
    const sel = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} h4`).join(',');
    css += `${sel} { background-color: ${c.menuHdBg} !important; background-image: none !important; }\n`;
  }
  if (en.menuHd && c.menuHdText) {
    const sel = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} h4`).join(',');
    css += `${sel} { color: ${c.menuHdText} !important; }\n`;
  }
  if (en.menuText && c.menuText)
    css += `.menu_infoArea div.menuText, .menu_infoArea div.menuRight { color: ${c.menuText} !important; }\n`;
  if (en.accent && c.accent) {
    css += `.btnSmallA, .btnAll, .btnSmallA_01 { background-color: ${c.accent} !important; }\n`;
    const spans = [1,2,3,4,5].map(i=>`.menu_infoArea div.menu0${i} ul li div.menuRight span.on`).join(',');
    css += `${spans} { color: ${c.accent} !important; }\n`;
  }
  if (en.btnDefault && c.btnDefault)
    css += `.btnSmall { background-color: ${c.btnDefault} !important; }\n`;
  if (en.btnReset && c.btnReset)
    css += `.btnreset { background-color: ${c.btnReset} !important; }\n`;
  if (en.boardBg && c.boardBg)
    css += `.boardArea, .rightContents { background-color: ${c.boardBg} !important; }\n`;

  (theme.backgrounds || []).forEach(bg => {
    if (!bg.selector || !bg.imageData || bg.selector === '__custom__') return;
    const sel = bg.customSel || bg.selector;
    const ov = (bg.overlay||0).toFixed(2);
    css += `${sel} { background: linear-gradient(rgba(0,0,0,${ov}),rgba(0,0,0,${ov})), url("${bg.imageData}") ${bg.position||'center'}/${bg.size||'cover'} ${bg.repeat||'no-repeat'} !important; }\n`;
  });

  const mc = theme.menuConfig || {};
  ['menu01','menu02','menu03','menu04','menu05'].forEach(m => {
    if (mc[m] === false) css += `.menu_infoArea div.${m} { display: none !important; }\n`;
  });
  if (mc.lnb === false)      css += `header nav #lnb { display: none !important; }\n`;
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

  if (theme.customCSS?.trim()) css += '\n/* 커스텀 CSS */\n' + theme.customCSS + '\n';
  return css;
}

// ── 페이지에 직접 CSS 주입 (content script 없어도 동작) ──
async function injectDirect(tab, theme) {
  const css = generateCSS(theme);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (cssText) => {
      document.getElementById('__ptheme_style__')?.remove();
      if (!cssText) return;
      const s = document.createElement('style');
      s.id = '__ptheme_style__';
      s.textContent = cssText;
      document.head.appendChild(s);
    },
    args: [css]
  });
}

async function removeDirect(tab) {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.getElementById('__ptheme_style__')?.remove()
  });
}

// ── 탭 가져오기 ──
async function getPortalTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('탭 없음');
  if (!tab.url?.includes('dauri.moel.go.kr')) throw new Error('포털 페이지에서만 사용 가능');
  return tab;
}

// ── 적용 ──
document.getElementById('btnApply').addEventListener('click', async () => {
  try {
    const theme = buildTheme();
    const tab = await getPortalTab();
    await injectDirect(tab, theme);
    updateStatusBadge(true);
    showMsg('✅ 적용됨');
  } catch(e) {
    showMsg('⚠️ ' + e.message, true);
  }
});

// ── 저장 ──
document.getElementById('btnSave').addEventListener('click', async () => {
  const theme = buildTheme();
  await chrome.storage.local.set({ portalTheme: theme });
  try {
    const tab = await getPortalTab();
    await injectDirect(tab, theme);
    updateStatusBadge(true);
    showMsg('💾 저장 완료 — 재방문 시 자동 적용');
  } catch(e) {
    showMsg('💾 저장됨 (포털에서 새로고침하면 적용)');
  }
});

// ── 초기화 ──
document.getElementById('btnReset').addEventListener('click', async () => {
  if (!confirm('테마를 초기화할까요?')) return;
  await chrome.storage.local.remove('portalTheme');
  try {
    const tab = await getPortalTab();
    await removeDirect(tab);
  } catch(e) {}
  showMsg('🗑 초기화됨');
  updateStatusBadge(false);
  setTimeout(() => location.reload(), 800);
});

// ── UI 헬퍼 ──
function updateStatusBadge(on) {
  const b = document.getElementById('statusBadge');
  b.textContent = on ? '적용중' : '미적용';
  b.classList.toggle('on', on);
}

function showMsg(msg, isErr=false) {
  const el = document.getElementById('botMsg');
  el.textContent = msg;
  el.style.color = isErr ? '#f87171' : '#34d399';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ── 초기 로드: 저장된 테마 복원 ──
chrome.storage.local.get('portalTheme', data => {
  const theme = data.portalTheme;
  if (!theme) { renderBgList(); renderBoardPanels(); return; }

  updateStatusBadge(true);

  // 색상 복원
  const c = theme.colors || {};
  COLOR_KEYS.forEach(k => {
    if (!c[k]) return;
    const cp = document.getElementById('cp_'+k);
    const hx = document.getElementById('hx_'+k);
    if (cp) cp.value = c[k];
    if (hx) hx.value = c[k];
  });
  // 토글 복원
  const en = c.enabled || {};
  Object.keys(en).forEach(k => setToggle(k, en[k]));

  // 배경 복원
  if (theme.backgrounds?.length) {
    bgCards = theme.backgrounds;
  }
  renderBgList();

  // 게시판 패널 복원
  if (theme.boardPanels) {
    BOARD_PANEL_DEFS.forEach(d => {
      if (theme.boardPanels[d.key]) Object.assign(boardPanelConfig[d.key], theme.boardPanels[d.key]);
    });
  }
  renderBoardPanels();

  // 메뉴 복원
  const mc = theme.menuConfig || {};
  MENU_KEYS.forEach(k => {
    const el = document.getElementById('mc_'+k);
    if (el) el.checked = mc[k] !== false;
  });

  // 레이아웃 복원
  const lc = theme.layoutConfig || {};
  Object.keys(LAYOUT_DEFAULTS).forEach(k => {
    const el = document.getElementById('lc_' + k);
    if (!el) return;
    el.checked = lc[k] !== undefined ? lc[k] : LAYOUT_DEFAULTS[k];
  });

  // 커스텀 CSS 복원
  if (theme.customCSS) {
    document.getElementById('customCSS').value = theme.customCSS;
  }
});
