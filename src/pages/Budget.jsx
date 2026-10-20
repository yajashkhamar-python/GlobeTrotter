import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import '../components/common/common.css';


const CATEGORY_ICONS = {
  'Flights': '✈️',
  'Accommodation': '🏨',
  'Activities': '🎭',
  'Meals': '🍽️',
  'Transport': '🚇',
  'Shopping & Other': '🛍️',
  'Other': '💰'
};

const CATEGORY_COLORS = {
  'Flights': '#1d5bef',
  'Accommodation': '#7c3aed',
  'Activities': '#059669',
  'Meals': '#d97706',
  'Transport': '#dc2626',
  'Shopping & Other': '#6b7280',
  'Other': '#4b5563'
};

function DonutChart({ breakdown, totalSpent }) {
  if (totalSpent === 0) {
    return (
      <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'var(--color-border)', position: 'relative' }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 100, height: 100, borderRadius: '50%', background: 'var(--color-surface)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Total</span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹0</span>
        </div>
      </div>
    );
  }

  let cumulativePct = 0;
  const gradient = breakdown.map(item => {
    const pct = (item.amount / totalSpent) * 100;
    const from = cumulativePct;
    const to = cumulativePct + pct;
    cumulativePct = to;
    return `${item.color} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
  }).join(', ');

  return (
    <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
      <div style={{
        width: 180, height: 180, borderRadius: '50%',
        background: `conic-gradient(${gradient})`,
        position: 'relative',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 100, height: 100, borderRadius: '50%',
        background: 'var(--color-surface)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Total</span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          ₹{totalSpent.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default function Budget() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ category: 'Meals', amount: '', description: '', date: '' });
  
  const selectedTrip = trips.find(t => t.id == selectedTripId);
  
  // Helper to get local YYYY-MM-DD format
  const getLocalDateStr = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDate = selectedTrip ? getLocalDateStr(selectedTrip.start_date) : '';
  const maxDate = selectedTrip ? getLocalDateStr(selectedTrip.end_date) : '';
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitForm, setLimitForm] = useState('');

  // 1. Fetch trips on mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const res = await fetchApi('/trips');
        if (res.success && res.trips.length > 0) {
          setTrips(res.trips);
          // Auto-select trip from location state, or the first trip
          const initialTripId = location.state?.tripId || res.trips[0].id;
          setSelectedTripId(initialTripId);
        } else {
          setLoading(false); // No trips
        }
      } catch (err) {
        console.error('Failed to load trips', err);
        setLoading(false);
      }
    };
    loadTrips();
  }, [location.state]);

  // 2. Fetch budget and expenses when selected trip changes
  useEffect(() => {
    if (!selectedTripId) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [budgetRes, expensesRes] = await Promise.all([
          fetchApi(`/trips/${selectedTripId}/budget`),
          fetchApi(`/trips/${selectedTripId}/expenses`)
        ]);
        
        if (budgetRes.success) setBudgetData(budgetRes.budget);
        if (expensesRes.success) setExpenses(expensesRes.expenses);
      } catch (err) {
        console.error('Failed to load budget data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedTripId]);

  // Reset invalid date if selected trip changes
  useEffect(() => {
    if (expenseForm.date && minDate && maxDate) {
      if (expenseForm.date < minDate || expenseForm.date > maxDate) {
        setExpenseForm(prev => ({ ...prev, date: minDate }));
      }
    }
  }, [selectedTripId, minDate, maxDate]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return alert('Enter a valid amount');
    
    try {
      if (editingExpense) {
        const res = await fetchApi(`/expenses/${editingExpense.id}`, {
          method: 'PUT',
          body: JSON.stringify(expenseForm)
        });
        if (res.success) {
          setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? res.expense : ex));
        }
      } else {
        const res = await fetchApi(`/trips/${selectedTripId}/expenses`, {
          method: 'POST',
          body: JSON.stringify(expenseForm)
        });
        if (res.success) {
          setExpenses(prev => [res.expense, ...prev]);
        }
      }
      
      // Refresh budget totals
      const bRes = await fetchApi(`/trips/${selectedTripId}/budget`);
      if (bRes.success) setBudgetData(bRes.budget);
      
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseForm({ category: 'Meals', amount: '', description: '', date: minDate });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetchApi(`/expenses/${id}`, { method: 'DELETE' });
      if (res.success) {
        setExpenses(prev => prev.filter(ex => ex.id !== id));
        const bRes = await fetchApi(`/trips/${selectedTripId}/budget`);
        if (bRes.success) setBudgetData(bRes.budget);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
    }
  };

  const handleLimitSubmit = async (e) => {
    e.preventDefault();
    try {
      // Just updating the budget_limit field on the trip
      await fetchApi(`/trips/${selectedTripId}`, {
        method: 'PUT',
        body: JSON.stringify({ budget_limit: parseFloat(limitForm) || 0 })
      });
      const bRes = await fetchApi(`/trips/${selectedTripId}/budget`);
      if (bRes.success) setBudgetData(bRes.budget);
      setShowLimitModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page-container page-enter" style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  if (trips.length === 0) {
    return (
      <div className="page-container page-enter">
        <EmptyState
          title="No Trips Found"
          description="You need to create a trip before managing a budget."
          action={<button className="btn btn-primary" onClick={() => navigate('/trips/create')}>Create Trip</button>}
        />
      </div>
    );
  }

  const breakdownArray = budgetData ? Object.entries(budgetData.categories)
    .filter(([_, amount]) => amount > 0)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      icon: CATEGORY_ICONS[cat] || CATEGORY_ICONS['Other'],
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other']
    })).sort((a, b) => b.amount - a.amount) : [];

  return (
    <div className="page-container page-enter">
      {/* Header with Trip Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.01em' }}>Budget</h1>
          <select 
            className="form-input" 
            style={{ marginTop: '8px', padding: '6px 12px', fontSize: '14px', width: 'auto' }}
            value={selectedTripId} 
            onChange={e => setSelectedTripId(e.target.value)}
          >
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/trips/${selectedTripId}`)}>
            View Itinerary
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            if (!selectedTripId) {
              alert('Select a trip first.');
              return;
            }
            setEditingExpense(null);
            
            // Choose default valid date
            let defaultDate = new Date().toISOString().split('T')[0];
            if (minDate && maxDate) {
              if (defaultDate < minDate || defaultDate > maxDate) {
                defaultDate = minDate;
              }
            }
            
            setExpenseForm({ category: 'Meals', amount: '', description: '', date: defaultDate });
            setShowExpenseModal(true);
          }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {budgetData && (
        <>
          {/* Top cards */}
          <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Total Spent</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{budgetData.totalSpent.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>{budgetData.totalDays} days</div>
            </div>
            
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Avg per Day</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{budgetData.averagePerDay.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>per day</div>
            </div>

            <div style={{ background: budgetData.budgetLimit > 0 ? (budgetData.isOverBudget ? '#fee2e2' : 'var(--color-accent)') : 'var(--color-surface)', border: `1px solid ${budgetData.budgetLimit > 0 ? 'transparent' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: budgetData.budgetLimit > 0 ? (budgetData.isOverBudget ? '#dc2626' : 'rgba(255,255,255,0.7)') : 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  {budgetData.budgetLimit > 0 ? (budgetData.isOverBudget ? 'Over Budget By' : 'Budget Remaining') : 'No Budget Limit'}
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }} onClick={() => { setLimitForm(budgetData.budgetLimit || ''); setShowLimitModal(true); }}>
                  <Pencil size={12} />
                </button>
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: budgetData.budgetLimit > 0 ? (budgetData.isOverBudget ? '#dc2626' : 'white') : 'var(--color-text-primary)' }}>
                {budgetData.budgetLimit > 0 ? `₹${Math.abs(budgetData.budgetRemaining).toLocaleString('en-IN')}` : '₹0'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: budgetData.budgetLimit > 0 ? (budgetData.isOverBudget ? '#ef4444' : 'rgba(255,255,255,0.55)') : 'var(--color-text-muted)', marginTop: '4px' }}>
                {budgetData.budgetLimit > 0 ? `of ₹${budgetData.budgetLimit.toLocaleString('en-IN')} limit` : 'Click edit to set'}
              </div>
            </div>
          </div>

          {/* Over-budget warning */}
          {budgetData.isOverBudget && (
            <div style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <AlertTriangle size={18} color="var(--color-warning)" />
              <div>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>Over Budget:{' '}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>You have exceeded your total budget by ₹{Math.abs(budgetData.budgetRemaining).toLocaleString('en-IN')}.</span>
              </div>
            </div>
          )}

          {/* Chart + Breakdown */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>Budget Breakdown</h2>
            <div className="flex gap-8 flex-wrap items-center">
              <DonutChart breakdown={breakdownArray} totalSpent={budgetData.totalSpent} />
              
              <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {breakdownArray.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No expenses yet.</div>
                ) : breakdownArray.map((item) => {
                  const pct = Math.round((item.amount / budgetData.totalSpent) * 100);
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{pct}%</span>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Expenses List */}
      <div>
        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Expenses</h2>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: 'var(--color-text-muted)', marginBottom: '10px' }}>No expenses yet</div>
            <button className="btn btn-outline btn-sm mx-auto" onClick={() => {
              setEditingExpense(null);
              let defaultDate = new Date().toISOString().split('T')[0];
              if (minDate && maxDate && (defaultDate < minDate || defaultDate > maxDate)) {
                defaultDate = minDate;
              }
              setExpenseForm({ category: 'Meals', amount: '', description: '', date: defaultDate });
              setShowExpenseModal(true);
            }}>Add your first expense</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.map(ex => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '24px' }}>{CATEGORY_ICONS[ex.category] || CATEGORY_ICONS['Other']}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ex.description || ex.category}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {ex.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontWeight: 700 }}>₹{parseFloat(ex.amount).toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '5px' }} onClick={() => {
                      setEditingExpense(ex);
                      setExpenseForm({ category: ex.category, amount: ex.amount, description: ex.description || '', date: ex.date ? getLocalDateStr(ex.date) : minDate });
                      setShowExpenseModal(true);
                    }}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '5px', color: 'var(--color-danger)' }} onClick={() => handleDeleteExpense(ex.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                  {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" min="0" className="form-input" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="e.g. Dinner at Luigi's" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required 
                  min={minDate}
                  max={maxDate}
                  value={expenseForm.date} 
                  onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} 
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingExpense ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Limit Modal */}
      {showLimitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--color-bg)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '300px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Set Budget Limit</h3>
            <form onSubmit={handleLimitSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Total Limit (₹)</label>
                <input type="number" step="0.01" min="0" className="form-input" value={limitForm} onChange={e => setLimitForm(e.target.value)} placeholder="0 = No limit" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => setShowLimitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
