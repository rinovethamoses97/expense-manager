import { WalletCards } from 'lucide-react';

export default function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <WalletCards className="text-indigo-600" size={36} />
          <span className="text-2xl font-bold text-gray-800">ExpenseTracker</span>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">Hello Ranju!!</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your finances</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2 w-full text-center">
            Authentication failed. Please try again.
          </p>
        )}

        <a
          href="/auth/google"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </a>

        <p className="text-xs text-gray-400 text-center">
          Your data is private and only visible to you.
        </p>
      </div>
    </div>
  );
}
