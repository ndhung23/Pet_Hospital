import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || 'OTP code sent to your email.');
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch reset code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 32) {
      setError('New password must be between 8 and 32 characters long.');
      return;
    }

    if (/\s/.test(newPassword)) {
      setError('New password must not contain spaces.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirmation password does not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      navigate('/login', {
        state: { message: res.message || 'Password successfully reset! Please sign in with your new password.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please verify your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp({ email: email.trim(), purpose: 'RESET_PASSWORD' });
      setSuccessMsg('A fresh OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl mb-3 shadow-sm shadow-amber-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {step === 1
              ? 'Enter your registered email to receive a verification OTP'
              : `Enter the code sent to ${email} and set your new password`}
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} className="mb-4" onClose={() => setSuccessMsg('')} />}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              id="email"
              label="Registered Email"
              type="email"
              placeholder="e.g. alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Send Verification OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {devOtp && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-800">
                  [Dev Mode] Verification OTP: <span className="font-mono text-base tracking-widest text-amber-950 font-black">{devOtp}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                >
                  Click to auto-fill code
                </button>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <p className="font-medium text-slate-700 mb-0.5">📬 Không thấy email trong Hộp thư đến?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Vui lòng kiểm tra mục <strong>Thư rác (Spam)</strong>, <strong>Quảng cáo (Promotions)</strong> hoặc <strong>Tất cả thư</strong> trong Gmail.
              </p>
            </div>

            <Input
              id="otp"
              label="6-Digit OTP Code"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />

            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="8-32 characters, no spaces"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Reset Password
            </Button>

            <div className="flex justify-between items-center pt-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
