// PaymentFailure.jsx
import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div style={{ fontSize: '64px', color: '#f44336' }}>✗</div>
      <h1 style={{ color: '#f44336' }}>Payment Failed</h1>
      <p>Unfortunately, your payment could not be processed.</p>
      <button 
        onClick={() => navigate('/insurance-client-page/main-portal/Balances')}
        style={{
          padding: '12px 24px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Back to Balances
      </button>
    </div>
  );
}