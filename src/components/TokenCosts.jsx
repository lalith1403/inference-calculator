import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HARDWARE_SPECS, POWER_COST } from '../constants/hardware';

export function TokenCosts({ selectedCPU, selectedGPU, utilizationHours }) {
  const [activeTab, setActiveTab] = useState('comparison');
  const [showChartInfo, setShowChartInfo] = useState(false);
  
  const calculateTokenCost = (hardware, type) => {
    if (!hardware) return null;
    const specs = HARDWARE_SPECS[type][hardware];
    const powerCostPerHour = (specs.tdp / 1000) * POWER_COST;
    const tokensPerHour = specs.typicalInferenceTokens * 3600;
    const costPerToken = powerCostPerHour / tokensPerHour;
    const efficiency = tokensPerHour / specs.tdp; // tokens per watt-hour
    
    return {
      tokensPerHour,
      costPerToken,
      powerCostPerHour,
      dailyCost: powerCostPerHour * utilizationHours,
      efficiency,
      tdp: specs.tdp,
      price: specs.price,
      memory: specs.memory
    };
  };

  const cpuMetrics = selectedCPU ? calculateTokenCost(selectedCPU, 'cpu') : null;
  const gpuMetrics = selectedGPU ? calculateTokenCost(selectedGPU, 'gpu') : null;

  // Normalize values and calculate maximums
  const normalizeValue = (value, max) => {
    if (!max || max === 0) return 0;
    return Math.min(Math.max(value / max, 0), 1);
  };

  const maxEfficiency = Math.max(cpuMetrics?.efficiency || 0, gpuMetrics?.efficiency || 0);
  const maxTokensPerHour = Math.max(cpuMetrics?.tokensPerHour || 0, gpuMetrics?.tokensPerHour || 0);
  const maxCostPerToken = Math.max(cpuMetrics?.costPerToken || 0, gpuMetrics?.costPerToken || 0);
  const maxTDP = Math.max(cpuMetrics?.tdp || 0, gpuMetrics?.tdp || 0);

  const generateRadarPoints = (metrics, centerX, centerY, radius) => {
    if (!metrics || Object.values(metrics).some(v => v === undefined || v === null)) {
      return '';
    }

    // Pre-calculate normalized values with proper scaling
    const values = [
      // Efficiency (higher is better)
      normalizeValue(metrics.efficiency, maxEfficiency),
      // Speed (higher is better)
      normalizeValue(metrics.tokensPerHour, maxTokensPerHour),
      // Cost (lower is better, so we use inverse scaling)
      1 - (metrics.costPerToken / maxCostPerToken),
      // Power (lower is better, so we use inverse scaling)
      1 - (metrics.tdp / maxTDP)
    ];

    // Calculate vertices with proper angle distribution
    const points = values.map((value, i) => {
      // Start from top (π/2) and go clockwise
      const angle = (Math.PI * 2 * i / 4) + (Math.PI / 2);
      const scaledRadius = value * radius;
      return [
        centerX + scaledRadius * Math.cos(angle),
        centerY - scaledRadius * Math.sin(angle)
      ];
    });

    // Generate SVG path
    return `M ${points[0][0]} ${points[0][1]} ` +
           points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') +
           ` L ${points[0][0]} ${points[0][1]}`;
  };

  const renderGridLines = (centerX, centerY, maxRadius) => {
    const scales = [0.25, 0.5, 0.75, 1];
    return scales.map((scale, index) => {
      const points = [];
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i / 4) + (Math.PI / 2);
        const radius = maxRadius * scale;
        points.push([
          centerX + radius * Math.cos(angle),
          centerY - radius * Math.sin(angle)
        ]);
      }
      return `M ${points[0][0]} ${points[0][1]} ` +
             points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') +
             ` L ${points[0][0]} ${points[0][1]}`;
    });
  };

  const tabs = [
    { id: 'comparison', label: 'Visual Comparison' },
    { id: 'details', label: 'Detailed Metrics' },
    { id: 'efficiency', label: 'Efficiency Analysis' }
  ];

  const renderComparisonTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      {[
        { metrics: cpuMetrics, type: 'CPU', color: 'from-emerald-400 to-teal-500' },
        { metrics: gpuMetrics, type: 'GPU', color: 'from-amber-400 to-orange-500' }
      ].map(({ metrics, type, color }) => (
        <motion.div
          key={type}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <h3 className="text-2xl font-bold text-white mb-4">{type} Processing</h3>
            {metrics ? (
              <>
                <div className="space-y-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="relative h-24 bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
                        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                      />
                    </div>
                    <div className="relative">
                      <div className="text-xs text-white/70">Tokens per Hour</div>
                      <div className="text-2xl font-mono text-white">
                        {metrics.tokensPerHour.toLocaleString()}
                      </div>
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-white/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${(metrics.tokensPerHour / maxTokensPerHour) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                    >
                      <div className="text-xs text-white/70">Cost per Token</div>
                      <div className="text-lg font-mono text-white">
                        ${metrics.costPerToken.toFixed(8)}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                    >
                      <div className="text-xs text-white/70">Daily Cost</div>
                      <div className="text-lg font-mono text-white">
                        ${metrics.dailyCost.toFixed(2)}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/50 italic">Select a {type} model</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDetailsTab = () => (
    <div className="mt-6 space-y-6">
      {[
        { metrics: cpuMetrics, type: 'CPU', model: selectedCPU },
        { metrics: gpuMetrics, type: 'GPU', model: selectedGPU }
      ].map(({ metrics, type, model }) => (
        <motion.div
          key={type}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-blue-950/30 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-white mb-4">{type} Detailed Metrics</h3>
          {metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'TDP', value: `${metrics.tdp}W` },
                { label: 'Memory', value: metrics.memory },
                { label: 'Hardware Cost', value: `$${metrics.price.toLocaleString()}` },
                { label: 'Efficiency', value: `${metrics.efficiency.toFixed(2)} tokens/W·h` }
              ].map(({ label, value }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 rounded-lg p-4"
                >
                  <div className="text-sm text-blue-200">{label}</div>
                  <div className="text-lg font-mono text-white">{value}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-white/50 italic">Select a {type} model</div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderEfficiencyTab = () => (
    <div className="mt-6">
      {cpuMetrics && gpuMetrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-pink-900/20 rounded-xl blur-xl" />
          <div className="relative bg-black/20 rounded-xl p-8 backdrop-blur-xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">Performance Analysis</h3>
                <button
                  onClick={() => setShowChartInfo(true)}
                  className="p-2 rounded-full hover:bg-blue-800/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info Modal */}
            {showChartInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/80 backdrop-blur-sm"
                onClick={() => setShowChartInfo(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-blue-900/90 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-blue-700/50"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-blue-50">Understanding the Performance Radar</h4>
                    <button
                      onClick={() => setShowChartInfo(false)}
                      className="text-blue-200 hover:text-blue-100 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-blue-200">This radar chart provides a comprehensive view of performance across four key metrics:</p>
                    <div className="grid gap-3">
                      {[
                        {
                          title: "Efficiency",
                          description: "Measures tokens processed per watt, indicating energy efficiency",
                          icon: "⚡"
                        },
                        {
                          title: "Processing Speed",
                          description: "Raw throughput in tokens per second",
                          icon: "🚀"
                        },
                        {
                          title: "Cost Efficiency",
                          description: "Cost per million tokens processed",
                          icon: "💰"
                        },
                        {
                          title: "Power Usage",
                          description: "Energy consumption in watts",
                          icon: "🔋"
                        }
                      ].map(item => (
                        <div key={item.title} className="bg-blue-800/30 rounded-lg p-3 flex gap-3 items-start">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <h5 className="text-blue-100 font-semibold">{item.title}</h5>
                            <p className="text-sm text-blue-300">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-blue-800/20 rounded-lg p-4">
                      <h5 className="text-blue-100 font-semibold mb-2">How to Read the Chart</h5>
                      <ul className="list-disc list-inside space-y-2 text-sm text-blue-200">
                        <li>Each axis represents one metric</li>
                        <li>Larger area indicates better overall performance</li>
                        <li>CPU metrics shown in green, GPU in orange</li>
                        <li>Values are normalized for easy comparison</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            <div className="space-y-12">
              {/* Radar Chart */}
              <div className="relative h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Background grid */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    {renderGridLines(50, 50, 40).map((pathD, index) => (
                      <path
                        key={index}
                        d={pathD}
                        stroke="rgba(255,255,255,0.1)"
                        fill="none"
                        strokeDasharray="2"
                      />
                    ))}
                    {/* Axis lines */}
                    <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.2)" />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.2)" />
                  </svg>

                  {/* CPU Metrics */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        d={generateRadarPoints(cpuMetrics, 50, 50, 40)}
                        fill="rgba(52, 211, 153, 0.2)"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </motion.div>

                  {/* GPU Metrics */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        d={generateRadarPoints(gpuMetrics, 50, 50, 40)}
                        fill="rgba(251, 146, 60, 0.2)"
                        stroke="#fb923c"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Metric Labels */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                    <div className="text-white/70 text-sm font-semibold">Efficiency</div>
                    <div className="text-xs text-emerald-400">
                      {(cpuMetrics?.efficiency || 0).toFixed(0)} vs {(gpuMetrics?.efficiency || 0).toFixed(0)} t/W·h
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-0 translate-x-4 -translate-y-1/2">
                    <div className="text-white/70 text-sm font-semibold">Speed</div>
                    <div className="text-xs text-emerald-400">
                      {(cpuMetrics?.tokensPerHour / 3600 || 0).toFixed(0)} vs {(gpuMetrics?.tokensPerHour / 3600 || 0).toFixed(0)} t/s
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4">
                    <div className="text-white/70 text-sm font-semibold">Cost</div>
                    <div className="text-xs text-emerald-400">
                      ${(cpuMetrics?.costPerToken * 1000000 || 0).toFixed(2)} vs ${(gpuMetrics?.costPerToken * 1000000 || 0).toFixed(2)}/M
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-0 -translate-x-4 -translate-y-1/2">
                    <div className="text-white/70 text-sm font-semibold">Power</div>
                    <div className="text-xs text-emerald-400">
                      {cpuMetrics?.tdp || 0}W vs {gpuMetrics?.tdp || 0}W
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance insights */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h4 className="text-blue-100 font-semibold mb-2">Performance Summary</h4>
                  <p className="text-sm text-blue-200">
                    The radar visualization shows relative performance across all metrics.
                    Larger area indicates better overall performance. The {(gpuMetrics?.tokensPerHour || 0) > (cpuMetrics?.tokensPerHour || 0) ? 'GPU' : 'CPU'} 
                    shows {Math.round(Math.abs(((gpuMetrics?.tokensPerHour || 0) / (cpuMetrics?.tokensPerHour || 1) - 1) * 100))}% 
                    {(gpuMetrics?.tokensPerHour || 0) > (cpuMetrics?.tokensPerHour || 0) ? ' higher' : ' lower'} throughput.
                  </p>
                </div>
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h4 className="text-blue-100 font-semibold mb-2">Cost-Efficiency Analysis</h4>
                  <p className="text-sm text-blue-200">
                    While the {(gpuMetrics?.tdp || 0) > (cpuMetrics?.tdp || 0) ? 'GPU' : 'CPU'} consumes more power,
                    it achieves {Math.round(Math.abs(((gpuMetrics?.efficiency || 0) / (cpuMetrics?.efficiency || 1) - 1) * 100))}% 
                    better tokens per watt ratio, making it more cost-effective for high-throughput workloads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-700/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-50 tracking-tight font-display">Token Generation Analysis</h2>
          <p className="text-blue-200 text-sm font-light tracking-wide">
            Comprehensive comparison of token generation capabilities and costs
          </p>
        </div>
        <div className="flex space-x-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                activeTab === id
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-900/30 text-blue-200 hover:bg-blue-800/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'comparison' && renderComparisonTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'efficiency' && renderEfficiencyTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
