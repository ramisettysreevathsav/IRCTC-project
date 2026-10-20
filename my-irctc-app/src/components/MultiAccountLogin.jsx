import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp } from '../redux/auth.action.js';

const MultiAccountLogin = () => {
  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  const [email, setEmail] = useState('');
  const [otpField, setOtpField] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const sendOtpStatus = useSelector((state) => state.auth.sendOtpStatus);
  const verifyOtpStatus = useSelector((state) => state.auth.verifyOtpStatus);

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    try {
      await dispatch(sendOtp({ email: email.trim().toLowerCase() })).unwrap();
      setOtpField(true);
    } catch (requestError) {
      setError(requestError);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = inputRefs.current.map((input) => input?.value || '').join('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit code from your email');
      return;
    }

    setError('');
    try {
      await dispatch(verifyOtp({ otp })).unwrap();
      setVerified(true);
    } catch (requestError) {
      setError(requestError);
    }
  };

  const handleOtpChange = (event, index) => {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);
    event.target.value = digit;
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="multi-account-login">
      {verified ? (
        <p>OTP verified successfully.</p>
      ) : otpField ? (
        <div className="otp-inputs">
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              ref={(element) => { inputRefs.current[index] = element; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`OTP digit ${index + 1}`}
              onChange={(event) => handleOtpChange(event, index)}
            />
          ))}
          <button type="button" onClick={() => setOtpField(false)}>Cancel</button>
          <button type="button" onClick={handleVerifyOtp} disabled={verifyOtpStatus === 'loading'}>
            {verifyOtpStatus === 'loading' ? 'Verifying...' : 'Submit OTP'}
          </button>
          {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
        </div>
      ) : (
        <>
          <input
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            type="email"
            placeholder="Email"
          />
          <button type="button" onClick={handleSendOtp} disabled={sendOtpStatus === 'loading'}>
            {sendOtpStatus === 'loading' ? 'Sending...' : 'Send OTP'}
          </button>
          {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default MultiAccountLogin;