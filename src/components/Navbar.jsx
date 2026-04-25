import { WalletCards, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WalletCards className="text-indigo-600" size={28} />
          <span className="text-xl font-bold text-gray-800">ExpenseTracker</span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {user.avatar && (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
