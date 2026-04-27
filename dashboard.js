// Auth guard
const user = JSON.parse(localStorage.getItem('fv_current_user') || 'null');
if (!user) { window.location.href = '../pages/login.html'; }

const emailEl = document.getElementById('sidebarEmail');
if (emailEl) emailEl.textContent = user.email;

document.getElementById('signOutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('fv_current_user');
  window.location.href = '../index.html';
});

// Storage
function getKey(k) { return k + '_' + user.email; }
function getTxns() { return JSON.parse(localStorage.getItem(getKey('fv_txns')) || '[]'); }
function saveTxns(t) { localStorage.setItem(getKey('fv_txns'), JSON.stringify(t)); }
function getBudget() { return parseInt(localStorage.getItem(getKey('fv_budget')) || user.budget || 50000); }

// Category colors
const CAT_COLORS = {
  'Travel':'#7c3aed','Health & Fitness':'#06b6d4','Entertainment':'#10b981',
  'Bills & Utilities':'#f59e0b','Other':'#ef4444','Food & Dining':'#f97316',
  'Shopping':'#ec4899','Education':'#3b82f6','Income':'#22c55e'
};
function catColor(c) { return CAT_COLORS[c] || '#9ca3af'; }
function fmt(n) { return '₹' + parseFloat(n).toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function today() { return new Date().toISOString().split('T')[0]; }
function thisMonth() { const d=new Date(); return d.getFullYear()+'-'+(String(d.getMonth()+1).padStart(2,'0')); }
function weekAgo() { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0]; }

// ── ANIMATED COUNTER ──
function animateValue(el, target, prefix='', suffix='', duration=900) {
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = ease * target;
    const formatted = prefix + val.toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}) + suffix;
    el.textContent = formatted;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target.toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}) + suffix;
  };
  requestAnimationFrame(tick);
}

// ── STATS ──
function renderStats() {
  const txns = getTxns();
  const budget = getBudget();
  const month = thisMonth();
  const wago = weekAgo();
  const monthly   = txns.filter(t=>t.type!=='income'&&t.date&&t.date.startsWith(month)).reduce((s,t)=>s+t.amount,0);
  const weekly    = txns.filter(t=>t.type!=='income'&&t.date&&t.date>=wago).reduce((s,t)=>s+t.amount,0);
  const remaining = Math.max(0, budget - monthly);

  const me = document.getElementById('monthlyExpense');
  const we = document.getElementById('weeklyExpense');
  const rb = document.getElementById('remainingBudget');
  if (me) animateValue(me, monthly, '₹', '');
  if (we) animateValue(we, weekly, '₹', '');
  if (rb) { animateValue(rb, remaining, '₹', ''); rb.style.color = (budget-monthly) < 0 ? '#dc2626' : '#111827'; }
}

// ── TRANSACTIONS TABLE ──
function renderTable() {
  const tbody = document.getElementById('txnTableBody');
  if (!tbody) return;
  const txns = getTxns().slice().sort((a,b)=>b.date.localeCompare(a.date));
  tbody.innerHTML = '';
  if (!txns.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#9ca3af;font-size:14px">✨ No transactions yet. Add your first expense!</td></tr>';
    return;
  }
  txns.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${i * 0.045}s`;
    const dateStr = new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    const color = catColor(t.category);
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td><span class="cat-pill" style="background:${color}18;color:${color}">${t.category}</span></td>
      <td style="color:#374151">${t.note}</td>
      <td class="txn-amount" style="color:${t.type==='income'?'#16a34a':'#111827'}">${t.type==='income'?'+':''}${fmt(t.amount)}</td>
      <td><button class="del-btn" data-id="${t.id}" title="Delete">🗑</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      row.style.transition = 'opacity .3s, transform .3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        saveTxns(getTxns().filter(t => String(t.id) !== String(btn.dataset.id)));
        renderAll();
      }, 280);
    });
  });
}

// ── TREND CHART ──
let trendChartInst = null;
function renderTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  const txns = getTxns();
  const labels = [], data = [];
  for (let i=13;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
    const sum = txns.filter(t=>t.type!=='income'&&t.date===iso).reduce((s,t)=>s+t.amount,0);
    labels.push(label); data.push(sum);
  }
  if (trendChartInst) trendChartInst.destroy();
  trendChartInst = new Chart(canvas, {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Expenses', data,
        borderColor:'#7c3aed',
        backgroundColor:(ctx)=>{
          const g = ctx.chart.ctx.createLinearGradient(0,0,0,ctx.chart.height);
          g.addColorStop(0,'rgba(124,58,237,.18)');
          g.addColorStop(1,'rgba(124,58,237,.01)');
          return g;
        },
        fill:true, tension:0.45,
        pointRadius:4, pointBackgroundColor:'#7c3aed',
        pointBorderColor:'#fff', pointBorderWidth:2,
        pointHoverRadius:6, borderWidth:2.5
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      animation:{duration:1200,easing:'easeInOutQuart'},
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#1e1b4b', titleColor:'#c4b5fd', bodyColor:'#e9d5ff',
          padding:12, cornerRadius:10, borderColor:'rgba(196,181,253,.2)', borderWidth:1,
          callbacks:{label:c=>'  ₹'+c.raw.toLocaleString('en-IN')}
        }
      },
      scales:{
        x:{grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{size:11},color:'#9ca3af',maxRotation:0}},
        y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{size:11},color:'#9ca3af',callback:v=>'₹'+v.toLocaleString('en-IN')},beginAtZero:true}
      },
      interaction:{mode:'index',intersect:false}
    }
  });
}

// ── DONUT CHART ──
let donutChartInst = null;
function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const txns = getTxns().filter(t=>t.type!=='income'&&t.date&&t.date.startsWith(thisMonth()));
  const catMap = {};
  txns.forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const cats = Object.keys(catMap);
  const vals = cats.map(c=>catMap[c]);
  const colors = cats.map(c=>catColor(c));

  if (donutChartInst) donutChartInst.destroy();
  if (!cats.length) {
    const legend = document.getElementById('donutLegend');
    if (legend) legend.innerHTML = '<span style="font-size:13px;color:#9ca3af">No data this month</span>';
    return;
  }
  donutChartInst = new Chart(canvas, {
    type:'doughnut',
    data:{labels:cats, datasets:[{data:vals, backgroundColor:colors, borderWidth:3, borderColor:'#fff', hoverOffset:10}]},
    options:{
      responsive:true, cutout:'72%',
      animation:{duration:1000,easing:'easeInOutQuart',animateRotate:true,animateScale:true},
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#1e1b4b', titleColor:'#c4b5fd', bodyColor:'#e9d5ff',
          padding:12, cornerRadius:10,
          callbacks:{label:c=>{const total=vals.reduce((a,b)=>a+b,0); return '  '+c.label+': ₹'+c.raw.toLocaleString('en-IN')+' ('+Math.round(c.raw/total*100)+'%)';}}
        }
      }
    }
  });
  const legend = document.getElementById('donutLegend');
  if (legend) {
    const total = vals.reduce((a,b)=>a+b,0);
    legend.innerHTML = cats.map((c,i)=>
      `<div class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span>${c} <span style="color:#9ca3af;margin-left:3px">${Math.round(vals[i]/total*100)}%</span></div>`
    ).join('');
  }
}

function renderAll() {
  renderStats();
  renderTable();
  renderTrendChart();
  renderDonutChart();
}
renderAll();

// ── ADD EXPENSE MODAL ──
const modalBg   = document.getElementById('modalBg');
const modalClose = document.getElementById('modalClose');
const addNav    = document.getElementById('addExpenseNav');

function openModal() {
  document.getElementById('expDate').value = today();
  document.getElementById('expError').style.display='none';
  modalBg.classList.add('open');
}
if (addNav) addNav.addEventListener('click', e=>{ e.preventDefault(); openModal(); });
if (modalClose) modalClose.addEventListener('click', ()=>modalBg.classList.remove('open'));
if (modalBg) modalBg.addEventListener('click', e=>{ if(e.target===modalBg) modalBg.classList.remove('open'); });

document.addEventListener('keydown', e=>{ if(e.key==='Escape') modalBg && modalBg.classList.remove('open'); });

document.getElementById('saveExpense').addEventListener('click', () => {
  const amount   = parseFloat(document.getElementById('expAmount').value);
  const note     = document.getElementById('expNote').value.trim();
  const cat      = document.getElementById('expCategory').value;
  const date     = document.getElementById('expDate').value;
  const err      = document.getElementById('expError');
  if (!amount||amount<=0){err.textContent='Please enter a valid amount.';err.style.display='block';return;}
  if (!note){err.textContent='Please enter a note.';err.style.display='block';return;}
  err.style.display='none';
  const txns = getTxns();
  txns.push({id:Date.now(),type:'expense',note,category:cat,amount,date});
  saveTxns(txns);
  modalBg.classList.remove('open');
  document.getElementById('expAmount').value='';
  document.getElementById('expNote').value='';

  // Brief flash on stat cards
  document.querySelectorAll('.stat-card').forEach(c=>{
    c.style.transition='border-color .4s';
    c.style.borderColor='#c4b5fd';
    setTimeout(()=>c.style.borderColor='',600);
  });
  renderAll();
});
