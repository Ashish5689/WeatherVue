import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown } from "lucide-react";

interface DataPoint {
  time: string;
  temperature: number;
}

interface TemperatureChartProps {
  data?: DataPoint[];
  unit?: "celsius" | "fahrenheit";
  hoveredHour?: string | null;
  setHoveredHour?: React.Dispatch<React.SetStateAction<string | null>>;
}

const TemperatureChart = ({
  data = [
    { time: "00:00", temperature: 18 },
    { time: "03:00", temperature: 16 },
    { time: "06:00", temperature: 15 },
    { time: "09:00", temperature: 19 },
    { time: "12:00", temperature: 22 },
    { time: "15:00", temperature: 24 },
    { time: "18:00", temperature: 21 },
    { time: "21:00", temperature: 19 },
  ],
  unit = "celsius",
  hoveredHour = null,
  setHoveredHour = () => {},
}: TemperatureChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.time))
      .range([0, width])
      .padding(0.1);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.temperature) - 2,
        d3.max(data, (d) => d.temperature) + 2,
      ])
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em");

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text(`Temperature (°${unit === "celsius" ? "C" : "F"})`);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.2);

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => (x(d.time) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.temperature))
      .curve(d3.curveMonotoneX);

    // Add the line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Add trend lines between points
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      const isIncreasing = next.temperature > current.temperature;
      const isDecreasing = next.temperature < current.temperature;
      
      // Skip if temperature is the same
      if (next.temperature === current.temperature) continue;
      
      // Add trend line
      svg
        .append("line")
        .attr("x1", (x(current.time) || 0) + x.bandwidth() / 2)
        .attr("y1", y(current.temperature))
        .attr("x2", (x(next.time) || 0) + x.bandwidth() / 2)
        .attr("y2", y(next.temperature))
        .attr("stroke", isIncreasing ? "#10b981" : "#ef4444") // Green for increase, red for decrease
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-dasharray", "5,3");
      
      // Add trend arrow in the middle of the line
      const midX = ((x(current.time) || 0) + (x(next.time) || 0) + x.bandwidth()) / 2;
      const midY = (y(current.temperature) + y(next.temperature)) / 2;
      
      // Calculate angle for arrow
      const angle = Math.atan2(
        y(next.temperature) - y(current.temperature),
        (x(next.time) || 0) - (x(current.time) || 0)
      ) * 180 / Math.PI;
      
      // Add arrow
      svg
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(80))
        .attr("transform", `translate(${midX}, ${midY}) rotate(${isIncreasing ? 90 : -90})`)
        .attr("fill", isIncreasing ? "#10b981" : "#ef4444");
    }

    // Add the points
    const points = svg
      .selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => (x(d.time) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.temperature))
      .attr("r", 5)
      .attr("fill", "#3b82f6")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7).attr("fill", "#2563eb");
        setHoveredPoint(d);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "#3b82f6");
        setHoveredPoint(null);
      });

    // Add temperature labels above points
    svg
      .selectAll(".temp-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "temp-label")
      .attr("x", (d) => (x(d.time) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.temperature) - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .text((d) => `${d.temperature}°${unit === "celsius" ? "C" : "F"}`);

    // Add area under the line
    const area = d3
      .area<DataPoint>()
      .x((d) => (x(d.time) || 0) + x.bandwidth() / 2)
      .y0(height)
      .y1((d) => y(d.temperature))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "url(#temperature-gradient)")
      .attr("d", area);

    // Add gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.7);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.1);
  }, [data, unit]);

  return (
    <Card className="w-full h-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-medium mb-4">
          24-Hour Temperature Forecast
        </h3>
        <div className="flex items-center justify-end mb-2 text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Increasing</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Decreasing</span>
          </div>
        </div>
        <div className="relative flex-grow">
          <svg ref={svgRef} className="w-full h-full" />

          {hoveredPoint && (
            <TooltipProvider>
              <Tooltip open={!!hoveredPoint}>
                <TooltipTrigger asChild>
                  <div className="absolute opacity-0">Trigger</div>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-slate-800 text-white p-2 rounded-md shadow-lg"
                  side="top"
                  style={{
                    position: "absolute",
                    left: `${svgRef.current?.getBoundingClientRect().left || 0}px`,
                    top: `${svgRef.current?.getBoundingClientRect().top || 0}px`,
                  }}
                >
                  <div className="text-sm">
                    <p className="font-medium">{hoveredPoint.time}</p>
                    <p>
                      {hoveredPoint.temperature}°
                      {unit === "celsius" ? "C" : "F"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TemperatureChart;
