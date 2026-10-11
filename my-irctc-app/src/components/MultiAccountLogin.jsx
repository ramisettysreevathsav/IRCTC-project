import { useState, useRef } from 'react';

const MultiAccountLogin = () => {
  const [email, setEmail] = useState('');
  const [otpField, setOtpField] = useState(false);
  const [error, setError] = useState('');

  // Use a single ref array for all 6 inputs
  const inputRefs = useRef([]);

  const sendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    try {
      const response = await fetch('http://localhost:4001/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to send OTP');
      }
      setOtpField(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the server');
    }
  };

  const verifyOtp = () => {
    const otp = inputRefs.current.map((ref) => (ref ? ref.value : '')).join('');

    fetch('http://localhost:4001/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify({ otp }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    // Only allow single character
    if (value.length > 1) {
      e.target.value = value.slice(-1);
    }

    // Move to next input if there's a value and next input exists
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const currentInput = inputRefs.current[index];

      // If current input has value, just clear it
      if (currentInput && currentInput.value) {
        currentInput.value = '';
      } else if (index > 0) {
        // Move to previous input and clear it
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.value = '';
          prevInput.focus();
        }
      }

      e.preventDefault();
    }
  };

  return (
    <div className="multi-account-login">
      {otpField ? (
        <div className="otp-inputs">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
            />
          ))}

          <button onClick={() => setOtpField(false)}>Cancel</button>
          <button onClick={verifyOtp}>Submit OTP</button>
        </div>
      ) : (
        <>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <button onClick={sendOtp}>Send OTP</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default MultiAccountLogin;