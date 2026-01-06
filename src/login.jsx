import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      {/* Login card */}
      <div className="bg-slate-900 border-t-4 border-blue-600 rounded-3xl p-12 md:p-16 w-full max-w-2xl relative shadow-2xl shadow-blue-900/10">
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
          Welcome back
        </h1>
        <p className="text-gray-400 text-center mb-12 text-lg">Sign in to your crypto portfolio</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            />
          </div>
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
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-gray-400 text-sm font-semibold uppercase tracking-wider pl-1" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-6 text-lg rounded-xl bg-slate-950/50 border border-slate-700/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-600"
            />
          </div>

          <div className="flex items-center gap-3 pl-1">
            <input
              type="checkbox"
              id="remember"
              className="w-5 h-5 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="remember" className="text-gray-400 select-none cursor-pointer">Remember me for 30 days</label>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 mt-2 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
