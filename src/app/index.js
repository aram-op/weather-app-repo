let unit = "metric";

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("unit-change-btn")?.addEventListener('click', () => {
        if (unit === "metric") {
            unit = "imperial";
        } else {
            unit = "metric";
        }

        //Displaying the data using the changed measurement system
        displayCurrentWeatherInfo().then();
        displayForecast().then();
    });
});

async function getCurrentWeather() {
    const url = "https://api.openweathermap.org/data/2.5/weather?lat=40.178&lon=44.5152&appid=f4469421a57c390e7f71f9131b1444fd&units=" + unit;

    const response = await fetch(url);

    if (response.ok) {
        return await response.json();
    }

    throw new Error(`Response Status: ${response.status}`);
}

function displayErrorMessage() {
    const mainContainer = document.getElementById("main-container");

    mainContainer.innerHTML = `
        <h2 id="error-message">Error loading the weather data :(</h2>
    `;
}

async function displayCurrentWeatherInfo() {
    const currentWeather = await getCurrentWeather().catch(displayErrorMessage);
    const container = document.getElementById("current-weather-container");

    if (!container) return;

    const date = getFormattedDate(currentWeather.dt);
    let tempUnitText;
    let windUnitText;

    if (unit === "metric") {
        tempUnitText = "°C";
        windUnitText = "m/s";
    } else {
        tempUnitText = "°F";
        windUnitText = "mph";
    }

    container.innerHTML = `
        <img
         id="current-weather-icon"
         src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" 
         alt="Current weather type icon"
         />
        <h2 id="city-name">${currentWeather.name}</h2>
        <p id="date">${date}</p>
        <p id="weather-description">${currentWeather.weather[0].description}</p>

        <h1 id="current-temperature">${Math.round(currentWeather.main.temp)}</h1>

        <p id="measurement-unit">${tempUnitText}</p>
        <p id="humidity">Humidity: ${Math.round(currentWeather.main.humidity)}%</p>
        <p id="wind">Wind: ${Math.round(currentWeather.wind.speed)} ${windUnitText}</p>
    `;
}

async function getForecast() {
    const url = "https://api.openweathermap.org/data/2.5/forecast?lat=40.1872&lon=44.5152&appid=f4469421a57c390e7f71f9131b1444fd&units=" + unit;

    const response = await fetch(url);

    if (response.ok) {
        return await response.json();
    }

    throw new Error(`Response Status: ${response.status}`);
}

async function displayForecast() {
    const forecast = await getForecast().catch(displayErrorMessage);

    const data = formatForecastData(forecast.list);
    const forecastContainer = document.getElementById("forecast-container");

    if (!forecastContainer) return;

    forecastContainer.innerHTML = '';

    for (let item of data) {
        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <p class="forecast-day">${item.day}</p>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.iconId}d@2x.png"/>
                <div class="temp-container">
                    <span class="max-temp">${item.max}</span>
                    <span class="min-temp">${item.min}</span>
                </div>
            </div>
        `
    }
}

function formatForecastData(list) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let forecastData = [];

    for (let i = 0; i < 4; i++) {
        let listIndex = 4 + 8 * i;
        let iconIds = [];
        let maxTemp = Math.round(list[listIndex].main.temp_max);
        let minTemp = Math.round(list[listIndex].main.temp_max);

        /**
         * The api returns forecast list for 40 hours.
         * The first 4 hours are from current day, thus the first 4 items in the list are skipped.
         * The last 4 hours are from the fifth day. They are skipped, because it represents only half of the day.
         */
        for (let j = listIndex + 1; j < listIndex + 8; j++) {
            const maxTempForHour = Math.round(list[j].main.temp_max);
            const minTempForHour = Math.round(list[j].main.temp_min);

            if (maxTempForHour > maxTemp) {
                maxTemp = maxTempForHour;
            }
            if (minTempForHour < minTemp) {
                minTemp = minTempForHour;
            }
            //IconId will be only the numeric part of the icon code.
            iconIds.push(list[j].weather[0].icon.slice(0, 2));
        }

        if (minTemp === -0) minTemp = 0;
        if (maxTemp === -0) maxTemp = 0;

        const day = days[new Date(list[listIndex].dt * 1000).getDay()];

        //Getting the worst case scenario icon id from the list.
        const iconId = Math.max(...iconIds) < 10 ? '0' + Math.max(...iconIds) : Math.max(...iconIds).toString();

        forecastData.push({min: minTemp, max: maxTemp, iconId: iconId, day: day});
    }
    return forecastData;
}

function getFormattedDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const time = date.toLocaleTimeString([], {hour12: false, hour: "2-digit", minute: "2-digit"});
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${time}, ${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`
}

displayCurrentWeatherInfo().then();
displayForecast().then();