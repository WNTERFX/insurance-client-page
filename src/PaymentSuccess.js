// PaymentSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Verify payment status here
    const timer = setTimeout(() => {
      navigate('/insurance-client-page/main-portal/Balances');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div style={{ fontSize: '64px', color: '#4CAF50' }}>✓</div>
      <h1 style={{ color: '#4CAF50' }}>Payment Successful!</h1>
      <p>Your payment has been processed successfully.</p>
      <p>Redirecting to balances...</p>
    </div>
  );
}
