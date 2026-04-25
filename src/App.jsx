import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import ExpenseList from './components/ExpenseList';
import ExpenseModal from './components/ExpenseModal';
import Filters from './components/Filters';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, byCategory: [], byMonth: [] });
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [type, setType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams({ month, sort: '-date' });
      if (type !== 'all') params.set('type', type);

      const [expRes, sumRes] = await Promise.all([
        fetch(`/api/expenses?${params}`, { credentials: 'include' }),
        fetch(`/api/summary?month=${month}`, { credentials: 'include' }),
      ]);
      const [expData, sumData] = await Promise.all([expRes.json(), sumRes.json()]);

      if (expData.success) setExpenses(expData.data);
      if (sumData.success) setSummary(sumData.data);
    } catch {
      setFetchError('Unable to reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [month, type]);

  useEffect(() => {
    if (user) fetchData();
  }, [fetchData, user]);

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(e) {
    setEditTarget(e);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchData();
  }

  // Still loading auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your income and expenses</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={17} />
            Add Transaction
          </button>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {fetchError}
          </div>
        )}

        <SummaryCards income={summary.income} expense={summary.expense} balance={summary.balance} />
        <Charts byCategory={summary.byCategory} byMonth={summary.byMonth} />

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-700">Transactions Test</h2>
            <Filters month={month} type={type} onMonthChange={setMonth} onTypeChange={setType} />
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
              Loading...
            </div>
          ) : (
            <ExpenseList expenses={expenses} onEdit={openEdit} onDelete={handleDelete} />
          )}
        </div>

        <ExpenseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={fetchData}
          initial={editTarget}
        />
      </main>
    </div>
  );
}
