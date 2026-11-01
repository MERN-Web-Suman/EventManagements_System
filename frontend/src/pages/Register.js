// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { HiSparkles } from 'react-icons/hi';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', adminKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.adminKey) delete payload.adminKey;
      await authService.register(payload);
      toast.success('OTP sent to your email! Please verify.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, name, type = 'text', placeholder, children }) => (
    <div>
      <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">
        {placeholder}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type={type} name={name} value={form[name]} onChange={handleChange}
          required={!['phone', 'adminKey'].includes(name)} placeholder={`Enter ${placeholder.toLowerCase()}`}
          className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
        />
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 dot-pattern">
      <div className="fixed top-20 right-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-gradient flex items-center justify-center shadow-lg">
              <HiSparkles className="text-white" size={20} />
            </div>
            <span className="font-display font-black text-2xl gradient-text">FESTIVA</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Join thousands of event lovers</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Phone (optional)</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">Admin Key (optional)</label>
              <div className="relative">
                <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type={showAdminKey ? 'text' : 'password'} name="adminKey" value={form.adminKey} onChange={handleChange} placeholder="Only for admins"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all" />
                <button type="button" onClick={() => setShowAdminKey(!showAdminKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showAdminKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-orange-gradient text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
