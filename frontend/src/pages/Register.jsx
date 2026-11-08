import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import OtpInput from '../components/ui/OtpInput';
import { UserPlus, ArrowLeft, MailCheck } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (
      !formData.fullName.trim() ||
      !formData.userName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all mandatory fields.');
      return false;
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Phone number must be a valid Vietnamese format (e.g., 0912345678).');
      return false;
    }

    if (formData.password.length < 8 || formData.password.length > 32) {
      setError('Password must be between 8 and 32 characters long.');
      return false;
    }

    if (/\s/.test(formData.password)) {
      setError('Password must not contain any spaces.');
      return false;
    }

    if (formData.password.toLowerCase() === formData.userName.trim().toLowerCase()) {
      setError('Password must not be identical to the username.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Confirmation password does not match.');
      return false;
    }

    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await authService.register(formData);
      setSuccessMsg(res.message || 'OTP verification code sent to your email.');
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      setLoading(true);
      await authService.verifyRegisterOtp({
        email: formData.email,
        otp,
      });
      navigate('/login', {
        state: { message: 'Account registered and activated successfully! Please sign in.' },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      const res = await authService.resendOtp({
        email: formData.email,
        purpose: 'REGISTER',
      });
      setSuccessMsg('A new OTP has been dispatched to your email.');
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mb-3 shadow-sm shadow-blue-100">
            {step === 1 ? <UserPlus className="w-6 h-6" /> : <MailCheck className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'Pet Owner Registration' : 'Verify Your Email'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {step === 1
              ? 'Create your account to consult AI and manage pet health'
              : `We sent a 6-digit code to ${formData.email}`}
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} className="mb-4" onClose={() => setSuccessMsg('')} />}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Input
              id="fullName"
              label="Full Name"
              placeholder="e.g. Alice Johnson"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="userName"
                label="Username"
                placeholder="alice_j"
                value={formData.userName}
                onChange={handleChange}
                required
              />

              <Input
                id="phone"
                label="Phone Number"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                required
                helperText="Vietnamese phone format"
              />
            </div>

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="alice@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              id="address"
              label="Residential Address (Optional)"
              placeholder="e.g. 123 Nguyen Hue, District 1, HCMC"
              value={formData.address}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="8-32 chars, no spaces"
                value={formData.password}
                onChange={handleChange}
                required
                helperText=""
              />

              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2" isLoading={loading}>
              <UserPlus className="w-4 h-4" />
              <span>Register Account</span>
            </Button>
          </form>
        ) : (
          <div className="py-2 space-y-4">
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
                Vui lòng kiểm tra mục <strong>Thư rác (Spam)</strong>, <strong>Quảng cáo (Promotions)</strong> hoặc <strong>Tất cả thư</strong> trong Gmail của bạn.
              </p>
            </div>

            <OtpInput
              otp={otp}
              setOtp={setOtp}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              isLoading={loading}
              error={error}
            />
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to edit registration details</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
