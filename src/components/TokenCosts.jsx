import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HARDWARE_SPECS, POWER_COST } from '../constants/hardware';

export function TokenCosts({ selectedCPU, selectedGPU, utilizationHours }) {
  const [activeTab, setActiveTab] = useState('comparison');
  
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

  const maxTokensPerHour = Math.max(
    cpuMetrics?.tokensPerHour || 0,
    gpuMetrics?.tokensPerHour || 0
  );

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
            <h3 className="text-2xl font-bold text-white mb-8">Performance Analysis</h3>
            
            <div className="space-y-12">
              {/* Radar Chart Simulation */}
              <div className="relative h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  {[0, 1, 2, 3, 4].map((ring) => (
                    <motion.div
                      key={ring}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: ring * 0.1 }}
                      className="absolute border border-white/10 rounded-full"
                      style={{
                        width: `${(ring + 1) * 20}%`,
                        height: `${(ring + 1) * 20}%`,
                      }}
                    />
                  ))}
                  
                  {/* CPU Metrics */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        d={`M ${40 + (cpuMetrics.efficiency / 2)} ${40} L ${60} ${40 + (cpuMetrics.tokensPerHour / maxTokensPerHour * 20)} L ${60} ${60} L ${40} ${60}`}
                        fill="rgba(52, 211, 153, 0.2)"
                        stroke="#34d399"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>

                  {/* GPU Metrics */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        d={`M ${60 + (gpuMetrics.efficiency / 2)} ${40} L ${80} ${40 + (gpuMetrics.tokensPerHour / maxTokensPerHour * 20)} L ${80} ${60} L ${60} ${60}`}
                        fill="rgba(251, 146, 60, 0.2)"
                        stroke="#fb923c"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Metric Labels */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-white/70 text-sm">
                    Efficiency
                  </div>
                  <div className="absolute top-1/2 right-0 translate-x-4 -translate-y-1/2 text-white/70 text-sm">
                    Speed
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-white/70 text-sm">
                    Cost
                  </div>
                  <div className="absolute top-1/2 left-0 -translate-x-4 -translate-y-1/2 text-white/70 text-sm">
                    Power
                  </div>
                </div>
              </div>

              {/* Comparison Metrics */}
              <div className="grid grid-cols-2 gap-8">
                {[
                  {
                    label: 'Token Generation',
                    cpu: cpuMetrics.efficiency,
                    gpu: gpuMetrics.efficiency,
                    unit: 'tokens/W·h',
                    icon: '⚡️'
                  },
                  {
                    label: 'Cost Efficiency',
                    cpu: 1 / cpuMetrics.costPerToken,
                    gpu: 1 / gpuMetrics.costPerToken,
                    unit: 'tokens/$',
                    icon: '💰'
                  }
                ].map(({ label, cpu, gpu, unit, icon }) => (
                  <motion.div
                    key={label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                    <div className="relative bg-black/30 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{icon}</span>
                        <span className="text-white/70">{label}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative h-8">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-lg overflow-hidden"
                          >
                            <div className="absolute inset-0 flex items-center px-3">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-emerald-300"
                              >
                                CPU: {cpu.toFixed(2)} {unit}
                              </motion.div>
                            </div>
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: 0 }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                            />
                          </motion.div>
                        </div>

                        <div className="relative h-8">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="absolute inset-y-0 left-0 bg-orange-500/20 rounded-lg overflow-hidden"
                          >
                            <div className="absolute inset-0 flex items-center px-3">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-orange-300"
                              >
                                GPU: {gpu.toFixed(2)} {unit}
                              </motion.div>
                            </div>
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: 0 }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Score */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-orange-500/10 to-purple-500/10 rounded-xl blur-xl" />
                <div className="relative bg-black/30 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="text-white/70">Overall Performance Score</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-orange-400 to-purple-400 text-transparent bg-clip-text">
                      {Math.round((gpuMetrics.efficiency / cpuMetrics.efficiency) * 100)}%
                    </div>
                  </div>
                  <div className="text-sm text-white/50 mt-2">GPU performance relative to CPU</div>
                </div>
              </motion.div>
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
