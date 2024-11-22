import React, { useState, useEffect } from 'react';
import { Cpu, Gpu } from 'lucide-react';
import HardwareConfig from './components/HardwareConfig';
import { PerformanceChart, BreakEvenChart } from './components/ComparisonCharts';
import { calculateMetrics } from './utils/calculations';

export default function Calculator() {
  const [cpuModel, setCpuModel] = useState('');
  const [gpuModel, setGpuModel] = useState('');
  const [timeHorizonHours, setTimeHorizonHours] = useState(1);
  const [cpuResults, setCpuResults] = useState(null);
  const [gpuResults, setGpuResults] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [breakEvenData, setBreakEvenData] = useState([]);

  useEffect(() => {
    const cpuMetrics = calculateMetrics(cpuModel, 'cpu', timeHorizonHours);
    const gpuMetrics = calculateMetrics(gpuModel, 'gpu', timeHorizonHours);
    
    setCpuResults(cpuMetrics);
    setGpuResults(gpuMetrics);

    if (cpuMetrics && gpuMetrics) {
      setComparisonData([
        {
          metric: 'Tokens/Second',
          CPU: cpuMetrics.tokensPerSecond,
          GPU: gpuMetrics.tokensPerSecond,
        },
        {
          metric: 'Cost/Token',
          CPU: cpuMetrics.costPerToken,
          GPU: gpuMetrics.costPerToken,
        },
        {
          metric: 'Tokens/Watt',
          CPU: cpuMetrics.tokensPerWatt,
          GPU: gpuMetrics.tokensPerWatt,
        },
      ]);

      const breakEvenPoints = Array.from({length: 12}, (_, i) => {
        const hours = (i + 1) * 730; // Monthly intervals
        const cpuData = calculateMetrics(cpuModel, 'cpu', hours);
        const gpuData = calculateMetrics(gpuModel, 'gpu', hours);
        return {
          months: i + 1,
          CPU: cpuData?.totalCost || 0,
          GPU: gpuData?.totalCost || 0,
        };
      });
      setBreakEvenData(breakEvenPoints);
    }
  }, [cpuModel, gpuModel, timeHorizonHours]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">CPU vs GPU Inference Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HardwareConfig
          type="cpu"
          model={cpuModel}
          onModelChange={setCpuModel}
          results={cpuResults}
          icon={Cpu}
        />

        <HardwareConfig
          type="gpu"
          model={gpuModel}
          onModelChange={setGpuModel}
          results={gpuResults}
          icon={Gpu}
        />
      </div>

      <div className="w-full max-w-xs mx-auto p-6 bg-white rounded-lg shadow-lg">
        <label className="block text-sm font-medium mb-1">Time Horizon (hours)</label>
        <input
          type="number"
          value={timeHorizonHours}
          onChange={(e) => setTimeHorizonHours(Number(e.target.value))}
          min="1"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {comparisonData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceChart data={comparisonData} />
          <BreakEvenChart data={breakEvenData} />
        </div>
      )}
    </div>
  );
}
