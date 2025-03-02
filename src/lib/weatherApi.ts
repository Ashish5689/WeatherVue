// API key should be stored in environment variables in production
const API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY || "ccda6c6fb4be40619a6175016252302";
const BASE_URL = "https://api.weatherapi.com/v1";

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

export async function fetchWeather(location: string): Promise<WeatherResponse> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch weather data");
  }

  return response.json();
}

export async function fetchForecast(
  location: string,
): Promise<ForecastResponse> {
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&hour=24`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || "Failed to fetch forecast data",
    );
  }

  return response.json();
}

export function mapWeatherIconToType(iconUrl: string): string {
  // WeatherAPI.com uses condition codes in their icons
  // Extract the condition code from the icon URL
  // Example URL: //cdn.weatherapi.com/weather/64x64/day/116.png

  if (!iconUrl) return "cloudy";

  // Handle URLs that might start with // instead of http://
  const fullUrl = iconUrl.startsWith("//") ? `https:${iconUrl}` : iconUrl;

  try {
    const parts = fullUrl.split("/");
    const lastPart = parts[parts.length - 1] || "";
    const iconCode = lastPart.split(".")[0];

    // Map condition codes to our app's weather types
    // Simplified mapping based on condition codes
    const codeMap: Record<string, string> = {
      // Clear/Sunny
      "113": "clear",

      // Partly cloudy
      "116": "cloudy",
      "119": "cloudy",

      // Cloudy/Overcast
      "122": "cloudy",
      "143": "cloudy",
      "248": "cloudy",
      "260": "cloudy",

      // Mist/Fog
      "143": "cloudy",
      "248": "cloudy",
      "260": "cloudy",

      // Rain
      "176": "rainy",
      "185": "rainy",
      "182": "rainy",
      "263": "rainy",
      "266": "rainy",
      "281": "rainy",
      "284": "rainy",
      "293": "rainy",
      "296": "rainy",
      "299": "rainy",
      "302": "rainy",
      "305": "rainy",
      "308": "rainy",
      "311": "rainy",
      "314": "rainy",
      "317": "rainy",
      "320": "rainy",
      "350": "rainy",
      "353": "rainy",
      "356": "rainy",
      "359": "rainy",

      // Snow
      "179": "snowy",
      "227": "snowy",
      "230": "snowy",
      "323": "snowy",
      "326": "snowy",
      "329": "snowy",
      "332": "snowy",
      "335": "snowy",
      "338": "snowy",
      "341": "snowy",
      "344": "snowy",
      "362": "snowy",
      "365": "snowy",
      "368": "snowy",
      "371": "snowy",
      "374": "snowy",
      "377": "snowy",

      // Thunderstorm
      "200": "stormy",
      "386": "stormy",
      "389": "stormy",
      "392": "stormy",
      "395": "stormy",
    };

    return iconCode && codeMap[iconCode] ? codeMap[iconCode] : "cloudy";
  } catch (error) {
    console.error("Error parsing weather icon:", error);
    return "cloudy";
  }
}
