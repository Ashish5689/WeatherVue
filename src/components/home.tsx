import React, { useState, useEffect } from "react";
import SearchBar from "./weather/SearchBar";
import WeatherCard from "./weather/WeatherCard";
import D3ChartContainer from "./weather/D3ChartContainer";
import LoadingState from "./weather/LoadingState";
import ErrorState from "./weather/ErrorState";
import {
  fetchWeather,
  fetchForecast,
  mapWeatherIconToType,
} from "@/lib/weatherApi";

interface WeatherData {
  cityName: string;
  temperature: number;
  maxTemperature: number;
  minTemperature: number;
  weatherIcon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  weatherDescription: string;
  forecast: {
    time: string;
    temperature: number;
    humidity: number;
  }[];
}

interface SearchHistoryItem {
  id: string;
  location: string;
}

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([
    { id: "1", location: "New York" },
    { id: "2", location: "London" },
    { id: "3", location: "Tokyo" },
  ]);
  const [temperatureUnit, setTemperatureUnit] = useState<
    "celsius" | "fahrenheit"
  >("celsius");

  // Fetch weather data from API
  const fetchWeatherData = async (location: string): Promise<WeatherData> => {
    try {
      // Fetch current weather and forecast data in parallel
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetchWeather(location),
        fetchForecast(location),
      ]);

      // Process forecast data to get 24-hour forecast (8 points, every 3 hours)
      // Safely access forecast data
      const forecastHours =
        forecastResponse.forecast?.forecastday?.[0]?.hour || [];

      // Create 8 forecast points with 3-hour intervals
      const forecastData = [];

      if (forecastHours.length > 0) {
        const currentHour = new Date().getHours();

        // Get 8 forecast points starting from current hour, with 3-hour intervals
        for (let i = 0; i < 24 && forecastData.length < 8; i += 3) {
          const hourIndex = (currentHour + i) % 24;
          const item = forecastHours[hourIndex];

          if (item && item.time) {
            // Format time (e.g., "2023-04-04 13:00" to "13:00")
            const timeParts = item.time.split(" ");
            const timeString =
              timeParts.length > 1
                ? timeParts[1].substring(0, 5)
                : `${hourIndex}:00`;

            forecastData.push({
              time: timeString,
              temperature: Math.round(item.temp_c),
              humidity: item.humidity,
            });
          }
        }
      }

      // If we couldn't get forecast data, create dummy data
      if (forecastData.length === 0) {
        for (let i = 0; i < 8; i++) {
          const hour = (new Date().getHours() + i * 3) % 24;
          forecastData.push({
            time: `${hour.toString().padStart(2, "0")}:00`,
            temperature: Math.round(weatherResponse.current.temp_c),
            humidity: weatherResponse.current.humidity,
          });
        }
      }

      // Map the data to our application's format
      return {
        cityName: weatherResponse.location.name,
        temperature: Math.round(weatherResponse.current.temp_c),
        maxTemperature: forecastResponse.forecast?.forecastday?.[0]?.day?.maxtemp_c 
          ? Math.round(forecastResponse.forecast.forecastday[0].day.maxtemp_c) 
          : Math.round(weatherResponse.current.temp_c),
        minTemperature: forecastResponse.forecast?.forecastday?.[0]?.day?.mintemp_c 
          ? Math.round(forecastResponse.forecast.forecastday[0].day.mintemp_c) 
          : Math.round(weatherResponse.current.temp_c),
        weatherIcon: mapWeatherIconToType(
          weatherResponse.current.condition.icon,
        ),
        humidity: weatherResponse.current.humidity,
        windSpeed: Math.round(weatherResponse.current.wind_kph),
        feelsLike: Math.round(weatherResponse.current.feelslike_c),
        weatherDescription: weatherResponse.current.condition.text,
        forecast: forecastData,
      };
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = async (location: string) => {
    setSearchInput(location);
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);

      // Update search history
      const existingIndex = searchHistory.findIndex(
        (item) => item.location.toLowerCase() === location.toLowerCase(),
      );

      if (existingIndex !== -1) {
        // Move existing location to the front
        const updatedHistory = [...searchHistory];
        const [item] = updatedHistory.splice(existingIndex, 1);
        updatedHistory.unshift(item);
        setSearchHistory(updatedHistory.slice(0, 3));
      } else {
        // Add new location to the front
        const newItem = { id: Date.now().toString(), location };
        setSearchHistory([newItem, ...searchHistory].slice(0, 3));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search on first load
  useEffect(() => {
    if (searchHistory.length > 0) {
      handleSearch(searchHistory[0].location);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-8">
          Weather Dashboard
        </h1>

        <SearchBar
          onSearch={handleSearch}
          searchHistory={searchHistory}
          isLoading={isLoading}
        />

        {isLoading ? (
          <LoadingState message="Fetching weather data..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : weatherData ? (
          <div className="space-y-6 mt-8">
            <WeatherCard
              cityName={weatherData.cityName}
              temperature={weatherData.temperature}
              maxTemperature={weatherData.maxTemperature}
              minTemperature={weatherData.minTemperature}
              weatherIcon={weatherData.weatherIcon}
              humidity={weatherData.humidity}
              windSpeed={weatherData.windSpeed}
              feelsLike={weatherData.feelsLike}
              weatherDescription={weatherData.weatherDescription}
            />

            <D3ChartContainer
              forecastData={weatherData.forecast}
              temperatureUnit={temperatureUnit}
            />
          </div>
        ) : (
          <div className="mt-8 p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-center">
            <p className="text-slate-600">
              Enter a location to see weather information
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
