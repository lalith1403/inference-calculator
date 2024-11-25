import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const METRICS = [
  { 
    key: 'speed', 
    label: 'Processing Throughput', 
    description: 'Tokens processed per hour',
    format: value => value.toLocaleString(),
    unit: 'tokens/hr'
  },
  { 
    key: 'efficiency', 
    label: 'Processing Efficiency', 
    description: 'Power consumption per million tokens',
    format: value => (value).toFixed(2),
    unit: 'kW/M tokens'
  },
  { 
    key: 'cooling', 
    label: 'Thermal Performance', 
    description: 'Heat generated per million tokens',
    format: value => value.toFixed(2),
    unit: 'kW heat/M tokens'
  }
];

const PerformanceGauge = ({ cpuMetrics, gpuMetrics }) => {
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);

  const getMetricValue = (metrics, key) => {
    if (!metrics) return 0;
    switch (key) {
      case 'speed':
        return metrics.tokensPerHour || 0;
      case 'efficiency':
        return metrics.tokensPerHour ? (metrics.specs.tdp * metrics.dailyCosts.power) / (metrics.tokensPerHour / 1e6) : 0;
      case 'cooling':
        return metrics.tokensPerHour ? (metrics.specs.tdp * metrics.dailyCosts.cooling) / (metrics.tokensPerHour / 1e6) : 0;
      default:
        return 0;
    }
  };

  const MetricDisplay = ({ value, label, color }) => (
    <div className={`bg-gray-800 p-6 rounded-xl border-2 border-${color}-400/20`}>
      <div className="text-center">
        <div className={`text-3xl font-bold text-${color}-400 mb-2`}>
          {!isNaN(value) ? selectedMetric.format(value) : '0'} {selectedMetric.unit}
        </div>
        <div className={`text-lg text-${color}-200`}>
          {label.replace('Cost Analysis', 'Revenue Analysis')}
        </div>
      </div>
    </div>
  );

  const MetricSelector = () => (
    <div className="flex flex-wrap gap-4 mb-8 justify-center">
      {METRICS.map(metric => (
        <button
          key={metric.key}
          onClick={() => setSelectedMetric(metric)}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedMetric.key === metric.key
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {metric.label}
        </button>
      ))}
    </div>
  );

  const AdditionalInfo = () => {
    const cpuValue = getMetricValue(cpuMetrics, selectedMetric.key);
    const gpuValue = getMetricValue(gpuMetrics, selectedMetric.key);
    
    return (
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Performance Analysis</h3>
          <p className="text-gray-400">{selectedMetric.description}</p>
        </div>

        {selectedMetric.key === 'speed' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Daily CPU Processing</div>
              <div className="text-xl text-emerald-400">
                {(cpuValue * 24).toLocaleString()} tokens/day
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Daily GPU Processing</div>
              <div className="text-xl text-orange-400">
                {(gpuValue * 24).toLocaleString()} tokens/day
              </div>
            </div>
          </div>
        )}

        {selectedMetric.key === 'efficiency' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">CPU Power Rating</div>
              <div className="text-xl text-emerald-400">
                {cpuMetrics?.specs.tdp}W TDP
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400">GPU Power Rating</div>
              <div className="text-xl text-orange-400">
                {gpuMetrics?.specs.tdp}W TDP
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <MetricSelector />
      
      <div className="grid grid-cols-2 gap-8">
        <MetricDisplay
          value={getMetricValue(cpuMetrics, selectedMetric.key)}
          label="CPU Performance"
          color="emerald"
        />
        <MetricDisplay
          value={getMetricValue(gpuMetrics, selectedMetric.key)}
          label="GPU Performance"
          color="orange"
        />
      </div>

      <AdditionalInfo />
    </div>
  );
};

export default PerformanceGauge;
