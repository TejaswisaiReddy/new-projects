const apiKey = "YOUR_OPENWEATHER_API_KEY";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

const searchForm = document.querySelector("#search-form");
const searchBox = document.querySelector("#city-input");
const weatherSection = document.querySelector(".weather");
const errorMessage = document.querySelector(".error");
const weatherIcon = document.querySelector(".weather-icon");

const iconFiles = {
    Clouds: "clouds",
    Clear: "clear",
    Rain: "rain",
    Drizzle: "drizzle",
    Mist: "mist",
    Smoke: "mist",
    Haze: "mist",
    Dust: "mist",
    Fog: "mist",
    Sand: "mist",
    Ash: "mist",
    Squall: "rain",
    Tornado: "wind",
    Snow: "snow"
};

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    weatherSection.hidden = true;
}

async function checkWeather(city) {
    const query = city.trim();
    if (!query) {
        showError("Enter a city name to search.");
        return;
    }

    if (apiKey === "YOUR_OPENWEATHER_API_KEY") {
        showError("Add your OpenWeather API key to script.js before searching.");
        return;
    }

    const url = new URL(apiUrl);
    url.search = new URLSearchParams({
        q: query,
        units: "metric",
        appid: apiKey
    });

    try {
        const response = await fetch(url);
        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("The weather service returned an invalid response.");
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("The API key is invalid or not active yet. Check your key and try again.");
            }
            if (response.status === 404) {
                throw new Error("City not found. Check the spelling and try again.");
            }
            throw new Error(data.message || `Weather service error (${response.status}).`);
        }

        if (
            typeof data.name !== "string" ||
            typeof data.main?.temp !== "number" ||
            typeof data.main?.humidity !== "number" ||
            typeof data.wind?.speed !== "number" ||
            !Array.isArray(data.weather) ||
            typeof data.weather[0]?.main !== "string"
        ) {
            throw new Error("The weather service returned incomplete weather data.");
        }

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = `${Math.round(data.main.temp)}\u00b0C`;
        document.querySelector(".humidity").textContent = `${data.main.humidity}%`;
        document.querySelector(".wind").textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

        const conditions = data.weather[0].main;
        weatherIcon.src = `images/${iconFiles[conditions] || "clouds"}.png`;
        weatherIcon.alt = conditions;

        errorMessage.hidden = true;
        weatherSection.hidden = false;
    } catch (error) {
        showError(error instanceof Error
            ? error.message
            : "Could not connect to the weather service. Check your internet connection.");
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    checkWeather(searchBox.value);
});
