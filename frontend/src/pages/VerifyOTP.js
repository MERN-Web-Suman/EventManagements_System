// src/pages/VerifyOTP.js
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiSparkles } from 'react-icons/hi';
import { FiMail } from 'react-icons/fi';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
    inputs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ email, otp: code });
      login(data.data.user, data.data.token);
      toast.success('Email verified! Welcome to FESTIVA 🎉');
      navigate(data.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOTP({ email });
      toast.success('New OTP sent!');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 dot-pattern">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-gradient flex items-center justify-center shadow-lg">
              <HiSparkles className="text-white" size={20} />
            </div>
            <span className="font-display font-black text-2xl gradient-text">FESTIVA</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Verify your email</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-sm">
            <FiMail size={14} />
            <span>OTP sent to <span className="text-primary-400 font-medium">{email}</span></span>
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <p className="text-gray-400 text-sm text-center mb-6">Enter the 6-digit code we sent to your email</p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputs.current[idx] = el)}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-dark-800 text-white transition-all duration-200 outline-none ${
                  digit
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'border-white/10 focus:border-primary-500/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify} disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 bg-orange-gradient text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </span>
            ) : 'Verify Email ✓'}
          </button>

          <div className="mt-5 text-center">
            {resendTimer > 0 ? (
              <p className="text-gray-500 text-sm">Resend OTP in <span className="text-primary-400 font-semibold">{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResend} className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors">
                Resend OTP →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
