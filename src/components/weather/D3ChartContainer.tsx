import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemperatureChart from "./charts/TemperatureChart";
import HumidityChart from "./charts/HumidityChart";
import { motion, AnimatePresence } from "framer-motion";
import { Thermometer, Droplets, Calendar, Clock, RefreshCw } from "lucide-react";

interface ForecastDataPoint {
  time: string;
  temperature: number;
  humidity: number;
}

interface D3ChartContainerProps {
  forecastData?: ForecastDataPoint[];
  temperatureUnit?: "celsius" | "fahrenheit";
  isLoading?: boolean;
}

const D3ChartContainer = ({
  forecastData = [
    { time: "00:00", temperature: 18, humidity: 65 },
    { time: "03:00", temperature: 16, humidity: 70 },
    { time: "06:00", temperature: 15, humidity: 75 },
    { time: "09:00", temperature: 19, humidity: 60 },
    { time: "12:00", temperature: 22, humidity: 55 },
    { time: "15:00", temperature: 24, humidity: 50 },
    { time: "18:00", temperature: 21, humidity: 60 },
    { time: "21:00", temperature: 19, humidity: 65 },
  ],
  temperatureUnit = "celsius",
  isLoading = false,
}: D3ChartContainerProps) => {
  const [activeTab, setActiveTab] = useState<string>("temperature");
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  // Transform data for temperature chart
  const temperatureData = forecastData.map((item) => ({
    time: item.time,
    temperature: item.temperature,
  }));

  // Transform data for humidity chart
  const humidityData = forecastData.map((item) => ({
    hour: item.time,
    value: item.humidity,
  }));

  // Get the current time for the highlighted indicator
  const currentTime = new Date().getHours() + ":00";

  // Find the closest forecast time to the current time
  const getCurrentForecast = () => {
    const currentHour = parseInt(currentTime.split(":")[0]);
    let closestItem = forecastData[0];
    let smallestDiff = 24;
    
    forecastData.forEach(item => {
      const itemHour = parseInt(item.time.split(":")[0]);
      const diff = Math.abs(itemHour - currentHour);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestItem = item;
      }
    });
    
    return closestItem;
  };

  const currentForecast = getCurrentForecast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Forecast
              <span className="ml-2 text-sm text-slate-500 font-normal">
                (Next 24 hours)
              </span>
            </h2>
            
            <motion.div 
              className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full text-blue-600 border border-blue-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Now: {currentForecast.time}
            </motion.div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-4 gap-4">
              {forecastData.slice(0, 4).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={`p-3 rounded-lg text-center transition-all duration-300 ${
                    item.time === currentTime 
                      ? "bg-blue-100 border border-blue-200" 
                      : "bg-white/70 border border-white/70 hover:bg-white"
                  }`}
                  onMouseEnter={() => setHoveredHour(item.time)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">{item.time}</p>
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <p className="text-lg font-semibold text-slate-800">
                      {temperatureUnit === "celsius" ? item.temperature : Math.round(item.temperature * 9/5 + 32)}°
                    </p>
                    <Thermometer className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex justify-center items-center gap-1 text-xs text-slate-600">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <p>{item.humidity}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Tabs
            defaultValue="temperature"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto bg-slate-100/30 p-1 rounded-xl">
              <TabsTrigger
                value="temperature"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Thermometer className="mr-2 h-4 w-4" />
                Temperature
              </TabsTrigger>
              <TabsTrigger
                value="humidity"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Droplets className="mr-2 h-4 w-4" />
                Humidity
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === "temperature" && (
                <motion.div
                  key="temperature"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="temperature" className="mt-0">
                    <div className="h-[350px] bg-gradient-to-b from-white/50 to-blue-50/30 p-4 rounded-xl border border-white/50">
                      <TemperatureChart 
                        data={temperatureData} 
                        unit={temperatureUnit} 
                        hoveredHour={hoveredHour}
                        setHoveredHour={setHoveredHour}
                      />
                    </div>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "humidity" && (
                <motion.div
                  key="humidity"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="humidity" className="mt-0">
                    <div className="h-[350px] bg-gradient-to-b from-white/50 to-blue-50/30 p-4 rounded-xl border border-white/50">
                      <HumidityChart 
                        data={humidityData}
                        hoveredHour={hoveredHour}
                        setHoveredHour={setHoveredHour}
                      />
                    </div>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 text-sm text-slate-500 text-center flex items-center justify-center">
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
              <p>Hover over the chart or forecast cards to explore data</p>
            </div>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
};

export default D3ChartContainer;
