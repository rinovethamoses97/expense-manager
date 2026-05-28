import { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport','Fuel', 'Shopping', 'Entertainment', 'Health & Medical',
  'Utilities', 'Rent', 'Education', 'Travel', 'Personal Care', 'Other',
];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

const empty = {
  title: '',
  amount: 0,
  type: 'expense',
  category: '',
  accountId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  attachmentUrl: '',
};

export default function ExpenseModal({ open, onClose, onSave, initial,accounts }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, date: format(new Date(initial.date), 'yyyy-MM-dd') } : empty);
      setError('');
      setScanNotice('');
    }
  }, [open, initial]);

  async function handleReceiptUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScanning(true);
    setError('');
    setScanNotice('');
    try {
      const body = new FormData();
      body.append('receipt', file);
      const res = await fetch('/api/expenses/scan-receipt', {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Scan failed');

      const { attachmentUrl, parsed } = data.data;
      const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
      const matchedCategory = parsed.category && allCategories.includes(parsed.category)
        ? parsed.category
        : '';

      setForm((prev) => ({
        ...prev,
        attachmentUrl,
        title: parsed.merchant || prev.title,
        amount: parsed.amount ?? prev.amount,
        date: parsed.date || prev.date,
        category: matchedCategory || prev.category,
      }));

      const filled = [parsed.merchant && 'merchant', parsed.amount != null && 'amount', parsed.date && 'date']
        .filter(Boolean).length;
      setScanNotice(
        filled === 0
          ? "Receipt uploaded, but we couldn't read any fields — please fill them in."
          : 'Receipt scanned — please confirm the fields below.'
      );
    } catch (err) {
      setError(err.message || 'Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  }

  console.log("Accounts in Modal", accounts);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = initial?._id ? 'PUT' : 'POST';
      const url = initial?._id ? `/api/expenses/${initial._id}` : '/api/expenses';
      console.log(form);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial?._id ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleReceiptUpload}
            />
            {form.attachmentUrl ? (
              <a href={form.attachmentUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <img
                  src={form.attachmentUrl}
                  alt="Receipt"
                  className="w-12 h-12 rounded-lg object-cover border border-indigo-200"
                />
              </a>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-400">
                <Camera size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-indigo-700">Scan a receipt</p>
              <p className="text-xs text-indigo-500/80 truncate">
                {scanning
                  ? 'Reading receipt…'
                  : form.attachmentUrl
                    ? 'Attached — tap to replace'
                    : 'Auto-fill fields from a photo'}
              </p>
            </div>
            <button
              type="button"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {form.attachmentUrl ? 'Replace' : 'Upload'}
            </button>
          </div>
          {scanNotice && (
            <p className="text-xs text-indigo-600 -mt-2">{scanNotice}</p>
          )}

          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
                className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                  form.type === t
                    ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Monthly rent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              required
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="">Select Account</option>
              {accounts.map((c) => (
                <option key={c._id} value={c._id}>{c.accountName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Add a note..."
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : initial?._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
