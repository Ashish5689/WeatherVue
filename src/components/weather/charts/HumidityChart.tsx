import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HumidityDataPoint {
  hour: string;
  value: number;
}

interface HumidityChartProps {
  data?: HumidityDataPoint[];
  width?: number;
  height?: number;
}

const HumidityChart = ({
  data = [
    { hour: "00:00", value: 65 },
    { hour: "03:00", value: 70 },
    { hour: "06:00", value: 75 },
    { hour: "09:00", value: 60 },
    { hour: "12:00", value: 55 },
    { hour: "15:00", value: 50 },
    { hour: "18:00", value: 60 },
    { hour: "21:00", value: 65 },
  ],
  width = 1160,
  height = 400,
}: HumidityChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<HumidityDataPoint | null>(
    null,
  );

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.hour))
      .range([0, innerWidth])
      .padding(0.3);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em");

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y));

    // Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .text("Humidity (%)");

    // Add bars
    const barGroups = svg
      .selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g");

    // Create gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "humidity-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", innerHeight)
      .attr("x2", 0)
      .attr("y2", 0);

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#60a5fa");

    // Add bars with gradient
    barGroups
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.hour) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", "url(#humidity-gradient)")
      .attr("rx", 4)
      .attr("ry", 4)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("fill", "#3b82f6");
        setHoveredData(d);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "url(#humidity-gradient)");
        setHoveredData(null);
      });

    // Add value labels on top of bars
    barGroups
      .append("text")
      .attr("class", "value")
      .attr("x", (d) => (x(d.hour) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d) => `${d.value}%`)
      .style("font-size", "12px")
      .style("fill", "#64748b");
  }, [data, width, height]);

  return (
    <Card className="w-full h-full p-4 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-medium mb-2">24-Hour Humidity Forecast</h3>
        <div className="relative flex-grow">
          <svg ref={svgRef} className="w-full h-full" />

          {hoveredData && (
            <TooltipProvider>
              <Tooltip open={!!hoveredData}>
                <TooltipTrigger asChild>
                  <div className="absolute inset-0 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-white/90 backdrop-blur-sm border border-gray-200 p-2"
                >
                  <div className="text-sm font-medium">
                    <div>Time: {hoveredData.hour}</div>
                    <div>Humidity: {hoveredData.value}%</div>
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

export default HumidityChart;
