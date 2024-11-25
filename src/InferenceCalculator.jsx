import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardwareConfig } from './components/HardwareConfig';
import { PerformanceChart, BreakEvenChart } from './components/ComparisonCharts';
import { TokenCosts } from './components/TokenCosts';
import { calculateMetrics, generateComparisonData, generateBreakEvenData } from './utils/calculations';
import { HARDWARE_SPECS } from './constants/hardware';

export default function InferenceCalculator() {
  const [selectedCPU, setSelectedCPU] = useState('');
  const [selectedGPU, setSelectedGPU] = useState('');
  const [utilizationHours, setUtilizationHours] = useState(12);
  const [timeRange, setTimeRange] = useState(24);

  const cpuMetrics = selectedCPU ? calculateMetrics(selectedCPU, 'cpu', utilizationHours, HARDWARE_SPECS) : null;
  const gpuMetrics = selectedGPU ? calculateMetrics(selectedGPU, 'gpu', utilizationHours, HARDWARE_SPECS) : null;

  const performanceData = generateComparisonData(cpuMetrics, gpuMetrics);
  const breakEvenData = generateBreakEvenData(cpuMetrics, gpuMetrics, timeRange, utilizationHours);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-4 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-700/20 p-6">
          <h2 className="text-2xl font-bold text-blue-50 mb-2 tracking-tight font-display">Hardware Inference Calculator</h2>
          <p className="text-blue-200 text-sm mb-6 font-light tracking-wide">Configure your hardware specifications and analyze performance metrics</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HardwareConfig
              type="CPU"
              selectedModel={selectedCPU}
              onModelChange={setSelectedCPU}
              specs={HARDWARE_SPECS.cpu}
            />
            <HardwareConfig
              type="GPU"
              selectedModel={selectedGPU}
              onModelChange={setSelectedGPU}
              specs={HARDWARE_SPECS.gpu}
            />
          </div>
          <div className="mt-6 pt-4 border-t border-blue-800/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-blue-100">
                Daily Utilization
              </label>
              <span className="text-blue-200 text-sm font-mono">{utilizationHours}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={utilizationHours}
              onChange={(e) => setUtilizationHours(Number(e.target.value))}
              className="w-full h-1 bg-blue-800/50 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <div className="flex justify-between text-xs text-blue-300 mt-1">
              <span>1h</span>
              <span>12h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {selectedCPU && selectedGPU && (
          <>
            <PerformanceChart data={performanceData} utilizationHours={utilizationHours} />
            <BreakEvenChart 
              data={breakEvenData} 
              onTimeRangeChange={setTimeRange}
              utilizationHours={utilizationHours}
            />
            <TokenCosts
              selectedCPU={selectedCPU}
              selectedGPU={selectedGPU}
              utilizationHours={utilizationHours}
            />
          </>
        )}
      </div>
    </div>
  );
}