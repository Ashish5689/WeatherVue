import React, { useState, useEffect } from "react";
import SearchBar from "./weather/SearchBar";
import WeatherCard from "./weather/WeatherCard";
import LoadingState from "./weather/LoadingState";
import ErrorState from "./weather/ErrorState";
import ForecastCharts from "./weather/ForecastCharts";
import { motion } from "framer-motion";
import { CloudSun, MapPin, Info, BarChart } from "lucide-react";
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
  forecast?: {
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

  // Fetch weather data from API
  const fetchWeatherData = async (location: string): Promise<WeatherData> => {
    try {
      // Fetch current weather and forecast data in parallel
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetchWeather(location),
        fetchForecast(location),
      ]);

      // Process hourly forecast data for charts
      // Only use the next 24 hours of forecast data (or less if not available)
      const hourlyData = forecastResponse.forecast.forecastday[0].hour;
      
      // Start from the current hour or the first available hour
      const currentHour = new Date().getHours();
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Find today's forecasts starting from current hour
      const forecastData = hourlyData
        .filter(hourData => {
          const hourDate = new Date(hourData.time);
          const dataDate = hourDate.toISOString().split('T')[0];
          const dataHour = hourDate.getHours();
          
          // Keep data from current date and hour onwards
          return (dataDate === currentDate && dataHour >= currentHour) || 
                 (dataDate > currentDate);
        })
        .slice(0, 24) // Limit to 24 hours
        .map(hourData => ({
          time: hourData.time,
          temperature: hourData.temp_c,
          humidity: hourData.humidity
        }));

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
        forecast: forecastData, // Include forecast data for charts
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <CloudSun className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WeatherVue
            </h1>
          </div>
          <p className="text-slate-500 text-center max-w-lg">
            Explore real-time weather information and forecasts with beautiful visualizations
          </p>
        </motion.div>

        <SearchBar
          onSearch={handleSearch}
          searchHistory={searchHistory}
          isLoading={isLoading}
        />

        {isLoading ? (
          <LoadingState message="Fetching weather data..." />
        ) : error ? (
          <ErrorState 
            message={error} 
            onRetry={() => handleSearch(searchInput || (searchHistory.length > 0 ? searchHistory[0].location : ""))} 
          />
        ) : weatherData ? (
          <motion.div 
            className="space-y-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-blue-600 text-sm border border-blue-100">
                <MapPin className="h-3.5 w-3.5" />
                <span>Currently viewing weather for <strong>{weatherData.cityName}</strong></span>
              </div>
            </div>
            
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

            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-slate-700">Forecast Charts</h2>
                </div>
                <ForecastCharts forecast={weatherData.forecast} />
              </motion.div>
            )}
            
            <motion.div
              className="w-full rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 p-4 text-center text-sm text-slate-600 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Info className="h-4 w-4 text-blue-500" />
              <p>Weather data is updated every 3 hours. Last updated: {new Date().toLocaleTimeString()}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-center"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <CloudSun className="h-16 w-16 text-blue-300" />
              <p className="text-slate-600 max-w-md">
                Enter a location above to see detailed weather information and forecasts
              </p>
            </div>
          </motion.div>
        )}
        
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-16 text-center text-sm text-slate-500"
        >
          <p>© {new Date().getFullYear()} WeatherVue • Beautiful Weather Forecasts</p>
          <p className="mt-1">Powered by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Open-Meteo</a></p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Home;
