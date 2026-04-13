// Auth guard & shared utilities
const _user = JSON.parse(localStorage.getItem('fv_current_user') || 'null');
if (!_user && !window.location.href.includes('login') && !window.location.href.includes('signup') && !window.location.href.includes('index')) {
  window.location.href = '../pages/login.html';
}

function getUser() { return JSON.parse(localStorage.getItem('fv_current_user') || 'null'); }
function getKey(k) { const u = getUser(); return u ? k + '_' + u.email : k; }
function getTxns() { return JSON.parse(localStorage.getItem(getKey('fv_txns')) || '[]'); }
function saveTxns(t) { localStorage.setItem(getKey('fv_txns'), JSON.stringify(t)); }
function getBudget() { const u=getUser(); return parseInt(localStorage.getItem(getKey('fv_budget')) || (u&&u.budget) || 50000); }
function saveBudget(v) { localStorage.setItem(getKey('fv_budget'), v); }

// Set sidebar email
const emailEl = document.getElementById('sidebarEmail');
if (emailEl && _user) emailEl.textContent = _user.email;

// Sign out
const soBtn = document.getElementById('signOutBtn');
if (soBtn) soBtn.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('fv_current_user');
  window.location.href = '../index.html';
});

// Add Expense modal trigger (used on sub-pages)
const addNavBtn = document.getElementById('addExpenseNav');
const modalBg   = document.getElementById('modalBg');
const modalClose = document.getElementById('modalClose');

if (addNavBtn && modalBg) {
  addNavBtn.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    modalBg.classList.add('open');
  });
}
if (modalClose && modalBg) {
  modalClose.addEventListener('click', () => modalBg.classList.remove('open'));
  modalBg.addEventListener('click', e => { if(e.target===modalBg) modalBg.classList.remove('open'); });
}
const saveExpBtn = document.getElementById('saveExpense');
if (saveExpBtn) {
  saveExpBtn.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('expAmount').value);
    const note   = document.getElementById('expNote').value.trim();
    const cat    = document.getElementById('expCategory').value;
    const date   = document.getElementById('expDate').value;
    const err    = document.getElementById('expError');
    if (!amount||amount<=0){err.textContent='Enter a valid amount.';err.style.display='block';return;}
    if (!note){err.textContent='Enter a note.';err.style.display='block';return;}
    err.style.display='none';
    const txns = getTxns();
    txns.push({id:Date.now(),type:'expense',note,category:cat,amount,date});
    saveTxns(txns);
    modalBg.classList.remove('open');
    document.getElementById('expAmount').value='';
    document.getElementById('expNote').value='';
    if (typeof renderAll === 'function') renderAll();
  });
}
