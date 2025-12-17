import React, { useState } from 'react';
import { service } from '../services'; // Updated import
import { USE_MOCK_SERVICE } from '../config';

export const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError('');
    
    service.login(phone)
      .then(() => {
        setLoading(false);
        setStep(2);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || 'Failed to request OTP');
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');

    service.verifyOtp(phone, otp)
      .then(() => {
        setLoading(false);
        onLogin();
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || 'Verification failed');
      });
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">SignalLite</h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Secure, Private, Simple.</p>

        {error && (
            <div className="mb-4 bg-red-900/50 border border-red-700 text-red-200 text-sm p-3 rounded text-center">
                {error}
            </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
            {USE_MOCK_SERVICE ? (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded text-xs text-blue-200 text-center">
                    <strong>Mock Mode:</strong> Runs locally in browser. No real SMS.
                </div>
            ) : (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-900/50 rounded text-xs text-yellow-200 text-center">
                    <strong>Real Mode:</strong> Expects backend at <code>localhost:3000</code>.
                </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Enter Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={USE_MOCK_SERVICE ? "123456" : "SMS Code"}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition text-center tracking-widest text-xl"
              />
               {USE_MOCK_SERVICE && (
                <p className="text-xs text-green-400 mt-2 text-center">
                 ✨ Dev Mode: Enter <b>123456</b>
                </p>
               )}
            </div>
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-400 hover:text-white mt-2"
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
