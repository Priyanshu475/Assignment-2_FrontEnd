import React, { useState } from 'react';
import axios from 'axios';
import MetroCities from './components/MetroCities';
import WeatherForecast from './components/WeatherForecast';
import { convertTemperature } from './utils/convertTemperature';

const App = () => {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [tempe, setTempe] = useState(null);
  const [unit, setUnit] = useState('fahrenheit');
  const [timestamp, setTimestamp] = useState(null);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`;

  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      axios.get(url)
        .then((response) => {
          const weatherData = {
            ...response.data,
            timestamp: Date.now(),
          };
          setData(weatherData);
          setTempe(response.data.main.temp);
          setTimestamp(Date.now());
          setLocation('');

          // Prepare data for backend
          const backendData = {
            date: new Date(),
            averageTemperature: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            maxTemperature: response.data.main.temp_max,
            minTemperature: response.data.main.temp_min,
            dominantCondition: response.data.weather[0].main,
          };

          // Send data to backend
          axios.post(`${process.env.REACT_APP_API_URL}/api/weather-summary/addData`, backendData)
            .then(() => {
              console.log('Weather data sent to backend successfully');
            })
            .catch((error) => {
              console.error('Error sending weather data to backend:', error);
            });
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            window.alert('City not found. Please check the spelling and try again.');
          } else {
            window.alert('An error occurred while fetching the weather data. Please try again later.');
          }
          console.error('Error fetching weather data:', error);
        });
    }
  };

  const changeTemp = (event) => {
    setUnit(event.target.value);
    if (data.main) {
      setTempe(convertTemperature(data.main.temp, event.target.value));
    }
  };

  const displayTemp = () => {
    if (tempe === null || data.main === undefined) return null;
    let tempDisplay;
    if (unit === 'fahrenheit') {
      tempDisplay = `${tempe.toFixed(2)}°F`;
    } else if (unit === 'celsius') {
      tempDisplay = `${tempe.toFixed(2)}°C`;
    } else if (unit === 'kelvin') {
      tempDisplay = `${tempe.toFixed(2)}K`;
    }
    return <h1>{tempDisplay}</h1>;
  };

  return (
    <div className="app">
      <center><h2>Metro Cities Weather</h2></center>
      <div className="top-1">
        <MetroCities unit={unit} />
      </div>

      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={searchLocation}
          placeholder="Enter Location to get detailed info ..."
          type="text"
        />
      </div>

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp-selector">
            <select value={unit} onChange={changeTemp}>
              <option value="fahrenheit">fahrenheit</option>
              <option value="celsius">celsius</option>
              <option value="kelvin">kelvin</option>
            </select>
          </div>
          <div className="temp">{displayTemp()}</div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
          {timestamp && (
            <div className="timestamp">
              <p>Unix Time: {timestamp}</p>
            </div>
          )}
        </div>
        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">
                  {convertTemperature(data.main.feels_like, unit).toFixed(2)}°{unit === 'fahrenheit' ? 'F' : unit === 'celsius' ? 'C' : 'K'}
                </p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">
                  {(1.609 * data.wind.speed).toFixed(2)} KMPH
                </p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>

      <WeatherForecast name={data.name} unit={unit} />
    </div>
  );
};

export default App;