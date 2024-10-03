const Alerts = () => {
  return (
    <div className="alerts-block" style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      position: 'relative'
    }}>
      <div className="alerts-header">Alerts</div>
      <div className="alert-status">No immediate threat</div>
    </div>
  );
};

export default Alerts;
//  yet to work on it