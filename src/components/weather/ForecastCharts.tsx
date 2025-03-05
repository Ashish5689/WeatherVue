import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define the forecast data interface
interface ForecastData {
  time: string;
  temperature: number;
  humidity: number;
}

interface ForecastChartsProps {
  forecast: ForecastData[];
  className?: string;
}

// Data point with parsed time
interface DataPoint {
  time: Date;
  value: number;
}

const ForecastCharts: React.FC<ForecastChartsProps> = ({ forecast, className = '' }) => {
  const temperatureChartRef = useRef<SVGSVGElement>(null);
  const humidityChartRef = useRef<SVGSVGElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create temperature chart using D3
  useEffect(() => {
    if (!temperatureChartRef.current || !forecast || forecast.length === 0) return;

    createTemperatureChart();
    
    // Cleanup function to remove tooltips when component unmounts
    return () => {
      d3.selectAll('.tooltip').remove();
    };
  }, [forecast, windowWidth]);

  // Create humidity chart using D3
  useEffect(() => {
    if (!humidityChartRef.current || !forecast || forecast.length === 0) return;

    createHumidityChart();
    
    // Cleanup function to remove tooltips when component unmounts
    return () => {
      d3.selectAll('.tooltip').remove();
    };
  }, [forecast, windowWidth]);

  const createTemperatureChart = () => {
    const svg = d3.select(temperatureChartRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    // Set dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 40 };
    const width = temperatureChartRef.current!.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Parse dates and format time - properly handling timezone
    const parseTime = (timeStr: string) => {
      const date = new Date(timeStr);
      // Ensure we're using local timezone
      return date;
    };
    
    const formatTime = d3.timeFormat("%H:%M");
    const formatHour = d3.timeFormat("%H:00");
    
    // Process data - filter to only show relevant hours (e.g., every 3 hours)
    // and ensure data is sorted chronologically
    const processedForecast = [...forecast]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    // Create dataset for temperature chart
    const data = processedForecast.map(d => ({
      time: parseTime(d.time),
      value: d.temperature
    }));

    // Determine min and max for better scales
    const minTemp = d3.min(data, d => d.value) || 0;
    const maxTemp = d3.max(data, d => d.value) || 30;
    const temperaturePadding = 2; // Add padding to the temperature range

    // Create scales with appropriate domains
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.time) as [Date, Date])
      .range([0, width]);
      
    const y = d3.scaleLinear()
      .domain([
        Math.floor(minTemp - temperaturePadding),
        Math.ceil(maxTemp + temperaturePadding)
      ])
      .range([height, 0]);

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add gradient background
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FF9E80")
      .attr("stop-opacity", 0.7);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF9E80")
      .attr("stop-opacity", 0.1);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .attr("opacity", 0.1);
      
    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .attr("opacity", 0.1);

    // Add area
    g.append("path")
      .datum(data)
      .attr("fill", "url(#temperature-gradient)")
      .attr("d", d3.area<DataPoint>()
        .x(d => x(d.time))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5))
      );

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FF5722")
      .attr("stroke-width", 3)
      .attr("d", d3.line<DataPoint>()
        .x(d => x(d.time))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5))
      );

    // Add dots - but filter to show fewer dots for clarity
    const dotData = data.filter((_, i) => i % 3 === 0); // Show every 3rd point
    
    g.selectAll(".dot")
      .data(dotData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#FF5722")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add data point values above dots
    g.selectAll(".temp-label")
      .data(dotData)
      .enter()
      .append("text")
      .attr("class", "temp-label")
      .attr("x", d => x(d.time))
      .attr("y", d => y(d.value) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#444")
      .text(d => `${Math.round(d.value)}°`);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('padding', '8px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '100')
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.2)');

    g.selectAll(".dot")
      .on("mouseover", function(event: MouseEvent, d: DataPoint) {
        d3.select(this)
          .attr("r", 7)
          .attr("stroke-width", 3);
          
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
          
        tooltip.html(`<strong>${formatHour(d.time)}</strong><br/>Temperature: ${d.value.toFixed(1)}°C`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("stroke-width", 2);
          
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add axes with improved formatting
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat(d => formatHour(d as Date))
      )
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "11px")
      .attr("fill", "#555");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}°`))
      .selectAll("text")
      .attr("dx", "-0.5em")
      .attr("font-size", "11px")
      .attr("fill", "#555");

    // Add chart title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#444")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Temperature Forecast (°C)");
  };

  const createHumidityChart = () => {
    const svg = d3.select(humidityChartRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    // Set dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 40 };
    const width = humidityChartRef.current!.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Parse dates and format time - properly handling timezone
    const parseTime = (timeStr: string) => {
      const date = new Date(timeStr);
      // Ensure we're using local timezone
      return date;
    };
    
    const formatTime = d3.timeFormat("%H:%M");
    const formatHour = d3.timeFormat("%H:00");
    
    // Process data - filter to only show relevant hours and ensure data is sorted
    const processedForecast = [...forecast]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    // Create dataset for humidity chart
    const data = processedForecast.map(d => ({
      time: parseTime(d.time),
      value: d.humidity
    }));

    // Create scales with appropriate domains
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.time) as [Date, Date])
      .range([0, width]);
      
    const y = d3.scaleLinear()
      .domain([0, 100]) // Humidity is always 0-100%
      .range([height, 0]);

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add gradient background
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "humidity-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#64B5F6")
      .attr("stop-opacity", 0.7);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#64B5F6")
      .attr("stop-opacity", 0.1);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .attr("opacity", 0.1);
      
    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .attr("opacity", 0.1);

    // Add area
    g.append("path")
      .datum(data)
      .attr("fill", "url(#humidity-gradient)")
      .attr("d", d3.area<DataPoint>()
        .x(d => x(d.time))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5))
      );

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 3)
      .attr("d", d3.line<DataPoint>()
        .x(d => x(d.time))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5))
      );

    // Add dots - but filter to show fewer dots for clarity
    const dotData = data.filter((_, i) => i % 3 === 0); // Show every 3rd point
    
    g.selectAll(".dot")
      .data(dotData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#2196F3")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add data point values above dots
    g.selectAll(".humidity-label")
      .data(dotData)
      .enter()
      .append("text")
      .attr("class", "humidity-label")
      .attr("x", d => x(d.time))
      .attr("y", d => y(d.value) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#444")
      .text(d => `${Math.round(d.value)}%`);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('padding', '8px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '100')
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.2)');

    g.selectAll(".dot")
      .on("mouseover", function(event: MouseEvent, d: DataPoint) {
        d3.select(this)
          .attr("r", 7)
          .attr("stroke-width", 3);
          
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
          
        tooltip.html(`<strong>${formatHour(d.time)}</strong><br/>Humidity: ${Math.round(d.value)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("stroke-width", 2);
          
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add axes with improved formatting
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat(d => formatHour(d as Date))
      )
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "11px")
      .attr("fill", "#555");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("dx", "-0.5em")
      .attr("font-size", "11px")
      .attr("fill", "#555");

    // Add chart title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#444")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Humidity Forecast (%)");
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
        <svg 
          ref={temperatureChartRef} 
          className="w-full h-[300px]" 
          style={{ overflow: 'visible' }}
        />
      </div>
      
      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
        <svg 
          ref={humidityChartRef} 
          className="w-full h-[300px]" 
          style={{ overflow: 'visible' }}
        />
      </div>
    </div>
  );
};

export default ForecastCharts; 