import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const CATEGORY_COLORS = {
  'Food & Dining': 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  'Health & Medical': 'bg-red-100 text-red-700',
  Utilities: 'bg-gray-100 text-gray-700',
  Rent: 'bg-yellow-100 text-yellow-700',
  Education: 'bg-teal-100 text-teal-700',
  Travel: 'bg-cyan-100 text-cyan-700',
  'Personal Care': 'bg-rose-100 text-rose-700',
  Salary: 'bg-green-100 text-green-700',
  Freelance: 'bg-emerald-100 text-emerald-700',
  Business: 'bg-lime-100 text-lime-700',
  Investment: 'bg-violet-100 text-violet-700',
  Gift: 'bg-fuchsia-100 text-fuchsia-700',
  Other: 'bg-slate-100 text-slate-700',
};

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-700';
}

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
        No transactions found. Add one to get started!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {expenses.map((exp) => (
          <div key={exp._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-xl ${exp.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
              {exp.type === 'income' ? (
                <TrendingUp className="text-green-600" size={18} />
              ) : (
                <TrendingDown className="text-red-500" size={18} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-800 text-sm truncate">{exp.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(exp.category)}`}>
                  {exp.category}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(exp.date), 'dd MMM yyyy')}
                {exp.description && ` · ${exp.description}`}
              </p>
            </div>

            <span className={`text-base font-bold shrink-0 ${exp.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
              {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN')}
            </span>

            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(exp)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(exp._id)}
                disabled={deleting === exp._id}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
