import React, { useState } from 'react';
import {
  Radio,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_ADMIN_EMAIL } from '../../services/firebase/authService';

export const AuthorityLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your Government Authority official email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to authenticate authority credentials.');
      } else {
        // Clear password immediately from component memory
        setPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication service temporarily unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-teal-100 selection:text-teal-900 font-sans">
      {/* Background subtle watermark badge */}
      <div className="w-full max-w-md">
        {/* National Crest / Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm text-teal-700 mb-2">
            <Radio className="w-7 h-7 text-teal-600 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800">
              GOVERNMENT OF INDIA · MoRTH ITS
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Virtual Speed Reducer System
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Centralized National Intelligent Transportation Grid & Digital Twin Speed Management Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-700" />
                Authority Portal Login
              </h2>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                LEVEL 3 ENFORCEMENT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Authenticate with your registered MoRTH / State Traffic Authority account to access the speed zone control grid.
            </p>
          </div>

          {/* Test Authority Account Banner (Judges / Evaluators) */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-teal-800">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Configured Authority Account</span>
            </div>
            <div className="text-[11px] text-teal-700/90 font-mono">
              Account: <strong className="text-teal-900">{DEFAULT_ADMIN_EMAIL}</strong>
            </div>
            <div className="text-[10px] text-teal-600/80">
              Enter the password set for this Firebase test authority user to initiate an authenticated session.
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Authority Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@svsr-demo.in"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authority password"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-teal-700/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials with Firebase...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>National Highways & Urban Mobility Authority · BBSR Command</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Authorized personnel only. All access, publishes, and emergency overrides are cryptographically logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
