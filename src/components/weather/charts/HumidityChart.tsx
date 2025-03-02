import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

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

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.2);

    // Create line generator for trend line
    const line = d3
      .line<HumidityDataPoint>()
      .x((d) => (x(d.hour) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Add trend line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Add trend indicators between points
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      const isIncreasing = next.value > current.value;
      const isDecreasing = next.value < current.value;
      
      // Skip if values are the same
      if (next.value === current.value) continue;
      
      // Calculate positions
      const x1 = (x(current.hour) || 0) + x.bandwidth() / 2;
      const y1 = y(current.value);
      const x2 = (x(next.hour) || 0) + x.bandwidth() / 2;
      const y2 = y(next.value);
      
      // Add connecting line with appropriate color
      svg
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", isIncreasing ? "#10b981" : "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3")
        .attr("stroke-opacity", 0.7);
      
      // Add arrow indicator in the middle
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      svg
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(60))
        .attr("transform", `translate(${midX}, ${midY}) rotate(${isIncreasing ? -30 : 30})`)
        .attr("fill", isIncreasing ? "#10b981" : "#ef4444");
    }

    // Add bars with gradient
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

    // Add trend indicators on top of bars
    barGroups
      .append("g")
      .attr("transform", (d, i) => {
        if (i === 0) return ""; // Skip first bar
        const prev = data[i - 1];
        const isIncreasing = d.value > prev.value;
        const isDecreasing = d.value < prev.value;
        if (d.value === prev.value) return ""; // Skip if no change
        
        return `translate(${(x(d.hour) || 0) + x.bandwidth() / 2}, ${y(d.value) - 15})`;
      })
      .append("path")
      .attr("d", (d, i) => {
        if (i === 0) return ""; // Skip first bar
        const prev = data[i - 1];
        const isIncreasing = d.value > prev.value;
        const isDecreasing = d.value < prev.value;
        if (d.value === prev.value) return ""; // Skip if no change
        
        return d3.symbol().type(d3.symbolTriangle).size(60)();
      })
      .attr("transform", (d, i) => {
        if (i === 0) return ""; // Skip first bar
        const prev = data[i - 1];
        const isIncreasing = d.value > prev.value;
        return isIncreasing ? "rotate(180)" : "rotate(0)";
      })
      .attr("fill", (d, i) => {
        if (i === 0) return "none"; // Skip first bar
        const prev = data[i - 1];
        const isIncreasing = d.value > prev.value;
        const isDecreasing = d.value < prev.value;
        if (d.value === prev.value) return "none"; // Skip if no change
        
        return isIncreasing ? "#10b981" : "#ef4444";
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
                    {data.findIndex(d => d.hour === hoveredData.hour) > 0 && (
                      <div className="flex items-center mt-1">
                        <span className="mr-1">Trend:</span>
                        {(() => {
                          const index = data.findIndex(d => d.hour === hoveredData.hour);
                          if (index <= 0) return null;
                          const prev = data[index - 1];
                          const diff = hoveredData.value - prev.value;
                          if (diff > 0) {
                            return (
                              <span className="flex items-center text-green-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{diff}%
                              </span>
                            );
                          } else if (diff < 0) {
                            return (
                              <span className="flex items-center text-red-500">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                {diff}%
                              </span>
                            );
                          } else {
                            return <span>No change</span>;
                          }
                        })()}
                      </div>
                    )}
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
