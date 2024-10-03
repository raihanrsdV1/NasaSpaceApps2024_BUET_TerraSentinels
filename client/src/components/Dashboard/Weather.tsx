import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import tempertureIcon from './icons/thermometer.png';
import windIcon from './icons/wind_icon.png';
import waterIcon from './icons/water_icon.png';
import pptIcon from './icons/ppt_icon.png'
import './Weather.css'; // Importing the separated CSS file

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
        `weather-summary/${latitude}/${longitude}/`
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
    <div className="weather-block">
      <div className="weather-info">
        <div className="weather-header">Today's Weather
          <div className="remark">
            {remark}
          </div>
        </div>


        {/* Temperature */}
        <div className="weather-element">
          <span className="temperature">{temperature}°C</span>
        </div>

        {/* Feels Like */}
        <div className="weather-element">
          <img src={tempertureIcon} alt="Feels Like Icon" className="icon" />
          <span className="feels-like">Feels like: {feelsLike}°C</span>
        </div>

        {/* Wind */}
        <div className="weather-element">
          <img src={windIcon} alt="Wind Icon" className="icon" />
          <span className="wind-speed">Wind: {windSpeed} km/h</span>
        </div>

        {/* Humidity */}
        <div className="weather-element">
          <img src={waterIcon} alt="Humidity Icon" className="icon" />
          <span className="humidity">Humidity: {humidity}%</span>
        </div>

        {/* See More Button */}
        <div className="see-more-container">
          <button className="see-more-button" onClick={handleModalToggle}>
            See More
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <center>Weather Details</center>
            <p>Temperature: {temperature}°C</p>
            <p>Feels Like: {feelsLike}°C</p>
            <p>Max Temperature: {tempMax}°C</p>
            <p>Min Temperature: {tempMin}°C</p>
            <p>Humidity: {humidity}%</p>
            <p>Wind Speed: {windSpeed} km/h</p>
            <p>Pressure: {pressure} hPa</p>
            <p>Remark: {remark}</p>
            <button className="close-button" onClick={handleModalToggle}>Close</button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && <div className="modal-overlay" onClick={handleModalToggle}></div>}
    </div>
  );

};

export default Weather;
