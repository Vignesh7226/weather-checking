const apiKey = 'fd5f7a556574085959bdd4bd3e6a9ee3'; // Replace with your own key
const fetchButton = document.getElementById('fetch-weather');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');

function isRainExpectedToday(forecastList) {
  const today = new Date().getDate();
  return forecastList.some(item => {
    const forecastDate = new Date(item.dt_txt);
    return (
      forecastDate.getDate() === today &&
      item.weather.some(w => w.main.toLowerCase().includes('rain'))
    );
  });
}

function setBackground(condition) {
  document.body.className = 'default';
  if (condition.includes("cloud")) {
    document.body.classList.add('clouds');
  } else if (condition.includes("rain")) {
    document.body.classList.add('rain');
  } else if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) {
    document.body.classList.add('fog');
  } else if (condition.includes("clear")) {
    document.body.classList.add('clear');
  } else {
    document.body.classList.add('default');
  }
}

fetchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  weatherResult.innerHTML = '';
  weatherResult.classList.remove('fade-in');
  errorMessage.textContent = '';

  if (!city) {
    errorMessage.textContent = '⚠️ Please enter a city name.';
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  weatherResult.innerHTML = '<p class="pulse">⏳ Loading forecast data...</p>';

  fetch(url)
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('❌ Invalid API key.');
        } else if (response.status === 404) {
          throw new Error('📍 City not found.');
        } else {
          throw new Error('⚠️ API error. Please try again later.');
        }
      }
      return response.json();
    })
    .then(data => {
      const now = data.list[0];
      const weatherCondition = now.weather[0].main.toLowerCase();
      const rainExpected = isRainExpectedToday(data.list);

      setBackground(weatherCondition);

      const emojiMap = {
        clear: '☀️',
        clouds: '☁️',
        rain: '🌧️',
        drizzle: '🌦️',
        thunderstorm: '⛈️',
        snow: '❄️',
        mist: '🌫️',
        haze: '🌫️',
        fog: '🌫️'
      };

      const emoji = emojiMap[weatherCondition] || '🌈';

      const weatherHtml = `
        <h2>${emoji} Weather in ${data.city.name}, India</h2>
        <p><strong>🌡️ Temperature:</strong> ${now.main.temp} °C</p>
        <p><strong>🌤️ Condition:</strong> ${now.weather[0].main} - ${now.weather[0].description}</p>
        <p><strong>💧 Humidity:</strong> ${now.main.humidity}%</p>
        <p><strong>💨 Wind Speed:</strong> ${now.wind.speed} m/s</p>
        <p><strong>📅 Rain Forecast:</strong> ${rainExpected ? '🌧️ Rain is expected later today.' : '☀️ No rain expected today.'}</p>
      `;

      weatherResult.innerHTML = weatherHtml;
      void weatherResult.offsetWidth;
      weatherResult.classList.add('fade-in');

      // Vibration on touch
      weatherResult.addEventListener('click', () => {
        weatherResult.classList.add('vibrate');
        setTimeout(() => weatherResult.classList.remove('vibrate'), 300);
      });
    })
    .catch(error => {
      weatherResult.innerHTML = '';
      document.body.className = 'default';
      errorMessage.textContent = error.message;
    });
});
