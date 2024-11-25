import React from 'react';
import { motion } from 'framer-motion';
import { HARDWARE_SPECS, POWER_COST } from '../constants/hardware';

export function TokenCosts({ selectedCPU, selectedGPU, utilizationHours }) {
  const calculateTokenCost = (hardware, type) => {
    if (!hardware) return null;
    const specs = HARDWARE_SPECS[type][hardware];
    const powerCostPerHour = (specs.tdp / 1000) * POWER_COST;
    const tokensPerHour = specs.typicalInferenceTokens * 3600; // tokens per second * seconds in hour
    const costPerToken = powerCostPerHour / tokensPerHour;
    return {
      tokensPerHour,
      costPerToken,
      powerCostPerHour,
      dailyCost: powerCostPerHour * utilizationHours
    };
  };

  const cpuMetrics = selectedCPU ? calculateTokenCost(selectedCPU, 'cpu') : null;
  const gpuMetrics = selectedGPU ? calculateTokenCost(selectedGPU, 'gpu') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-700/20 p-6"
    >
      <h2 className="text-2xl font-bold text-blue-50 mb-2 tracking-tight font-display">Token Generation Costs</h2>
      <p className="text-blue-200 text-sm mb-6 font-light tracking-wide">
        Compare the cost efficiency of token generation between CPU and GPU
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'CPU Metrics', metrics: cpuMetrics, model: selectedCPU },
          { title: 'GPU Metrics', metrics: gpuMetrics, model: selectedGPU }
        ].map(({ title, metrics, model }) => (
          <div key={title} className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-100">{title}</h3>
            {metrics ? (
              <div className="space-y-3">
                <div className="bg-blue-950/30 rounded-lg p-4">
                  <div className="text-blue-200 text-sm mb-1">Model: {model}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-blue-400 text-xs">Tokens/Hour</div>
                      <div className="text-blue-50 font-mono">
                        {metrics.tokensPerHour.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-400 text-xs">Cost/Token</div>
                      <div className="text-blue-50 font-mono">
                        ${metrics.costPerToken.toFixed(8)}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-400 text-xs">Power Cost/Hour</div>
                      <div className="text-blue-50 font-mono">
                        ${metrics.powerCostPerHour.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-400 text-xs">Daily Power Cost</div>
                      <div className="text-blue-50 font-mono">
                        ${metrics.dailyCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-blue-300/50 italic">Select a {title.split(' ')[0]} model to view metrics</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
