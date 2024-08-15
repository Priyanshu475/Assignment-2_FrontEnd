import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { convertTemperature } from '../utils/convertTemperature';

const WeatherForecast = ({ name, unit }) => {
  const [forecast, setForecast] = useState([]);

  const fetchWeatherForecast = async () => {
    const API_KEY = 'f556851a92b9041eaef2fcab14203f9e';
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${name}&units=imperial&appid=${API_KEY}`
      );
      const dailyForecast = extractDailyForecast(response.data.list);
      setForecast(dailyForecast);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
    }
  };

  useEffect(() => {
    fetchWeatherForecast();
  }, [name]);

  const extractDailyForecast = (list) => {
    const dailyForecast = [];
    const currentDate = new Date();
    currentDate.setHours(15, 0, 0, 0);

    list.forEach((item) => {
      const date = new Date(item.dt_txt);
      if (date.getHours() === 15 && date.getTime() > currentDate.getTime() && dailyForecast.length < 4) {
        dailyForecast.push(item);
      }
    });

    return dailyForecast;
  };

  return (
    <div className='bottom-1'>
      {forecast.map((item, index) => (
        <div key={index}>
          <strong><p>Date: {new Date(item.dt_txt).toDateString()}</p></strong>
          <strong><p>Avg. Temperature: {convertTemperature(item.main.temp, unit).toFixed(2)}°{unit === 'fahrenheit' ? 'F' : unit === 'celsius' ? 'C' : 'K'}</p></strong>
          <strong><p>Max. Temperature: {convertTemperature(item.main.temp_max, unit).toFixed(2)}°{unit === 'fahrenheit' ? 'F' : unit === 'celsius' ? 'C' : 'K'}</p></strong>
          <strong><p>Min. Temperature: {convertTemperature(item.main.temp_min, unit).toFixed(2)}°{unit === 'fahrenheit' ? 'F' : unit === 'celsius' ? 'C' : 'K'}</p></strong>
          <strong><p>Weather: {item.weather[0].main}</p></strong>
          <strong><p>Precipitation: {item.clouds.all}%</p></strong>
        </div>
      ))}
    </div>
  );
};

export default WeatherForecast;