import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div style={{ fontSize: '64px', color: '#4CAF50' }}>✓</div>
      <h1 style={{ color: '#4CAF50' }}>Payment Successful!</h1>
      <p>Your payment has been processed successfully.</p>

      <button
        onClick={() => navigate('/insurance-client-page/main-portal/Balances')}
        style={{
          marginTop: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Go Back to Balances
      </button>
    </div>
  );
}
