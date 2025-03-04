import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  ArrowUp, 
  ArrowDown,
  Sun,
  CloudRain,
  Snowflake,
  CloudLightning,
  RefreshCcw
} from "lucide-react";
import { motion } from "framer-motion";

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
  const [isAnimating, setIsAnimating] = useState(false);

  const convertTemperature = (temp: number) => {
    if (isCelsius) return temp;
    return Math.round((temp * 9) / 5 + 32);
  };

  const handleUnitToggle = () => {
    setIsAnimating(true);
    setIsCelsius(!isCelsius);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getWeatherIcon = () => {
    const iconSize = "w-14 h-14";
    switch (weatherIcon.toLowerCase()) {
      case "clear":
        return <Sun className={`${iconSize} text-yellow-400`} />;
      case "cloudy":
        return <Cloud className={`${iconSize} text-gray-400`} />;
      case "rainy":
        return <CloudRain className={`${iconSize} text-blue-400`} />;
      case "snowy":
        return <Snowflake className={`${iconSize} text-blue-200`} />;
      case "stormy":
        return <CloudLightning className={`${iconSize} text-purple-400`} />;
      default:
        return <Cloud className={`${iconSize} text-gray-400`} />;
    }
  };

  // Get appropriate background gradient based on weather/time
  const getCardBackground = () => {
    switch (weatherIcon.toLowerCase()) {
      case "clear":
        return "bg-gradient-to-r from-blue-400 via-sky-500 to-blue-600";
      case "cloudy":
        return "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600";
      case "rainy":
        return "bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700";
      case "snowy":
        return "bg-gradient-to-r from-slate-100 via-blue-100 to-slate-200";
      case "stormy":
        return "bg-gradient-to-r from-slate-700 via-purple-900 to-slate-800";
      default:
        return "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700";
    }
  };

  const getTextColor = () => {
    return weatherIcon.toLowerCase() === "snowy" ? "text-slate-800" : "text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full overflow-hidden border-0 shadow-xl rounded-xl">
        <CardHeader className={`${getCardBackground()} ${getTextColor()} pb-6`}>
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                {cityName}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 600);
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </CardTitle>
              <p className={`${getTextColor()}/80 mt-1 text-lg`}>{weatherDescription}</p>
            </motion.div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${getTextColor()}/80`}>°C</span>
              <Switch
                checked={!isCelsius}
                onCheckedChange={handleUnitToggle}
                className="bg-white/30 data-[state=checked]:bg-white/30"
              />
              <span className={`text-sm ${getTextColor()}/80`}>°F</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`p-6 bg-gradient-to-b from-white to-slate-50`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div 
              className="flex items-center gap-4"
              animate={{ 
                scale: isAnimating ? [1, 1.05, 1] : 1,
                opacity: isAnimating ? [1, 0.8, 1] : 1 
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {getWeatherIcon()}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: isAnimating ? 360 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
              <div>
                <motion.div 
                  className="text-5xl font-bold text-slate-800"
                  animate={{ 
                    scale: isAnimating ? [1, 1.1, 1] : 1,
                    y: isAnimating ? [0, -10, 0] : 0 
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {convertTemperature(temperature)}°{isCelsius ? "C" : "F"}
                </motion.div>
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
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
              <motion.div 
                className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl shadow-sm border border-orange-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Thermometer className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Feels Like</p>
                  <p className="font-medium text-slate-700">
                    {convertTemperature(feelsLike)}°{isCelsius ? "C" : "F"}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Droplets className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="font-medium text-slate-700">{humidity}%</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center gap-3 bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl shadow-sm border border-teal-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Wind className="h-6 w-6 text-teal-500" />
                <div>
                  <p className="text-sm text-gray-500">Wind Speed</p>
                  <p className="font-medium text-slate-700">{windSpeed} km/h</p>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherCard;
