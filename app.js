const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
let currentLang = localStorage.getItem('lang') || 'ar';

// ===== i18n =====
async function setLang(lang){
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const locale = await fetch(`/locales/${lang}.json`).then(r=>r.json()).catch(()=>null);
  if(!locale) return;

  // Texts
  $('#brand').textContent   = locale.brand;
  $('#brand_2').textContent = locale.brand;
  $('#welcome').textContent = locale.welcome;
  $('#search').placeholder  = locale.search_placeholder;

  $('#nav_hadith').textContent = locale.nav_hadith;
  $('#nav_azkar').textContent  = locale.nav_azkar;
  $('#nav_dua').textContent    = locale.nav_dua;
  $('#hadith_title').textContent = locale.hadith_title;
  $('#azkar_title').textContent  = locale.azkar_title;
  $('#dua_title').textContent    = locale.dua_title;
  $('#bot_title').textContent    = locale.bot_title;

  $('#question').placeholder = locale.type_your_question;
  $('#send').textContent     = locale.send;

  // Direction
  const rtl = ['ar','ur'];
  document.documentElement.dir  = rtl.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

// ===== Renderers =====
async function renderHadith(q=''){
  const res = await fetch(`/api/search?type=hadith&q=${encodeURIComponent(q)}`);
  const data = await res.json();
  const box = $('#hadithList');
  box.innerHTML = (data.items||[]).map(it => `
    <div class="item">
      <div class="title"><strong>${it.title||''}</strong></div>
      <div>${it.text||''}</div>
      <div class="meta">${it.source||''} • ${it.grade||''}</div>
    </div>
  `).join('') || `<div class="muted">لا توجد نتائج.</div>`;
}

async function renderAzkar(tag=''){
  const res = await fetch(`/api/azkar${tag?`?tag=${encodeURIComponent(tag)}`:''}`);
  const data = await res.json();
  $('#azkarList').innerHTML = (data.items||[]).map(z => `
    <div class="item">
      <div class="title"><strong>${z.title||''}</strong></div>
      <div>${z.text||''}</div>
    </div>
  `).join('');
}

async function renderDua(cat=''){
  const res = await fetch(`/api/dua${cat?`?cat=${encodeURIComponent(cat)}`:''}`);
  const data = await res.json();
  $('#duaList').innerHTML = (data.items||[]).map(d => `
    <div class="item">
      <div class="title"><strong>${d.title||''}</strong></div>
      <div>${d.text||''}</div>
    </div>
  `).join('');
}

// ===== Chatbot =====
async function sendChat(){
  const q = $('#question').value.trim();
  if(!q) return;
  const box = $('#chatBox');

  box.insertAdjacentHTML('beforeend', `<div class="msg msg--user">${q}</div>`);
  $('#question').value = '';

  try{
    const resp = await fetch('/api/chat', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ question:q, lang: currentLang })
    });
    const data = await resp.json();
    const a = data.answer || data.error || 'حدث خطأ غير متوقع.';
    box.insertAdjacentHTML('beforeend', `<div class="msg msg--bot">${a}</div>`);
    box.scrollTop = box.scrollHeight;
  }catch(e){
    box.insertAdjacentHTML('beforeend', `<div class="msg msg--bot">تعذر الاتصال بالخادم.</div>`);
  }
}

// ===== Theme =====
function toggleTheme(){
  const root = document.documentElement;
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
}
function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved === 'dark') document.documentElement.classList.add('dark');
}

// ===== Chips =====
function initChips(){
  $$('#azkar .chip').forEach(ch=>{
    ch.addEventListener('click', ()=> renderAzkar(ch.dataset.tag));
  });
}

// ===== Boot =====
document.addEventListener('DOMContentLoaded', async ()=>{
  initTheme();

  // Lang select
  const sel = $('#lang');
  sel.value = currentLang;
  sel.addEventListener('change', e=> setLang(e.target.value));
  await setLang(currentLang);

  // Events
  $('#theme').addEventListener('click', toggleTheme);
  $('#btnSearch').addEventListener('click', ()=> renderHadith($('#search').value.trim()));
  $('#send').addEventListener('click', sendChat);
  $('#question').addEventListener('keydown', e=>{ if(e.key==='Enter') sendChat(); });

  // Initial content
  renderHadith();
  renderAzkar();
  renderDua();
  initChips();
});
