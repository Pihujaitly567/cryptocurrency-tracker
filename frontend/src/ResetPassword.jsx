import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Rudimentary way to parse UUID/Token from URL if no router is present
// Since the user is not using React Router properly in the main App (it seems to be tab based),
// we will have to mount this component conditionally or handle the URL manually.
const ResetPassword = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Extract token from URL path: /reset-password/:token
        // window.location.pathname would be like /reset-password/123456
        const pathParts = window.location.pathname.split('/');
        const tokenFromUrl = pathParts[pathParts.length - 1]; // Simply grab the last part
        setToken(tokenFromUrl);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');

        try {
            const backendUrl = 'http://localhost:5000';
            await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, { password });
            setStatus('success');
            setMessage('Password reset successful! You can now login.');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to reset password');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
                <div className="glass-card p-8 w-full max-w-md text-center animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-green-500/20 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-4">Success!</h2>
                    <p className="text-gray-300 mb-8">
                        Your password has been reset successfully.
                    </p>
                    <button
                        onClick={() => {
                            // Clear URL to go back to clean state
                            window.history.pushState({}, '', '/');
                            onLogin();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
            <div className="glass-card p-8 w-full max-w-md animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">New Password</h2>
                    <p className="text-gray-400">Create a new secure password</p>
                </div>

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
