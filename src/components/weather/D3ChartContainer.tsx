import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemperatureChart from "./charts/TemperatureChart";
import HumidityChart from "./charts/HumidityChart";

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

  return (
    <Card className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>

        <Tabs
          defaultValue="temperature"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto bg-slate-100/20">
            <TabsTrigger
              value="temperature"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Temperature
            </TabsTrigger>
            <TabsTrigger
              value="humidity"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Humidity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-4">
            <div className="h-[400px]">
              <TemperatureChart data={temperatureData} unit={temperatureUnit} />
            </div>
          </TabsContent>

          <TabsContent value="humidity" className="mt-4">
            <div className="h-[400px]">
              <HumidityChart data={humidityData} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-slate-400 text-center">
          <p>Hover over data points to see detailed values</p>
        </div>
      </div>
    </Card>
  );
};

export default D3ChartContainer;
