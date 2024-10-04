import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "../../types/types";

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get<Alert[]>("/alert/all/");
        setAlerts(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch alerts");
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
      <h2 className="text-xl font-bold mb-4">Past Alerts</h2>
      {alerts.length > 0 ? (
        <ul>
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="bg-gray-100 p-4 rounded-lg shadow-md mb-4"
            >
              <h3 className="text-lg font-semibold">{alert.post.title}</h3>
              <p className="text-gray-700">{alert.post.content}</p>
              <p className="text-gray-600">Alert Type: {alert.alert_type}</p>
              <p className="text-gray-600">
                Location: Lat {alert.alert_location_lat}, Lon{" "}
                {alert.alert_location_lon}
              </p>
              <p className="text-gray-600">Region: {alert.alert_region}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No alerts found.</p>
      )}
    </div>
  );
};

export default Alerts;
