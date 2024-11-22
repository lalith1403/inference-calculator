import React, { useState, useEffect } from 'react';
import { Monitor, Cpu } from 'lucide-react';
import HardwareConfig from './components/HardwareConfig';
import { PerformanceChart, BreakEvenChart } from './components/ComparisonCharts';
import { calculateMetrics } from './utils/calculations';

const POWER_COST = 0.12; // USD per kWh

const HARDWARE_SPECS = {
  cpu: {
    "Intel Xeon Platinum 8480+": {
      cores: 56,
      baseFreq: 2.0,
      maxFreq: 3.8,
      tdp: 350,
      price: 8999,
      memory: "112MB L3 Cache",
      typicalInferenceTokens: 30, // tokens/second for typical LLM inference
    },
    "AMD EPYC 9654": {
      cores: 96,
      baseFreq: 2.4,
      maxFreq: 3.7,
      tdp: 360,
      price: 11849,
      memory: "384MB L3 Cache",
      typicalInferenceTokens: 40,
    },
    "Intel Xeon Platinum 8380": {
      cores: 40,
      baseFreq: 2.3,
      maxFreq: 3.4,
      tdp: 270,
      price: 8099,
      memory: "60MB L3 Cache",
      typicalInferenceTokens: 25,
    },
    "AMD EPYC 7763": {
      cores: 64,
      baseFreq: 2.45,
      maxFreq: 3.5,
      tdp: 280,
      price: 7890,
      memory: "256MB L3 Cache",
      typicalInferenceTokens: 35,
    },
  },
  gpu: {
    "NVIDIA A100 80GB": {
      memory: "80GB HBM2e",
      memoryBandwidth: 2039, // GB/s
      tdp: 400,
      price: 10000,
      typicalInferenceTokens: 100,
      tensorCores: 432,
    },
    "NVIDIA H100 80GB": {
      memory: "80GB HBM3",
      memoryBandwidth: 3350, // GB/s
      tdp: 700,
      price: 30000,
      typicalInferenceTokens: 180,
      tensorCores: 528,
    },
    "NVIDIA L4": {
      memory: "24GB GDDR6",
      memoryBandwidth: 300, // GB/s
      tdp: 72,
      price: 2000,
      typicalInferenceTokens: 45,
      tensorCores: 144,
    },
    "NVIDIA T4": {
      memory: "16GB GDDR6",
      memoryBandwidth: 320, // GB/s
      tdp: 70,
      price: 1500,
      typicalInferenceTokens: 30,
      tensorCores: 320,
    },
  },
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default function InferenceCalculator() {
  const [cpuModel, setCpuModel] = useState('');
  const [gpuModel, setGpuModel] = useState('');
  const [timeHorizonHours, setTimeHorizonHours] = useState(1);
  const [cpuResults, setCpuResults] = useState(null);
  const [gpuResults, setGpuResults] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [breakEvenData, setBreakEvenData] = useState([]);

  useEffect(() => {
    const cpuMetrics = calculateMetrics(cpuModel, 'cpu', timeHorizonHours, HARDWARE_SPECS);
    const gpuMetrics = calculateMetrics(gpuModel, 'gpu', timeHorizonHours, HARDWARE_SPECS);
    
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
        const cpuData = calculateMetrics(cpuModel, 'cpu', hours, HARDWARE_SPECS);
        const gpuData = calculateMetrics(gpuModel, 'gpu', hours, HARDWARE_SPECS);
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
          specs={HARDWARE_SPECS}
        />

        <HardwareConfig
          type="gpu"
          model={gpuModel}
          onModelChange={setGpuModel}
          results={gpuResults}
          icon={Monitor}
          specs={HARDWARE_SPECS}
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