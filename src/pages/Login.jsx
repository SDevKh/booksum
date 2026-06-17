import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, signup } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!isLoginTab && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginTab) {
        await login(username.trim(), password);
      } else {
        await signup(username.trim(), password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card/40 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-2xl shadow-primary/5 relative"
      >
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Welcome to BookWise</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isLoginTab ? 'Sign in to access your personal summaries library.' : 'Create an account to begin building your reading habit.'}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/40 mb-6">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              isLoginTab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground/80'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              !isLoginTab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground/80'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/10 dark:bg-black/20 border border-border focus:border-primary outline-none text-sm transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/10 dark:bg-black/20 border border-border focus:border-primary outline-none text-sm transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Confirm Password (for sign up) */}
          {!isLoginTab && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify password..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/10 dark:bg-black/20 border border-border focus:border-primary outline-none text-sm transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 py-2.5 px-3 rounded-xl animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLoginTab ? 'Signing In...' : 'Registering...'}
              </>
            ) : (
              <>{isLoginTab ? 'Sign In' : 'Create Account'}</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
