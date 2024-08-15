export const convertTemperature = (tempInFahrenheit, unit) => {
    if (unit === 'celsius') {
      return ((tempInFahrenheit - 32) * 5) / 9;
    } else if (unit === 'kelvin') {
      return (((tempInFahrenheit - 32) * 5) / 9) + 273.15;
    } else {
      return tempInFahrenheit;
    }
  };  