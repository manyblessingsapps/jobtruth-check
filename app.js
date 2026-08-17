
const screens = [...document.querySelectorAll('.screen')];
const navBtns = [...document.querySelectorAll('[data-go]')];

function go(id){
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('.bottomnav button').forEach(b => b.classList.toggle('nav-active', b.dataset.go === id));
  window.scrollTo({top:0,behavior:'smooth'});
}
navBtns.forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

document.getElementById('scoreBtn').addEventListener('click', () => {
  const checked = [...document.querySelectorAll('#scamForm input:checked')];
  let score = checked.reduce((n, el) => n + Number(el.dataset.points || 0), 0);
  score = Math.min(100, score);
  const r = document.getElementById('result');
  let cls, title, message;
  if(score >= 50){
    cls='high'; title='High Risk — Stop and Verify';
    message='Several strong warning signs are present. Do not send money, deposit a check for the recruiter, or provide more sensitive information until you independently verify the employer.';
  } else if(score >= 20){
    cls='medium'; title='Caution — Verify Before Proceeding';
    message='There are warning signs worth checking. Verify the job through the employer’s official website and contact information you find yourself.';
  } else {
    cls='low'; title='Lower Risk — Still Verify';
    message='You selected few common warning signs. That does not prove the job is legitimate. Confirm the employer, recruiter, and job opening before sharing sensitive information.';
  }
  r.className = 'result ' + cls;
  r.innerHTML = `<h2>${title}</h2><p><strong>Risk score: ${score}/100</strong></p><p>${message}</p><p><small>This score is educational, not a fraud determination.</small></p>`;
  r.scrollIntoView({behavior:'smooth',block:'center'});
});

const form = document.getElementById('appForm');
const list = document.getElementById('appsList');
function getApps(){ return JSON.parse(localStorage.getItem('jt_apps') || '[]'); }
function saveApps(a){ localStorage.setItem('jt_apps', JSON.stringify(a)); renderApps(); }
function renderApps(){
  const apps = getApps();
  if(!apps.length){ list.innerHTML = '<div class="notice">No applications saved yet.</div>'; return; }
  list.innerHTML = apps.map((a,i)=>`
    <div class="app-item">
      <div class="row"><div><strong>${escapeHtml(a.role)}</strong><br><small>${escapeHtml(a.company)}</small></div>
      <button class="delete" onclick="removeApp(${i})" aria-label="Delete">×</button></div>
      <div class="row" style="margin-top:10px"><small>${a.date || 'No date'}</small><strong>${escapeHtml(a.status)}</strong></div>
    </div>`).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
window.removeApp = i => { const a=getApps(); a.splice(i,1); saveApps(a); };
form.addEventListener('submit', e=>{
  e.preventDefault();
  const apps=getApps();
  apps.unshift({company:company.value,role:role.value,date:dateApplied.value,status:status.value});
  saveApps(apps); form.reset();
});
renderApps();

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); deferredPrompt=e; installBtn.classList.remove('hidden');
});
installBtn.addEventListener('click', async()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt=null; installBtn.classList.add('hidden');
});

if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js'); }
