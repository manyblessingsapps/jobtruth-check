
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
      <button type="button" class="edit-btn" onclick="editApp(${i})">Edit</button>
      <button class="delete" onclick="removeApp(${i})" aria-label="Delete">×</button></div>
      <div class="row" style="margin-top:10px"><small>${a.date || 'No date'}</small><strong>${escapeHtml(a.status)}</strong></div>
    </div>`).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
window.removeApp = i => { const a=getApps(); a.splice(i,1); saveApps(a); };
window.editApp = i => {
  const apps = getApps();
  const a = apps[i];
  document.getElementById('company').value = a.company;
document.getElementById('role').value = a.role;
document.getElementById('dateApplied').value = a.date || '';
document.getElementById('status').value = a.status || 'Applied';
  apps.splice(i,1);
  saveApps(apps);
  renderApps();
  form.scrollIntoView({behavior:'smooth',block:'start'});
};
form.addEventListener('submit', e=>{
  e.preventDefault();
  const apps=getApps();
  apps.unshift({company:company.value,role:role.value,date:dateApplied.value,status:document.getElementById('status').value});
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
// Resume Keyword Helper
const compareResumeBtn = document.getElementById('compareResume');

if (compareResumeBtn) {
  compareResumeBtn.addEventListener('click', () => {
    const jobText = document.getElementById('jobDescription').value.toLowerCase();
    const resumeText = document.getElementById('resumeText').value.toLowerCase();
    const results = document.getElementById('resumeResults');

    if (!jobText.trim() || !resumeText.trim()) {
      results.innerHTML = `
        <div class="result medium">
          <strong>Please paste both the job description and your resume.</strong>
        </div>`;
      return;
    }

    
const stopWords = new Set([
  'the','and','for','with','that','this','from','you','your','our','are',
  'will','have','has','had','but','not','all','can','may','who','what',
  'when','where','how','into','than','then','their','they','them','its',
  'job','role','work','working','position','company','team','years',
  'year','experience','required','preferred','including','such','other',
  'seeking','ideal','candidate','candidates','ensure','responsible',
  'responsibilities','duties','ability','strong','excellent','looking'
]);

const words = jobText.match(/[a-z][a-z0-9+#-]{2,}/g) || [];
const counts = {};

words.forEach(word => {
  if (!stopWords.has(word)) {
    counts[word] = (counts[word] || 0) + 1;
  }
});

const skillWords = new Set([
  'payroll','excel','hris','compliance','reconciliation','taxes',
  'accounting','bookkeeping','benefits','administration','administrative',
  'reporting','data','entry','microsoft','office','word','outlook',
  'quickbooks','adp','workday','paychex','sap','oracle','systems',
  'analysis','analytical','communication','customer','service',
  'accounts','payable','receivable','invoicing','billing','audit',
  'auditing','financial','finance','human','resources','recruiting',
  'onboarding','training','scheduling','database','records'
]);

const keywords = Object.keys(counts)
  .sort((a, b) => {
    const aSkill = skillWords.has(a) ? 1 : 0;
    const bSkill = skillWords.has(b) ? 1 : 0;
    return (bSkill - aSkill) || (counts[b] - counts[a]);
  })
  .slice(0, 20);
    const keywords = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 20);

    const found = keywords.filter(word => resumeText.includes(word));
    const missing = keywords.filter(word => !resumeText.includes(word));

    const score = keywords.length
      ? Math.round((found.length / keywords.length) * 100)
      : 0;

    results.innerHTML = `
      <div class="result ${score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high'}">
        <h2>Resume Match: ${score}%</h2>

        <p><strong>Keywords found:</strong><br>
        ${found.length ? found.map(escapeHtml).join(', ') : 'None identified yet.'}</p>

        <p><strong>Keywords to review:</strong><br>
        ${missing.length ? missing.map(escapeHtml).join(', ') : 'Great — your resume includes the main keywords found.'}</p>

        <p><small>
          Only add keywords that truthfully describe your skills or experience.
          This is a keyword comparison, not a guarantee of ATS ranking or employment.
        </small></p>
      </div>`;

    results.scrollIntoView({behavior:'smooth', block:'start'});
  });
}
