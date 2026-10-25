'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Factory, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const DEMO_PRESETS = [
  { label: 'Procurement', email: 'procurement@test.com', role: 'Manufacturer' },
  { label: 'Quality', email: 'quality@test.com', role: 'Manufacturer' },
  { label: 'Finance', email: 'finance@test.com', role: 'Manufacturer' },
  { label: 'Workshop A (Owner)', email: 'workshopA@test.com', role: 'Shree Fabricators' },
  { label: 'Workshop B (Staff)', email: 'workshopB@test.com', role: 'Om Engg Works' },
  { label: 'Admin', email: 'admin@test.com', role: 'System Admin' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Query user's role to determine destination
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || data.user.user_metadata?.role;
        const isWorkshop = role === 'workshop_owner' || role === 'workshop_staff';

        if (isWorkshop) {
          router.push('/workshop');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('test1234');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-orange-500 selection:text-white">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 mb-3">
          <Factory className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">VendorFlow</h1>
        <p className="text-xs text-slate-400 mt-1">
          Deccan Boilers, Pune &bull; Subcontractor Management Portal
        </p>
      </div>

      {/* Login Card (Large, Phone-Friendly) */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your workshop dashboard or manufacturing unit
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start space-x-2 text-red-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to VendorFlow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Presets */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Quick Test Presets (Password: <code className="text-orange-400">test1234</code>)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleSelectPreset(p.email)}
                className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/50 transition-all group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{p.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        Demo Mode: Configure <code className="text-slate-400">.env.local</code> to connect your live Supabase project.
      </div>
    </div>
  );
}
