let unit = "metric";

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("measurement-unit")?.addEventListener('click', () => {
        if (unit === "metric") {
            unit = "imperal";
        } else {
            unit = "metric";
        }
        displayCurrentWeatherInfo().then();
        displayForecast().then();
    });
});

async function getCurrentWeather() {
    const url = "https://api.openweathermap.org/data/2.5/weather?lat=40.1872&lon=44.5152&appid=f4469421a57c390e7f71f9131b1444fd&units=" + unit;
    let result;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        result = await response.json();
    } catch (error) {
        console.error(error.message);
    }

    return result;
}

async function displayCurrentWeatherInfo() {
    const currentWeather = await getCurrentWeather();

    if (!currentWeather) return;

    const date = getFormattedDate(currentWeather.dt);

    displayCurrentWeatherLogo(currentWeather.weather[0].icon, false);
    displayMainWeatherInfo(currentWeather.name, date, currentWeather.weather[0].description);
    displayCurrentTemp(currentWeather.main.temp);
    displaySecondaryWeatherInfo(currentWeather.main.humidity, currentWeather.wind.speed);
}

async function getForecast() {
    const url = "https://api.openweathermap.org/data/2.5/forecast?lat=40.1872&lon=44.5152&appid=f4469421a57c390e7f71f9131b1444fd&units=" + unit;
    let result;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`);
        }

        result = await response.json();
    } catch (error) {
        console.error(error.message);
    }

    console.log(result)
    return result;
}

async function displayForecast() {
    const forecast = await getForecast();

    const data = formatForecastData(forecast.list);
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = '';

    for(let item of data) {
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

        for (let j = listIndex + 1; j < listIndex + 8; j++) {
            const maxTempForHour = Math.round(list[j].main.temp_max);
            const minTempForHour = Math.round(list[j].main.temp_min);

            if (maxTempForHour > maxTemp) {
                maxTemp = maxTempForHour;
            }
            if (minTempForHour < minTemp) {
                minTemp = minTempForHour;
            }
            iconIds.push(list[j].weather[0].icon.slice(0, 2));
        }

        if (minTemp === -0) minTemp = 0;
        if (maxTemp === -0) maxTemp = 0;

        const day = days[new Date(list[listIndex].dt * 1000).getDay()];
        const iconId = Math.max(...iconIds) < 10 ? '0' + Math.max(...iconIds) : Math.max(...iconIds).toString();

        forecastData.push({min: minTemp, max: maxTemp, iconId: iconId, day: day});
    }
    return forecastData;
}

function displayCurrentWeatherLogo(weatherIconId) {
    const iconElem = document.getElementById("current-weather-icon");

    iconElem.src = `https://openweathermap.org/img/wn/${weatherIconId}@2x.png`
}

function displayMainWeatherInfo(cityName, date, description) {
    const cityNameElem = document.getElementById("city-name");
    const dateElem = document.getElementById("date");
    const descriptionElem = document.getElementById("weather-description");

    cityNameElem.textContent = cityName;
    dateElem.textContent = date;
    descriptionElem.textContent = description;
}

function displayCurrentTemp(temp) {
    const tempElem = document.getElementById("current-temperature");

    tempElem.textContent = `${Math.round(temp)}`;
}

function displaySecondaryWeatherInfo(humidity, windSpeed) {
    const unitElem = document.getElementById("measurement-unit");
    const humidityElem = document.getElementById("humidity");
    const windElem = document.getElementById("wind");
    let windContent = `Wind: ${Math.round(windSpeed)} `;


    if (unit === "metric") {
        unitElem.textContent = "°C";
        windContent += "m/s";
    } else {
        unitElem.textContent = "°F";
        windContent += "mph";
    }

    humidityElem.textContent = `Humidity: ${Math.round(humidity)} %`;
    windElem.textContent = windContent;
}

function getFormattedDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${date.getHours()}:${date.getMinutes()}, ${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`
}

displayCurrentWeatherInfo().then();
displayForecast().then();