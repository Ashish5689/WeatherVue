import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Cloud, Droplets, Thermometer, Wind, ArrowUp, ArrowDown } from "lucide-react";

interface WeatherCardProps {
  cityName?: string;
  temperature?: number;
  maxTemperature?: number;
  minTemperature?: number;
  weatherIcon?: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  weatherDescription?: string;
}

const WeatherCard = ({
  cityName = "New York",
  temperature = 22,
  maxTemperature = 25,
  minTemperature = 18,
  weatherIcon = "cloudy",
  humidity = 65,
  windSpeed = 12,
  feelsLike = 24,
  weatherDescription = "Partly Cloudy",
}: WeatherCardProps) => {
  const [isCelsius, setIsCelsius] = useState(true);

  const convertTemperature = (temp: number) => {
    if (isCelsius) return temp;
    return Math.round((temp * 9) / 5 + 32);
  };

  const getWeatherIcon = () => {
    switch (weatherIcon.toLowerCase()) {
      case "clear":
        return "☀️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      case "snowy":
        return "❄️";
      case "stormy":
        return "⛈️";
      default:
        return "☁️";
    }
  };

  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">{cityName}</CardTitle>
            <p className="text-white/80 mt-1">{weatherDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">°C</span>
            <Switch
              checked={!isCelsius}
              onCheckedChange={() => setIsCelsius(!isCelsius)}
              className="bg-white/30 data-[state=checked]:bg-white/30"
            />
            <span className="text-sm">°F</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{getWeatherIcon()}</div>
            <div>
              <div className="text-5xl font-bold">
                {convertTemperature(temperature)}°{isCelsius ? "C" : "F"}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1 text-red-500">
                  <ArrowUp className="h-4 w-4" />
                  <span>{convertTemperature(maxTemperature)}°</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <ArrowDown className="h-4 w-4" />
                  <span>{convertTemperature(minTemperature)}°</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
              <Thermometer className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-500">Feels Like</p>
                <p className="font-medium">
                  {convertTemperature(feelsLike)}°{isCelsius ? "C" : "F"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="font-medium">{humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
              <Wind className="h-5 w-5 text-teal-400" />
              <div>
                <p className="text-sm text-gray-500">Wind Speed</p>
                <p className="font-medium">{windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
