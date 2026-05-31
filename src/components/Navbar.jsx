import { useEffect, useRef, useState } from 'react';
import { WalletCards, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onProfileClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  function handleProfile() {
    setMenuOpen(false);
    onProfileClick?.();
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WalletCards className="text-indigo-600" size={28} />
          <span className="text-xl font-bold text-gray-800">ExpenseTracker</span>
        </div>

        {user && (
          <div ref={wrapperRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-50 transition-colors"
            >
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  {user.email && (
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  )}
                </div>
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleProfile}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <User size={15} />
                  Update Profile
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
