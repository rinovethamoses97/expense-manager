import { format } from 'date-fns';

export default function Filters({ month, type, onMonthChange, onTypeChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="month"
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        max={format(new Date(), 'yyyy-MM')}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
      />

      <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
        {[
          { label: 'All', value: 'all' },
          { label: 'Income', value: 'income' },
          { label: 'Expense', value: 'expense' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTypeChange(opt.value)}
            className={`px-4 py-2 font-medium transition-colors ${
              type === opt.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
