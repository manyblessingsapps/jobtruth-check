
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
  const whyItems = checked.map(el => {
  const label = el.closest('label');
  const reasonTitle =
    label?.querySelector('strong')?.innerText.trim() ||
    'Selected warning sign';

  const t = reasonTitle.toLowerCase();
  let explanation =
    'This warning sign deserves independent verification before you proceed.';

  if (t.includes('check') || t.includes('equipment')) {
    explanation =
      'Fake-check scams often involve sending money for equipment or expenses and asking the applicant to spend or forward part of it.';
  } else if (t.includes('crypto') || t.includes('pay money')) {
    explanation =
      'Legitimate employers generally do not require applicants to pay money or cryptocurrency to start work or unlock earnings.';
  } else if (t.includes('ssn') || t.includes('bank') || t.includes('id')) {
    explanation =
      'Sensitive identity or banking information should normally be requested only after the employer and hiring process have been verified.';
  } else if (t.includes('personal email')) {
    explanation =
      'A personal email address can be impersonated easily. Verify the recruiter independently through the company’s official website.';
  } else if (t.includes('quickly') || t.includes('little or no interview')) {
    explanation =
      'An unusually fast offer can be used to pressure applicants before they have time to verify the employer.';
  } else if (t.includes('pay seems unusually high')) {
    explanation =
      'Very high pay for simple remote work can be used as bait and deserves extra verification.';
  } else if (t.includes('official career')) {
    explanation =
      'If the opening cannot be confirmed on the company’s official careers page, an impostor may be copying a real employer’s name.';
  } else if (t.includes('inconsistent')) {
    explanation =
      'Mismatched company names, domains, or job details can be a sign that someone is impersonating a legitimate employer.';
  }

  return `<li><strong>${escapeHtml(reasonTitle)}</strong><br>${explanation}</li>`;
}).join('');
  r.className = 'result ' + cls;
  r.innerHTML = `
  <h2>${title}</h2>
  <p><strong>Risk score: ${score}/100</strong></p>
  <p>${message}</p>

  ${whyItems ? `
    <div class="why-risky">
      <h3>Why This Result?</h3>
      <ul>${whyItems}</ul>
    </div>
  ` : ''}

  <p><small>This score is educational, not a fraud determination.</small></p>
`;
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
window.removeApp = i => {
  if (!window.confirm('Are you sure you want to delete this application?')) return;
  const apps = getApps();
  apps.splice(i, 1);
  saveApps(apps);
};
window.editApp = i => {
  const apps = getApps();
  const a = apps[i];

  document.getElementById('company').value = a.company;
  document.getElementById('role').value = a.role;
  document.getElementById('dateApplied').value = a.date || '';
  document.getElementById('status').value = a.status || 'Applied';

  apps.splice(i, 1);
  saveApps(apps);

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
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

    const skillTerms = [
  'payroll processing',
  'payroll taxes',
  'tax reporting',
  'financial reporting',
  'employee benefits',
  'benefits administration',
  'accounts payable',
  'accounts receivable',
  'data entry',
  'customer service',
  'project management',
  'calendar management',
  'human resources',
  'attention to detail',
  'microsoft excel',
  'microsoft word',
  'google workspace',
  'payroll',
  'hris',
  'excel',
  'compliance',
  'reconciliation',
  'accounting',
  'bookkeeping',
  'auditing',
  'audit',
  'recruiting',
  'onboarding',
  'scheduling',
  'reporting',
  'invoicing',
  'billing',
  'finance',
  'administration',
  'administrative',
  'communication',
  'organization',
  'analytical',
  'analysis',
  'database',
  'records',
  'training',
  'quickbooks',
  'adp',
  'workday',
  'paychex',
  'salesforce',
  'sap',
  'oracle',
  'outlook',
  'powerpoint',
  'crm'
];

const keywords = skillTerms
  .filter(term => jobText.includes(term))
  .filter((term, index, arr) =>
    !arr.some((other, otherIndex) =>
      otherIndex !== index &&
      other.length > term.length &&
      other.includes(term) &&
      jobText.includes(other)
    )
  )
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
