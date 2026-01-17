import React, { useState } from 'react';
import { authAPI } from './api/client';

const Login = ({ onLogin, onForgotPassword }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Register
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const data = await authAPI.register(name, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          onLogin(data);
        }, 1000);
      } else {
        // Login
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        const data = await authAPI.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/crypto-bg.png')" }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>

      {/* Login/Register card */}
      <div className="bg-slate-900/90 border-t-4 border-blue-600 rounded-3xl p-12 md:p-16 w-full max-w-2xl relative shadow-2xl shadow-blue-900/20 backdrop-filter backdrop-blur-md z-10">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
            <img
              src="/logo.jpg"
              alt="CripTik Logo"
              className="w-full h-full object-cover scale-[1.1]"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-3">
          {isRegistering ? 'Create Account' : 'Welcome back'}
        </h1>
        <p className="text-gray-400 text-center mb-12 text-lg">
          {isRegistering ? 'Start your crypto journey' : 'Sign in to your crypto portfolio'}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {isRegistering && (
            <div>
              <label className="block text-gray-400 mb-3 text-sm font-semibold uppercase tracking-wider pl-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-4 px-6 text-lg rounded-xl bg-slate-950/50 border border-slate-700/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-600"
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-gray-400 mb-3 text-sm font-semibold uppercase tracking-wider pl-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 px-6 text-lg rounded-xl bg-slate-950/50 border border-slate-700/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-600"
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-gray-400 text-sm font-semibold uppercase tracking-wider pl-1" htmlFor="password">
                Password
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onForgotPassword) onForgotPassword();
                  }}
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium bg-transparent border-none cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-6 text-lg rounded-xl bg-slate-950/50 border border-slate-700/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-600"
              disabled={loading}
              minLength={6}
            />
            {isRegistering && (
              <p className="text-xs text-gray-500 mt-2 pl-1">Password must be at least 6 characters</p>
            )}
          </div>

          {!isRegistering && (
            <div className="flex items-center gap-3 pl-1">
              <input
                type="checkbox"
                id="remember"
                className="w-5 h-5 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="remember" className="text-gray-400 select-none cursor-pointer">Remember me for 30 days</label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 mt-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
              disabled={loading}
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
