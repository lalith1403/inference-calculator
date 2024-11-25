import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartColors = {
  CPU: {
    primary: '#60A5FA',
    text: '#E0F2FE'
  },
  GPU: {
    primary: '#34D399',
    text: '#D1FAE5'
  }
};

function formatLargeNumber(value, isPercentage = false) {
  if (typeof value === 'number') {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  }
  return value;
}

const ChartLegend = () => (
  <div className="absolute top-4 right-4 flex gap-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.CPU.primary }}></div>
      <span className="text-blue-200 text-sm">CPU</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.GPU.primary }}></div>
      <span className="text-blue-200 text-sm">GPU</span>
    </div>
  </div>
);

const InsightsBox = ({ data }) => {
  const insights = [
    {
      title: "Performance Advantage",
      value: `${((data[0]?.GPU / data[0]?.CPU) || 0).toFixed(1)}x`,
      description: "GPU throughput compared to CPU",
      icon: "⚡"
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {insights.map((insight, index) => (
        <div
          key={index}
          className="bg-blue-900/30 rounded-xl responsive-p flex flex-col gap-2 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-blue-200 responsive-text font-semibold">{insight.title}</h3>
            <span className="text-2xl">{insight.icon}</span>
          </div>
          <p className="text-blue-50 responsive-heading">{insight.value}</p>
          <p className="text-blue-300 text-sm">{insight.description}</p>
        </div>
      ))}
    </div>
  );
};

const AnalysisModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-blue-900/90 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-50">{title}</h2>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-blue-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

const AnalysisButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="absolute top-4 right-4 bg-blue-800/40 hover:bg-blue-800/60 transition-colors rounded-full p-2"
  >
    <svg className="w-6 h-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </motion.button>
);

export function PerformanceChart({ data }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const maxValue = Math.max(...data.map(d => Math.max(d.CPU || 0, d.GPU || 0)));
  const chartHeight = 400;
  const chartWidth = 600;
  const barWidth = 60;
  const spacing = 40;
  const padding = 60;

  const insights = [
    {
      title: "Performance Advantage",
      value: `${((data[0]?.GPU / data[0]?.CPU) || 0).toFixed(1)}x`,
      description: "GPU throughput compared to CPU",
      icon: "⚡"
    },
    {
      title: "Cost Efficiency",
      value: `${((data[2]?.GPU / data[2]?.CPU) || 0).toFixed(1)}x`,
      description: "Better cost per token ratio with GPU",
      icon: "💰"
    },
    {
      title: "Power Efficiency",
      value: `${((data[1]?.GPU / data[1]?.CPU) || 0).toFixed(1)}x`,
      description: "More tokens processed per watt with GPU",
      icon: "🔋"
    }
  ];

  return (
    <motion.div className="space-y-6">
      <div className="relative bg-blue-900/20 rounded-2xl responsive-p backdrop-blur-sm">
        <h2 className="responsive-heading text-blue-50 mb-8">Performance Comparison</h2>
        <div className="flex gap-16">
          {/* Chart Section */}
          <div className="w-[500px] flex-shrink-0">
            <svg width={chartWidth} height={chartHeight} className="overflow-visible">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <g key={tick}>
                  <line
                    x1={padding}
                    y1={chartHeight - (chartHeight - padding * 2) * tick - padding}
                    x2="100%"
                    y2={chartHeight - (chartHeight - padding * 2) * tick - padding}
                    stroke="#1e40af"
                    strokeOpacity="0.2"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={padding - 10}
                    y={chartHeight - (chartHeight - padding * 2) * tick - padding}
                    textAnchor="end"
                    fill="#93c5fd"
                    fontSize="12"
                    dominantBaseline="middle"
                  >
                    {formatLargeNumber(maxValue * tick)}
                  </text>
                </g>
              ))}

              {/* Bars */}
              {data.map((item, index) => {
                const x = padding + index * (barWidth * 2 + spacing);
                const cpuHeight = ((item.CPU || 0) / maxValue) * (chartHeight - padding * 2);
                const gpuHeight = ((item.GPU || 0) / maxValue) * (chartHeight - padding * 2);

                return (
                  <g key={item.metric}>
                    {/* CPU Bar */}
                    <rect
                      x={x}
                      y={chartHeight - cpuHeight - padding}
                      width={barWidth}
                      height={cpuHeight}
                      fill={chartColors.CPU.primary}
                      rx={4}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - cpuHeight - padding - 10}
                      textAnchor="middle"
                      fill={chartColors.CPU.text}
                      fontSize="12"
                    >
                      {formatLargeNumber(item.CPU)}
                    </text>

                    {/* GPU Bar */}
                    <rect
                      x={x + barWidth + 10}
                      y={chartHeight - gpuHeight - padding}
                      width={barWidth}
                      height={gpuHeight}
                      fill={chartColors.GPU.primary}
                      rx={4}
                    />
                    <text
                      x={x + barWidth + 10 + barWidth / 2}
                      y={chartHeight - gpuHeight - padding - 10}
                      textAnchor="middle"
                      fill={chartColors.GPU.text}
                      fontSize="12"
                    >
                      {formatLargeNumber(item.GPU)}
                    </text>

                    {/* X-axis labels */}
                    <text
                      x={x + barWidth + 5}
                      y={chartHeight - 20}
                      textAnchor="middle"
                      fill="#93c5fd"
                      fontSize="12"
                    >
                      {item.metric}
                    </text>
                  </g>
                );
              })}
            </svg>
            <ChartLegend />
          </div>

          {/* Insights Section - Moved to right, adjusted width */}
          <div className="w-[400px] flex-shrink-0 space-y-4 ml-auto">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div>
                    <h4 className="text-blue-100 font-semibold">{insight.title}</h4>
                    <div className="text-2xl font-bold text-blue-50">{insight.value}</div>
                    <p className="text-sm text-blue-200">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Processing Capacity Section - Swap GPU and CPU positions */}
        <div className="mt-6 bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30">
          <h4 className="text-lg font-semibold text-blue-100 mb-2">Processing Capacity</h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-blue-200 mb-1">CPU Throughput</div>
              <div className="text-xl font-bold text-blue-50">
                {formatLargeNumber(data[0]?.CPU)} tokens/sec
              </div>
              <div className="text-sm text-blue-200 mt-2">
                {formatLargeNumber(data[0]?.CPU * 3600 * 24)} tokens/day
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-200 mb-1">GPU Throughput</div>
              <div className="text-xl font-bold text-blue-50">
                {formatLargeNumber(data[0]?.GPU)} tokens/sec
              </div>
              <div className="text-sm text-blue-200 mt-2">
                {formatLargeNumber(data[0]?.GPU * 3600 * 24)} tokens/day
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BreakEvenChart({ data, utilizationHours }) {
  // Format data for Recharts
  const chartData = data.map((d, index) => ({
    month: `Month ${index + 1}`,
    CPU: d.CPURevenue,
    GPU: d.GPURevenue
  }));

  // Calculate break-even points
  const gpuBreakEvenPoint = data.findIndex(d => d.GPURevenue > 0);
  const cpuBreakEvenPoint = data.findIndex(d => d.CPURevenue > 0);
  const commonBreakEvenPoint = data.findIndex(d => d.GPURevenue > 0 && d.CPURevenue > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-blue-900/90 backdrop-blur-sm rounded-lg p-3 border border-blue-700/50 shadow-lg">
          <p className="text-blue-100 font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${formatLargeNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-blue-900/20 rounded-2xl responsive-p backdrop-blur-sm"
    >
      <h2 className="responsive-heading text-blue-50 mb-8">Cost Analysis</h2>
      <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" strokeOpacity={0.2} />
            <XAxis 
              dataKey="month" 
              stroke="#93c5fd" 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              stroke="#93c5fd" 
              fontSize={12}
              tickFormatter={(value) => `$${formatLargeNumber(value)}`}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="CPU"
              stroke={chartColors.CPU.primary}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColors.CPU.primary }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="GPU"
              stroke={chartColors.GPU.primary}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColors.GPU.primary }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
