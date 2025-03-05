// Using Open-Meteo API for weather data
// No API key required for non-commercial use
const BASE_URL = "https://api.open-meteo.com/v1";
const GEO_BASE_URL = "https://geocoding-api.open-meteo.com/v1";

export interface WeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
  };
}

export interface ForecastResponse {
  location: {
    name: string;
  };
  forecast: {
    forecastday: [
      {
        date: string;
        day: {
          maxtemp_c: number;
          maxtemp_f: number;
          mintemp_c: number;
          mintemp_f: number;
          avgtemp_c: number;
          avgtemp_f: number;
          condition: {
            text: string;
            icon: string;
            code: number;
          };
        };
        hour: Array<{
          time: string;
          time_epoch: number;
          temp_c: number;
          temp_f: number;
          condition: {
            text: string;
            icon: string;
            code: number;
          };
          humidity: number;
        }>;
      },
    ];
  };
}

// Helper function to get coordinates for a location name using Open-Meteo Geocoding API
async function getCoordinates(location: string): Promise<{ latitude: number; longitude: number; name: string; country: string }> {
  const response = await fetch(
    `${GEO_BASE_URL}/search?name=${encodeURIComponent(location)}&count=1`
  );

  if (!response.ok) {
    throw new Error("Failed to geocode location");
  }

  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${location}" not found`);
  }

  const result = data.results[0];
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country || ""
  };
}

// Map WMO weather codes to weather conditions
function getWeatherCondition(code: number): { text: string; icon: string; code: number } {
  const conditions: Record<number, { text: string; icon: string }> = {
    0: { text: "Clear sky", icon: "clear" },
    1: { text: "Mainly clear", icon: "clear" },
    2: { text: "Partly cloudy", icon: "cloudy" },
    3: { text: "Overcast", icon: "cloudy" },
    45: { text: "Fog", icon: "cloudy" },
    48: { text: "Depositing rime fog", icon: "cloudy" },
    51: { text: "Light drizzle", icon: "rainy" },
    53: { text: "Moderate drizzle", icon: "rainy" },
    55: { text: "Dense drizzle", icon: "rainy" },
    56: { text: "Light freezing drizzle", icon: "rainy" },
    57: { text: "Dense freezing drizzle", icon: "rainy" },
    61: { text: "Slight rain", icon: "rainy" },
    63: { text: "Moderate rain", icon: "rainy" },
    65: { text: "Heavy rain", icon: "rainy" },
    66: { text: "Light freezing rain", icon: "rainy" },
    67: { text: "Heavy freezing rain", icon: "rainy" },
    71: { text: "Slight snow fall", icon: "snowy" },
    73: { text: "Moderate snow fall", icon: "snowy" },
    75: { text: "Heavy snow fall", icon: "snowy" },
    77: { text: "Snow grains", icon: "snowy" },
    80: { text: "Slight rain showers", icon: "rainy" },
    81: { text: "Moderate rain showers", icon: "rainy" },
    82: { text: "Violent rain showers", icon: "rainy" },
    85: { text: "Slight snow showers", icon: "snowy" },
    86: { text: "Heavy snow showers", icon: "snowy" },
    95: { text: "Thunderstorm", icon: "stormy" },
    96: { text: "Thunderstorm with slight hail", icon: "stormy" },
    99: { text: "Thunderstorm with heavy hail", icon: "stormy" },
  };

  const condition = conditions[code] || { text: "Unknown", icon: "cloudy" };
  return {
    text: condition.text,
    icon: condition.icon,
    code: code
  };
}

export async function fetchWeather(location: string): Promise<WeatherResponse> {
  try {
    // First get coordinates for the location
    const coordinates = await getCoordinates(location);
    
    // Get the local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Then fetch weather data for those coordinates
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&temperature_unit=celsius&wind_speed_unit=kmh&timezone=${encodeURIComponent(timezone)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    
    // Map Open-Meteo data to our expected format
    const weatherCondition = getWeatherCondition(data.current.weather_code);
    
    return {
      location: {
        name: coordinates.name,
        region: "",
        country: coordinates.country,
      },
      current: {
        temp_c: data.current.temperature_2m,
        temp_f: (data.current.temperature_2m * 9/5) + 32,
        condition: {
          text: weatherCondition.text,
          icon: weatherCondition.icon,
          code: data.current.weather_code,
        },
        wind_kph: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        feelslike_c: data.current.apparent_temperature,
        feelslike_f: (data.current.apparent_temperature * 9/5) + 32,
      },
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
}

export async function fetchForecast(location: string): Promise<ForecastResponse> {
  try {
    // First get coordinates for the location
    const coordinates = await getCoordinates(location);
    
    // Get the local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Then fetch forecast data for those coordinates with enhanced parameters
    // Adding hourly=temperature_2m,relative_humidity_2m,apparent_temperature with timezone
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&hourly=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature` +
      `&temperature_unit=celsius&timeformat=iso8601` +
      `&timezone=${encodeURIComponent(timezone)}&forecast_days=1`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }

    const data = await response.json();
    
    // Get the current date
    const today = new Date().toISOString().split('T')[0];
    
    // Map Open-Meteo data to our expected format
    const dailyWeatherCode = data.daily.weather_code[0];
    const weatherCondition = getWeatherCondition(dailyWeatherCode);
    
    // Create hourly forecast data
    const hourlyData = [];
    for (let i = 0; i < data.hourly.time.length; i++) {
      // Use the current hour's data as a comparison point
      const currentHour = new Date().getHours();
      const dataHour = new Date(data.hourly.time[i]).getHours();
      
      // Include all hours (we'll filter in the chart component if needed)
      hourlyData.push({
        time: data.hourly.time[i],
        time_epoch: new Date(data.hourly.time[i]).getTime() / 1000,
        temp_c: data.hourly.temperature_2m[i],
        temp_f: (data.hourly.temperature_2m[i] * 9/5) + 32,
        condition: getWeatherCondition(data.hourly.weather_code[i]),
        humidity: data.hourly.relative_humidity_2m[i]
      });
    }
    
    return {
      location: {
        name: coordinates.name,
      },
      forecast: {
        forecastday: [
          {
            date: today,
            day: {
              maxtemp_c: data.daily.temperature_2m_max[0],
              maxtemp_f: (data.daily.temperature_2m_max[0] * 9/5) + 32,
              mintemp_c: data.daily.temperature_2m_min[0],
              mintemp_f: (data.daily.temperature_2m_min[0] * 9/5) + 32,
              avgtemp_c: (data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2,
              avgtemp_f: ((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2 * 9/5) + 32,
              condition: weatherCondition,
            },
            hour: hourlyData,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}

export function mapWeatherIconToType(iconUrl: string): string {
  // With Open-Meteo, we're already returning the icon type directly
  // If we have a string that appears to be an icon name, return it
  if (typeof iconUrl === 'string') {
    const iconTypes = ['clear', 'cloudy', 'rainy', 'snowy', 'stormy'];
    if (iconTypes.includes(iconUrl)) {
      return iconUrl;
    }
  }
  
  // Default fallback
  return "cloudy";
}
