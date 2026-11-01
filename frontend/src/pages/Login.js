// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiSparkles } from 'react-icons/hi';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}! 🎉`);
      navigate(data.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 dot-pattern">
      {/* BG Blobs */}
      <div className="fixed top-20 left-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-gradient flex items-center justify-center shadow-lg">
              <HiSparkles className="text-white" size={20} />
            </div>
            <span className="font-display font-black text-2xl gradient-text">FESTIVA</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome back!</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} required placeholder="••••••••"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-orange-gradient text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
