import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, List, Settings, Download, AlertTriangle, TrendingUp, IndianRupee, Store, Tag, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';

import { CATEGORIES, CATEGORY_COLORS, categorizeExpense, DEFAULT_BUDGETS } from './constants';
import { getTransactionsForMonth, getBudgets, saveBudgets, getTotalSpent, getTotalBudget, getSpendingPercentage, formatCurrency, getCurrentYearMonth, saveTransaction, getTransactions, deleteTransaction } from './storage';

// --- SUB-COMPONENTS ---

const DashboardView = ({ totalSpent, totalBudget, overallPct, isOver, alerts, barData, spentByCategory, budgets, setView }) => (
  <div className="fade-in">
    <div className="page-header">
      <h2>Financial Overview</h2>
      <p className="subtitle">Track and analyze your monthly spending.</p>
    </div>

    {alerts.length > 0 && (
      <div className="alerts-container">
        {alerts.map((a, i) => (
           <div key={i} className="alert-banner">
             <AlertTriangle size={18} /> {a}
           </div>
        ))}
      </div>
    )}

    <div className="dashboard-grid">
      {/* Hero Card */}
      <div className="glass-card hero-card full-width-card">
        <div className="spend-label">Total Outflow This Month</div>
        <div className="spend-amount" style={{ color: isOver ? '#ff4d4f' : 'white' }}>
          {formatCurrency(totalSpent)}
        </div>
        <div className="spend-sub">out of {formatCurrency(totalBudget)} established budget</div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(overallPct, 100)}%`, backgroundColor: isOver ? '#ff4d4f' : '#FFD700' }} 
          />
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: isOver ? '#ff4d4f' : '#8b949e', fontWeight: 600 }}>
          {Math.round(overallPct)}% consumed
        </div>
      </div>

      {/* Bar Chart */}
      {barData.length > 0 && (
        <div className="glass-card full-width-card" style={{ paddingBottom: '10px' }}>
          <h3 className="card-title">Budget Allocation vs. Actual Spent</h3>
          <div style={{ width: '100%', height: 350, marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#8b949e', fontSize: 13}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#8b949e', fontSize: 13}} axisLine={false} tickLine={false} 
                       tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#2a303c', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#FFD700', fontWeight: 600 }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="Budget" fill="#30363d" radius={[6,6,0,0]} barSize={35} />
                <Bar dataKey="Spent" radius={[6,6,0,0]} barSize={35}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Categories Breakdown */}
      <div className="glass-card full-width-card">
        <h3 className="card-title">Spending Breakdown</h3>
        <div className="cat-list">
          {CATEGORIES.filter(c => spentByCategory[c] || budgets[c]).map(cat => {
            const spent = spentByCategory[cat] || 0;
            const bgt = Number(budgets[cat]) || 0;
            const pct = bgt > 0 ? (spent / bgt) * 100 : 0;
            const color = CATEGORY_COLORS[cat] || '#FFF';
            return (
              <div className="cat-item" key={cat}>
                <div className="cat-icon" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}88` }} />
                <div className="cat-info">
                  <div className="cat-name">{cat}</div>
                  <div className="cat-mini-bar">
                    <div className="cat-mini-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 100 ? '#ff4d4f' : color }} />
                  </div>
                </div>
                <div className="cat-stats">
                  <span className="cat-spent">{formatCurrency(spent)}</span>
                  <span className="cat-limit">/ {formatCurrency(bgt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const AddExpenseView = ({ year, month, onSave }) => {
  const [amt, setAmt] = useState('');
  const [merch, setMerch] = useState('');
  const [cat, setCat] = useState('Miscellaneous');

  const handleAutoTag = (text) => {
    setMerch(text);
    if (text.length > 2) setCat(categorizeExpense(text));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!amt || !merch) return alert('Enter amount and merchant!');
    const mStr = String(month).padStart(2, '0');
    const today = new Date().getDate().toString().padStart(2, '0');
    saveTransaction({ amount: Number(amt), merchant: merch, category: cat, date: `${year}-${mStr}-${today}` });
    
    // Trigger success notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Expense Added ✅", { body: `Logged ${formatCurrency(Number(amt))} for ${merch}.`, icon: '/vite.svg' });
    }
    
    onSave();
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      <div className="page-header">
        <h2>Record a Transaction</h2>
        <p className="subtitle">Enter the details of your latest outflow.</p>
      </div>
      <form onSubmit={submit} className="glass-card stylish-form">
        <div className="form-group">
          <label><IndianRupee size={16}/> Transaction Amount</label>
          <div className="input-icon-wrapper">
            <span className="input-prefix">₹</span>
            <input type="number" className="input-field pl-prefix" placeholder="0.00" value={amt} onChange={e => setAmt(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="form-group">
          <label><Store size={16}/> Merchant or Place</label>
          <input type="text" className="input-field" placeholder="e.g., Starbucks, Amazon, Blinkit..." value={merch} onChange={e => handleAutoTag(e.target.value)} />
          {merch && <div className="auto-detect-msg">✨ Auto-assigned to <strong>{cat}</strong></div>}
        </div>
        <div className="form-group">
          <label><Tag size={16}/> Confirmed Category</label>
          <select className="input-field" value={cat} onChange={e => setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-submit">Add to Ledger</button>
      </form>
    </div>
  );
};

const HistoryView = ({ transactions, onDelete }) => (
  <div className="fade-in max-w-2xl mx-auto">
    <div className="page-header mb-0">
      <h2>Ledger History</h2>
      <p className="subtitle">Your chronological spending record.</p>
    </div>
    <div className="history-mt">
      {transactions.length === 0 ? <p className="empty-state">No transactions recorded yet.</p> : (
        <div className="history-list">
          {transactions.map(t => (
            <div className="history-item" key={t.id} style={{ position: 'relative' }}>
              <div className="hist-icon" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#fff', boxShadow: `0 0 10px ${CATEGORY_COLORS[t.category] || '#fff'}66` }} />
              <div className="hist-details">
                <div className="hist-merch">{t.merchant}</div>
                <div className="hist-date">{t.date}  •  <span style={{color: CATEGORY_COLORS[t.category]}}>{t.category}</span></div>
              </div>
              <div className="hist-amount" style={{ paddingRight: '46px' }}>- {formatCurrency(t.amount)}</div>
              <button 
                onClick={() => {
                  if (window.confirm(`Delete transaction: ${t.merchant} for ${formatCurrency(t.amount)}?`)) {
                    onDelete(t.id);
                  }
                }}
                className="del-btn"
                title="Delete transaction"
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s', padding: '8px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const SettingsView = ({ initialBudgets, onSave }) => {
  const [localB, setLocalB] = useState(initialBudgets);
  
  const submit = () => {
    saveBudgets(localB);
    onSave();
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="page-header">
        <h2>Budget Blueprint</h2>
        <p className="subtitle">Allocate your monthly spending limits below.</p>
      </div>
      <div className="glass-card">
        <div className="budget-settings-grid">
          {CATEGORIES.map(c => {
            const color = CATEGORY_COLORS[c] || '#fff';
            return (
              <div className="budget-input-group" key={c}>
                <div className="budget-label">
                  <span className="dot" style={{backgroundColor: color}} />
                  {c}
                </div>
                <div className="input-icon-wrapper">
                  <span className="input-prefix" style={{color: '#8b949e'}}>₹</span>
                  <input type="number" className="input-field pl-prefix" 
                    placeholder="Limit"
                    value={localB[c] || ''} 
                    onChange={e => setLocalB({...localB, [c]: e.target.value})} 
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="divider" />
        <button onClick={submit} className="btn-submit save-btn-width">Confirm Allocation</button>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('dashboard'); 
  const { year, month } = getCurrentYearMonth();
  const [allTxs, setAllTxs] = useState([]);
  const [monthTxs, setMonthTxs] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const refreshData = () => {
    setMonthTxs(getTransactionsForMonth(year, month));
    setAllTxs(getTransactions());
    let localBdgs = getBudgets();
    if (Object.keys(localBdgs).length === 0) localBdgs = DEFAULT_BUDGETS; 
    setBudgets(localBdgs);
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id);
    refreshData();
  };

  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  };

  useEffect(() => { 
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    refreshData(); 
  }, [view, year, month]);

  // Compute Dashboard Metrics
  const spentByCategory = {};
  monthTxs.forEach(t => {
    const cat = t.category || 'Miscellaneous';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(t.amount);
  });
  
  const totalSpent = getTotalSpent(spentByCategory);
  const totalBudget = getTotalBudget(budgets);
  const overallPct = getSpendingPercentage(totalSpent, totalBudget);
  const isOver = overallPct >= 100;

  const alerts = [];
  if (isOver) {
    alerts.push(`🚨 You have exceeded your total monthly budget by ${formatCurrency(totalSpent - totalBudget)}!`);
  }
  
  CATEGORIES.forEach(cat => {
    const spent = spentByCategory[cat] || 0;
    const bgt = Number(budgets[cat]) || 0;
    if (bgt > 0 && spent > bgt) {
      alerts.push(`⚠️ You exceeded the ${cat} budget by ${formatCurrency(spent - bgt)}`);
    }
  });

  const barData = CATEGORIES.filter(c => spentByCategory[c] || budgets[c]).map(cat => ({
    name: cat.slice(0, 9) + (cat.length > 9 ? '.' : ''),
    Spent: spentByCategory[cat] || 0,
    Budget: Number(budgets[cat]) || 0,
    color: CATEGORY_COLORS[cat] || '#fff'
  }));

  const handleExcelExport = () => {
    if (allTxs.length === 0) return alert("Your ledger is currently empty.");
    const ws = XLSX.utils.json_to_sheet(allTxs.map(t => ({
      Date: t.date,
      Merchant: t.merchant,
      Category: t.category,
      Amount: t.amount,
      SystemID: t.id
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "Wealthify_Ledger.xlsx");
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><TrendingUp size={28} color="#0d1117" /></div>
          <div>
            <h1>Wealthify</h1>
            <span>Command Your Capital</span>
          </div>
        </div>
        
        <nav className="nav-links">
          <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20} className="nav-icon" /> Dashboard
          </button>
          <button className={`nav-link ${view === 'add' ? 'active' : ''}`} onClick={() => setView('add')}>
            <PlusCircle size={20} className="nav-icon" /> Add Expense
          </button>
          <button className={`nav-link ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
            <List size={20} className="nav-icon" /> Ledger History
          </button>
          <button className={`nav-link ${view === 'budgets' ? 'active' : ''}`} onClick={() => setView('budgets')}>
            <Settings size={20} className="nav-icon" /> Set Budgets
          </button>
          
          <div className="sidebar-footer">
            {installPrompt && (
              <button className="btn-export" onClick={handleInstallClick} style={{ marginBottom: '10px', backgroundColor: '#FFD700', color: '#0d1117' }}>
                <Download size={18} /> Install Desktop App
              </button>
            )}
            <button className="btn-export" onClick={handleExcelExport}>
              <Download size={18} /> Export Excel
            </button>
          </div>
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {view === 'dashboard' && (
          <DashboardView 
            totalSpent={totalSpent} totalBudget={totalBudget} 
            overallPct={overallPct} isOver={isOver} 
            alerts={alerts} barData={barData} 
            spentByCategory={spentByCategory} budgets={budgets} 
          />
        )}
        
        {view === 'add' && <AddExpenseView year={year} month={month} onSave={() => { refreshData(); setView('dashboard'); }} />}
        
        {view === 'history' && <HistoryView transactions={allTxs} onDelete={handleDeleteTransaction} />}
        
        {view === 'budgets' && <SettingsView initialBudgets={budgets} onSave={() => { refreshData(); setView('dashboard'); }} />}
      </main>
    </div>
  );
}
