import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const formatValue = (value) => {
    return typeof value === 'number' ? Math.round(value).toLocaleString() : '0';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border">
      <p className="font-semibold mb-2">Month {label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="mb-1">
          <p style={{ color: entry.color }}>
            {entry.name}: ${formatValue(entry.value)}
          </p>
          {entry.payload && (
            <p className="text-sm text-gray-600">
              Monthly Power Cost: ${formatValue(entry.payload[`${entry.name.toLowerCase()}MonthlyPowerCost`])}
            </p>
          )}
        </div>
      ))}
      {payload[0]?.payload?.difference && (
        <p className="mt-2 text-sm font-semibold">
          Cost Difference: ${formatValue(payload[0].payload.difference)}
        </p>
      )}
    </div>
  );
};

export function PerformanceChart({ data, utilizationHours }) {
  const getInsights = (data) => {
    if (!data || data.length === 0) return '';
    
    const tokenMetric = data.find(d => d.metric === 'Daily Tokens');
    if (!tokenMetric) return '';
    
    const diff = tokenMetric.GPU - tokenMetric.CPU;
    const fasterBy = Math.round((diff / tokenMetric.CPU) * 100);
    const dailyTokensGPU = tokenMetric.GPU.toLocaleString();
    const dailyTokensCPU = tokenMetric.CPU.toLocaleString();
    
    return `With ${utilizationHours} hours of daily utilization, the GPU processes ${fasterBy}% more tokens (GPU: ${dailyTokensGPU} vs CPU: ${dailyTokensCPU} tokens/day).`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Performance Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">{getInsights(data)}</p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="metric" 
              tick={{ fontSize: 12 }}
              interval={0}
              height={60}
              tickMargin={15}
            />
            <YAxis 
              tickFormatter={(value) => Math.round(value).toLocaleString()} 
              width={80}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="CPU" fill="#8884d8" name="CPU Performance" />
            <Bar dataKey="GPU" fill="#82ca9d" name="GPU Performance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BreakEvenChart({ data, onTimeRangeChange, utilizationHours }) {
  const [timeRange, setTimeRange] = useState(24);
  
  useEffect(() => {
    onTimeRangeChange(timeRange);
  }, [timeRange, onTimeRangeChange]);

  const getBreakEvenInsights = (data) => {
    if (!data || data.length === 0) return '';
    
    const breakEvenPoint = data.find(point => point.GPU <= point.CPU);
    if (!breakEvenPoint) {
      return `With ${utilizationHours} hours of daily utilization, the GPU investment may take longer than ${timeRange} months to break even.`;
    }
    
    const monthlyGPUPowerCost = breakEvenPoint.gpuMonthlyPowerCost || 0;
    const monthlyCPUPowerCost = breakEvenPoint.cpuMonthlyPowerCost || 0;
    const powerSavings = monthlyCPUPowerCost - monthlyGPUPowerCost;
    
    return `With ${utilizationHours} hours of daily utilization, the GPU investment breaks even after ${breakEvenPoint.months} months. ` +
           `Monthly power costs: GPU $${monthlyGPUPowerCost.toLocaleString()} vs CPU $${monthlyCPUPowerCost.toLocaleString()} ` +
           `(${powerSavings > 0 ? 'saving' : 'spending'} $${Math.abs(powerSavings).toLocaleString()} per month in power).`;
  };

  const filteredData = (data || []).filter(d => d.months <= timeRange);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Cost Analysis Over Time</h3>
          <p className="text-sm text-gray-600">{getBreakEvenInsights(data)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Analysis Period:</label>
          <input
            type="range"
            min="1"
            max="60"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-medium">{timeRange}m</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="months" 
              label={{ value: 'Months', position: 'bottom', offset: 20 }}
              tick={{ fontSize: 12 }}
              tickMargin={15}
            />
            <YAxis 
              label={{ 
                value: 'Total Cost ($)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -10
              }}
              width={80}
              tickFormatter={(value) => Math.round(value).toLocaleString()}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="CPU" 
              name="CPU Total Cost"
              stroke="#8884d8" 
              dot={false}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="GPU" 
              name="GPU Total Cost"
              stroke="#82ca9d" 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
