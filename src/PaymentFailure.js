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
          marginTop: '20px',
          backgroundColor: '#f44336',
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
