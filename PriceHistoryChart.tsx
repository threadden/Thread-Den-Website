import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TrendingDown, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface PricePoint {
  date: Date;
  dateLabel: string;
  price: number;
}

interface PriceHistoryChartProps {
  productId: string;
  currentPrice: number;
  currencySymbol: string;
  theme: "dark" | "light";
}

// Deterministically generate 3 months of price history based on product id
function generatePriceHistory(productId: string, currentPrice: number): PricePoint[] {
  // Simple hash from product ID string for deterministic pseudo-random variance
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const now = new Date("2026-07-25T00:00:00");
  const points: PricePoint[] = [];

  // Generate 7 data points over the last 90 days (roughly every 15 days)
  const offsets = [90, 75, 60, 45, 30, 15, 0];

  // Variance pattern relative to current price
  // Usually pricing starts slightly higher 3 months ago (e.g., launch price) and stabilizes
  const varianceFactors = [
    1.18 + (Math.abs(hash % 7) * 0.02),
    1.12 + (Math.abs((hash >> 2) % 5) * 0.02),
    1.15 + (Math.abs((hash >> 3) % 4) * 0.01),
    1.08 + (Math.abs((hash >> 4) % 6) * 0.02),
    1.05 + (Math.abs((hash >> 5) % 3) * 0.02),
    1.02 + (Math.abs((hash >> 6) % 4) * 0.01),
    1.0, // Today
  ];

  offsets.forEach((daysAgo, index) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);

    const dateLabel = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const price = Math.round(currentPrice * varianceFactors[index]);
    points.push({
      date: d,
      dateLabel,
      price,
    });
  });

  return points;
}

export default function PriceHistoryChart({
  productId,
  currentPrice,
  currencySymbol,
  theme,
}: PriceHistoryChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  const isDark = theme === "dark";
  const data = generatePriceHistory(productId, currentPrice);

  const startPrice = data[0].price;
  const priceDiff = currentPrice - startPrice;
  const percentChange = ((priceDiff / startPrice) * 100).toFixed(1);
  const isLower = priceDiff <= 0;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const width = 360;
    const height = 140;
    const margin = { top: 20, right: 20, bottom: 25, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const yMin = d3.min(data, (d) => d.price) || currentPrice * 0.8;
    const yMax = d3.max(data, (d) => d.price) || currentPrice * 1.2;

    // Padding for Y domain
    const yPadding = (yMax - yMin) * 0.25 || 100;

    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .range([innerHeight, 0]);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Gradient definition for area fill
    const defs = svg.append("defs");
    const gradientId = `price-gradient-${productId}`;

    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", isLower ? "#10b981" : "#f59e0b")
      .attr("stop-opacity", isDark ? 0.35 : 0.25);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", isLower ? "#10b981" : "#f59e0b")
      .attr("stop-opacity", 0.0);

    // Area generator
    const areaGenerator = d3
      .area<PricePoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Line generator
    const lineGenerator = d3
      .line<PricePoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Draw Grid Lines
    const yTicks = yScale.ticks(3);
    chartGroup
      .append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", isDark ? "#27272a" : "#e4e4e7")
      .attr("stroke-dasharray", "3,3");

    // Draw Area
    chartGroup
      .append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaGenerator);

    // Draw Line
    chartGroup
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", isLower ? "#10b981" : "#f59e0b")
      .attr("stroke-width", 2.5)
      .attr("d", lineGenerator);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(4)
      .tickFormat((d) =>
        d3.timeFormat("%b %d")(d as Date)
      )
      .tickSize(0);

    const xAxisG = chartGroup
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.select(".domain").remove();
    xAxisG
      .selectAll("text")
      .attr("fill", isDark ? "#71717a" : "#a1a1aa")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("dy", "10px");

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickFormat((d) => `${currencySymbol}${d.valueOf()}`)
      .tickSize(0);

    const yAxisG = chartGroup.append("g").call(yAxis);
    yAxisG.select(".domain").remove();
    yAxisG
      .selectAll("text")
      .attr("fill", isDark ? "#71717a" : "#a1a1aa")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("dx", "-4px");

    // Data Circles & Hover interactions
    chartGroup
      .selectAll(".data-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.price))
      .attr("r", (d, i) => (i === data.length - 1 ? 5 : 3.5))
      .attr("fill", (d, i) =>
        i === data.length - 1
          ? isLower
            ? "#10b981"
            : "#f59e0b"
          : isDark
          ? "#18181b"
          : "#ffffff"
      )
      .attr("stroke", isLower ? "#10b981" : "#f59e0b")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredPoint(d);
        d3.select(event.currentTarget).attr("r", 6);
      })
      .on("mouseleave", (event, d) => {
        setHoveredPoint(null);
        d3.select(event.currentTarget).attr("r", (data.indexOf(d) === data.length - 1 ? 5 : 3.5));
      });
  }, [productId, currentPrice, currencySymbol, isDark, data, isLower]);

  return (
    <div
      ref={containerRef}
      className={`p-3.5 rounded-2xl border space-y-2 relative transition-all ${
        isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>3-Month Price History (D3.js)</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
          {isLower ? (
            <span className="text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <TrendingDown className="w-3 h-3" />
              {percentChange}%
            </span>
          ) : (
            <span className="text-amber-500 flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <TrendingUp className="w-3 h-3" />
              +{percentChange}%
            </span>
          )}
        </div>
      </div>

      {/* Hover Tooltip display banner */}
      <div className="h-5 flex items-center justify-between text-[11px] font-mono">
        {hoveredPoint ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span>{hoveredPoint.dateLabel}:</span>
            <span className="text-white bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
              {currencySymbol}
              {hoveredPoint.price.toLocaleString()}
            </span>
          </span>
        ) : (
          <span className="text-zinc-500 text-[10px]">
            Hover data points to inspect past pricing trends
          </span>
        )}

        <span className="text-zinc-400 text-[10px]">
          Current: <strong className="text-emerald-500">{currencySymbol}{currentPrice.toLocaleString()}</strong>
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 360 140"
          className="w-full max-w-[360px] h-[140px] overflow-visible"
        />
      </div>
    </div>
  );
}
