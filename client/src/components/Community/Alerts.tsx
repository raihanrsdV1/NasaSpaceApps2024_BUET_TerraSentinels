import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert } from '../../types/types';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get<Alert[]>('/alert/all/');
        setAlerts(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch alerts');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <p>Loading alerts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Past Alerts</h2>
      {alerts.length > 0 ? (
        <ul>
          {alerts.map(alert => (
            <li key={alert.id}>
              <h3>{alert.post.title}</h3>
              <p>{alert.post.content}</p>
              <p>Alert Type: {alert.alert_type}</p>
              <p>Location: Lat {alert.alert_location_lat}, Lon {alert.alert_location_lon}</p>
              <p>Region: {alert.alert_region}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No alerts found.</p>
      )}
    </div>
  );
};

export default Alerts;
