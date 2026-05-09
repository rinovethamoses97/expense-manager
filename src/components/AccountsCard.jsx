import { TrendingUp, TrendingDown, Wallet, Landmark } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AccountsCard({ accounts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {
        accounts.map((accts)=>(
            <div key={accts._id}  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                    <Landmark className="text-green-600" size={22} />
                </div>
                <div>
                <p className="text-sm text-gray-500">{accts.accountName}</p>
                <p className="text-sm text-gray-500">{accts.category}</p>
                <p className="text-2xl font-bold text-green-600">{fmt(accts.balance)}</p>
                </div>
            </div>
        ))}
    </div>
  );
}
