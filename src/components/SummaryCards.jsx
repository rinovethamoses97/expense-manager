import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function SummaryCards({ income, expense, balance }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-xl">
          <TrendingUp className="text-green-600" size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{fmt(income)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="bg-red-100 p-3 rounded-xl">
          <TrendingDown className="text-red-500" size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">{fmt(expense)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-indigo-100' : 'bg-orange-100'}`}>
          <Wallet className={balance >= 0 ? 'text-indigo-600' : 'text-orange-500'} size={22} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
            {fmt(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
