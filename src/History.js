import "./styles/History-styles.css";
export default function History() {

  const historyData = [
    {
      date: "July 08, 2025",
      paymentMethod: "Bank",
      amount: "Php 10,000",
      company: "Cocogen",
      clientRegistered: "2025-01-01",
    },
  ];
 
  return (
     <div className="history-container">
      <h2>History</h2>

      <div className="search-container">
        <input type="text" placeholder="Search" />
      </div>

      <div className="history-grid header">
        <div>Date</div>
        <div>Payment Method</div>
        <div>Amount</div>
        <div>Company</div>
        <div>Client Registered</div>
      </div>

      {historyData.map((row, index) => (
        <div className="history-grid" key={index}>
          <div>{row.date}</div>
          <div>{row.paymentMethod}</div>
          <div>{row.amount}</div>
          <div>{row.company}</div>
          <div>{row.clientRegistered}</div>
        </div>
      ))}
    </div>
  );
  }

