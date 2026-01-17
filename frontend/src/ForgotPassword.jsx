import React, { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // Assuming the backend is running on localhost:5000 based on standard setup
            const backendUrl = 'http://localhost:5000';
            await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
            setStatus('success');
            setMessage('Reset link sent! Check your email (or console for local dev).');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to send reset email');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
                <div className="glass-card p-8 w-full max-w-md text-center animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-green-500/20 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={32} className="text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">Check Your Email</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        {message}
                    </p>
                    <button
                        onClick={() => onBack()}
                        className="w-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Login
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

                <button
                    onClick={() => onBack()}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Forgot Password</h2>
                    <p className="text-gray-400">Enter your email to reset your password</p>
                </div>

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                placeholder="you@example.com"
                            />
                            <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Send Reset Link</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
