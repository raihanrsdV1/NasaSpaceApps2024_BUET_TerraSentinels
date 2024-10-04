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
    <div className="weather-block m-5 mt-10">
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
        <span>&nbsp;</span>
        {/* Feels Like */}
        <div className="weather-element">
          <img src={tempertureIcon} alt="Feels Like Icon" className="icon" />
          <span className="feels-like">Feels like: {feelsLike}°C</span>
        </div>
        <span>&nbsp;</span>
        {/* Wind */}
        <div className="weather-element">
          <img src={windIcon} alt="Wind Icon" className="icon" />
          <span className="wind-speed">Wind: {windSpeed} km/h</span>
        </div>
        <span>&nbsp;</span>
        {/* Humidity */}
        <div className="weather-element">
          <img src={waterIcon} alt="Humidity Icon" className="icon" />
          <span className="humidity">Humidity: {humidity}%</span>
        </div>
        <span>&nbsp;</span>
        {/* See More Button */}
        <div className="see-more-container">
          <button className="see-more-button" onClick={handleModalToggle}>
            See More
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-green-300 bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-green-400 w-full max-w-md relative">
            <div className="text-center text-2xl font-extrabold text-green-600 mb-6">
                Weather Details
            </div>
    
            <p className="text-green-800 mb-3"><strong>Temperature:</strong> {temperature}°C</p>
            <p className="text-green-800 mb-3"><strong>Feels Like:</strong> {feelsLike}°C</p>
            <p className="text-green-800 mb-3"><strong>Max Temperature:</strong> {tempMax}°C</p>
            <p className="text-green-800 mb-3"><strong>Min Temperature:</strong> {tempMin}°C</p>
            <p className="text-green-800 mb-3"><strong>Humidity:</strong> {humidity}%</p>
            <p className="text-green-800 mb-3"><strong>Wind Speed:</strong> {windSpeed} km/h</p>
            <p className="text-green-800 mb-6"><strong>Pressure:</strong> {pressure} hPa</p>
            <p className="text-green-600 font-bold mb-6"><strong>Remark:</strong> {remark}</p>
    
            <button
                className="absolute top-4 right-4 text-green-600 hover:text-green-800 font-bold text-2xl focus:outline-none"
                onClick={handleModalToggle}
            >
                &times;
            </button>
            
            <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full mt-6"
                onClick={handleModalToggle}
            >
                Close
            </button>
        </div>
    </div>
    
    
      )}

      {/* Modal Overlay */}
      {showModal && <div className="modal-overlay" onClick={handleModalToggle}></div>}
    </div>
  );

};

export default Weather;
