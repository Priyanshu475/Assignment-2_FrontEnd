import React, { useState, useEffect } from 'react';
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
  const [thresholdTemperature, setThresholdTemperature] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`;

  // Fetch threshold temperature from backend on component mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/weather-summary/thresholdTemperature`)
      .then(response => {
        if (response.data && response.data.thresholdTemperature !== undefined) {
          setThresholdTemperature(response.data.thresholdTemperature);
        }
      })
      .catch(error => {
        console.error('Error fetching threshold temperature from backend:', error);
      });
  }, []);

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

          const backendData = {
            date: new Date(),
            averageTemperature: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            maxTemperature: response.data.main.temp_max,
            minTemperature: response.data.main.temp_min,
            dominantCondition: response.data.weather[0].main,
          };

          // Send weather data to backend
          axios.post(`${process.env.REACT_APP_API_URL}/api/weather-summary/addData`, backendData)
            .then(() => {
              console.log('Weather data sent to backend successfully');
            })
            .catch((error) => {
              console.error('Error sending weather data to backend:', error);
            });
                // Display weather data first, then check and alert
        if (thresholdTemperature !== null && response.data.main.temp > thresholdTemperature) {
          setTimeout(() => {
            window.alert('Weather is bad!');
          }, 0); // Alert is shown after data is displayed
        }
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

  const handleThresholdChange = () => {
    const threshold = parseFloat(newThreshold);
    if (isNaN(threshold)) {
      return window.alert('Please enter a valid number for the threshold temperature.');
    }

    axios.post(`${process.env.REACT_APP_API_URL}/api/weather-summary/setThresholdTemperature`, { thresholdTemperature: threshold })
      .then(() => {
        setThresholdTemperature(threshold);
        setNewThreshold('');
        console.log('Threshold temperature updated successfully');
      })
      .catch(error => {
        console.error('Error updating threshold temperature:', error);
      });
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

      <div className="threshold" style={{ textAlign: 'center', marginTop: '20px' }}>
        {thresholdTemperature !== null ? (
          <div>
            <p>Threshold Temperature: {thresholdTemperature}°F</p>
            <input
              type="number"
              value={newThreshold}
              onChange={(event) => setNewThreshold(event.target.value)}
              placeholder="Set Threshold Temperature"
              style={{ textAlign: 'center', marginRight: '10px' }}
            />
            <button onClick={handleThresholdChange}>
              Set Threshold
            </button>
          </div>
        ) : (
          <div>
            <input
              type="number"
              value={newThreshold}
              onChange={(event) => setNewThreshold(event.target.value)}
              placeholder="Set Threshold Temperature"
              style={{ textAlign: 'center' }}
            />
            <button onClick={handleThresholdChange} style={{ marginLeft: '10px' }}>
              Set Threshold
            </button>
          </div>
        )}
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
        {data.name && (
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