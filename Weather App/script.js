const apiKey = "9714754a807fba1c9a40b5eb1e9d8f8f";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

document.addEventListener("DOMContentLoaded", function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherDataByLocation(latitude, longitude);
      fetchForecastDataByLocation(latitude, longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});


document.getElementById("search-button").addEventListener("click", () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    fetchWeatherData(city);
    fetchForecastData(city);
    isFahrenheit = false;
  }
});

document.getElementById("location-button").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherDataByLocation(latitude, longitude);
      fetchForecastDataByLocation(latitude, longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

let isFahrenheit = false;

document.getElementById("units-button").addEventListener("click", () => {
  isFahrenheit = !isFahrenheit;

  document.getElementById("units-button").textContent = isFahrenheit ? "°C" : "°F";

  const tempText = document.getElementById("temp").textContent;
  const tempMatch = tempText.match(/-?\d+/);

  const feelsLikeText = document.getElementById("feels-like").textContent;
  const feelsLikeMatch = feelsLikeText.match(/-?\d+/);

  let temp = parseInt(tempMatch[0], 10);
  let feelsLike = parseInt(feelsLikeMatch[0], 10);

  if (isFahrenheit) {
    temp = temp - 271;
    feelsLike = feelsLike - 271;
  } else {
    temp = temp + 271;
    feelsLike = feelsLike + 271;
  }

  document.getElementById("temp").textContent = `${temp}°${isFahrenheit ? 'F' : 'C'}`;
  document.getElementById("feels-like").textContent = `${feelsLike}°${isFahrenheit ? 'F' : 'C'}`;
  document.getElementById("temperature").textContent = `${temp}°${isFahrenheit ? 'F' : 'C'}`;

  for (let i = 1; i <= 5; i++) {
    const dayElement = document.getElementById(`day${i}`);

    const maxTempDiv = dayElement.querySelector("#temp-max");
    const maxTempText = maxTempDiv.textContent;
    const maxTempMatch = maxTempText.match(/-?\d+/);

    const minTempDiv = dayElement.querySelector("#temp-min");
    const minTempText = minTempDiv.textContent;
    const minTempMatch = minTempText.match(/-?\d+/);

    let displayedTemp;
    if (maxTempMatch && minTempMatch) {
      let maxTemp = parseInt(maxTempMatch[0], 10);
      let minTemp = parseInt(minTempMatch[0], 10);

      if (isFahrenheit) {
        minTemp = minTemp - 271;
        maxTemp = maxTemp - 271;
        temp = temp - 271;
        feelsLike = feelsLike - 271;
      } else {
        minTemp = minTemp + 271;
        maxTemp = maxTemp + 271;
        temp = temp + 271;
        feelsLike = feelsLike + 271;
      }

      maxTempDiv.textContent = maxTempText.replace(/-?\d+/, maxTemp);
      minTempDiv.textContent = minTempText.replace(/-?\d+/, minTemp);
    }
  }
});


async function fetchWeatherData(city) {
  const response = await fetch(`${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  updateCurrentWeather(data);
}

async function fetchForecastData(city) {
  const response = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  updateForecast(data.list);
}

async function fetchWeatherDataByLocation(lat, lon) {
  const response = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  updateCurrentWeather(data);
}

async function fetchForecastDataByLocation(lat, lon) {
  const response = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  updateForecast(data.list);
}

function updateCurrentWeather(data) {
  const getIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;
  const iconUrl = getIconUrl(data.weather[0].icon);

  document.querySelector(".weather-icon").src = iconUrl;
  document.querySelector(".temperature").textContent = `${parseInt(data.main.temp)}°C`;
  document.querySelector(".location").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temp").textContent = `${data.main.temp}°C`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
  document.getElementById("sunrise-sunset").textContent = `${new Date(data.sys.sunrise * 1000).toLocaleTimeString()} / ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
  document.getElementById("feels-like").textContent = `${data.main.feels_like}°C`;
}


function updateForecast(forecastData) {
  const getIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

  for (let i = 0; i < 5; i++) {
    const dayData = forecastData[i * 8];

    const dayElement = document.getElementById(`day${i + 1}`);
    const date = new Date(dayData.dt * 1000);
    const options = { weekday: 'short' };
    const dayName = date.toLocaleDateString('en-US', options);
    const tempMax = Math.round(dayData.main.temp_max);
    const tempMin = Math.round(dayData.main.temp_min);
    const iconUrl = getIconUrl(dayData.weather[0].icon);

    dayElement.innerHTML = `
      <div class="day-name">${dayName}</div>
      <img src="${iconUrl}" alt="${dayData.weather[0].description}" />
      <div class="temps" id="temps">
        <div class="temp-max" id="temp-max">${tempMax}°</div>
        <div class="temp-min" id="temp-min">${tempMin}°</div>
      </div>
    `;
  }
}

