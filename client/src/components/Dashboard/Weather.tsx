import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import tempertureIcon from './icons/thermometer.png';
import windIcon from './icons/wind_icon.png';
import waterIcon from './icons/water_icon.png';
import pptIcon from './icons/ppt_icon.png'
import { set } from 'react-datepicker/dist/date_utils';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [latitude, setLatitude] = useState<number>(23.2);
  const [longitude, setLongitude] = useState<number>(-88.5);

  const [temperature, setTemperature] = useState<number>(0);
  const [feelsLike, setFeelsLike] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(0);
  const [pressure, setPressure] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");
  const [tempMax, setTempMax] = useState<number>(0);
  const [tempMin, setTempMin] = useState<number>(0);
  

  const [showModal, setShowModal] = useState<boolean>(false);

  const getWeatherData = async () => {
    try {
      const response = await axios.get(
        `weather-forecast/${latitude}/${longitude}/`
      );
      setWeatherData(response.data);
      if (response.data) {
        setTemperature(response.data.temperature);
        setFeelsLike(response.data.feels_like);
        setTempMax(response.data.temp_max);
        setTempMin(response.data.temp_min);
        setHumidity(response.data.humidity);
        setWindSpeed(response.data.wind_speed);
        
        setPressure(response.data.pressure);
        setRemark(response.data.remark);
      }
    } catch (error) {
      console.error(`Error fetching data:`, error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, [latitude, longitude]);

  const handleModalToggle = () => {
    setShowModal(!showModal); 
  };


  if (!weatherData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="weather-block" style={{ 
      backgroundColor: '#f9f9f9', 
      padding: '20px', 
      borderRadius: '10px', 
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
      maxWidth: '300px', 
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      position: 'relative'
    }}>
      <div className="weather-header" style={{
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '10px', 
        textAlign: 'center'
      }}>Weather</div>
      
      <div className="weather-info" style={{ fontSize: '16px', textAlign: 'center' }}>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '40px', fontWeight: 'bold' }}>{temperature}°C</span>
        </div>
  

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <img src={tempertureIcon} alt="Feels Like Icon" style={{ width: '24px', marginRight: '8px' }} />
          <span>Feels like: {feelsLike} °C</span>
        </div>
  

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <img src={windIcon} alt="Wind Icon" style={{ width: '24px', marginRight: '8px' }} />
          <span>Wind: {windSpeed} km/h</span>
        </div>
  

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <img src={waterIcon} alt="Humidity Icon" style={{ width: '24px', marginRight: '8px' }} />
          <span>Humidity: {humidity}%</span>
        </div>
  
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <img src={pptIcon} alt="Precipitation Icon" style={{ width: '24px', marginRight: '8px' }} />
          <span>Precipitation: 10mm</span>
        </div>
  

        <div style={{ marginTop: '10px', fontWeight: '500' }}>
          Remark: {remark}
        </div>
        <div style={{ textAlign: 'right' }}>
        <button onClick={handleModalToggle} style={{
          marginTop: '15px', 
          padding: '8px 16px', 
          backgroundColor: '#28a745', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          See More
        </button></div>
      </div>

      {showModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}><center>Weather Details</center></div>
          <p>Temperature: {temperature}°C</p>
          <p>Feels Like: {feelsLike}°C</p>
          <p>Max Temperature: {tempMax}°C</p>
          <p>Min Temperature: {tempMin}°C</p>
          <p>Humidity: {humidity}%</p>
          <p>Wind Speed: {windSpeed} km/h</p>
          <p>Pressure: {pressure} hPa</p>
          <p>Remark: {remark}</p>
          <div style={{ textAlign: 'right' }}>
          <button onClick={handleModalToggle} style={{
            marginTop: '15px', 
            padding: '8px 16px', 
            backgroundColor: '#FF0000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Close
          </button></div>
        </div>
      )}

      {showModal && <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999
      }} onClick={handleModalToggle}></div>}
    </div>
  );

  
};

export default Weather;
