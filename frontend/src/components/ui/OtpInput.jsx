import React, { useState, useEffect } from 'react';
import Button from './Button';

const OtpInput = ({
  otp,
  setOtp,
  onVerify,
  onResend,
  isLoading = false,
  error = '',
}) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);
    await onResend();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 text-center">
          Enter 6-digit Verification Code
        </label>
        <div className="flex justify-center">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-48 text-center text-2xl tracking-[0.5em] font-mono py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {error && <p className="mt-2 text-xs text-rose-600 text-center font-medium">{error}</p>}
      </div>

      <Button
        type="button"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
        disabled={otp.length !== 6}
        onClick={onVerify}
      >
        Verify Code
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Didn't receive code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-slate-400">Resend in {countdown}s</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default OtpInput;
