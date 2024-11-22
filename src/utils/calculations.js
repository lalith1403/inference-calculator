import { POWER_COST } from '../constants/hardware';

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

export const calculateMetrics = (model, type, hours, specs) => {
  if (!model) return null;
  const hardwareSpecs = specs[type][model];
  const totalTokens = hardwareSpecs.typicalInferenceTokens * 3600 * hours;
  const powerCost = (hardwareSpecs.tdp / 1000) * hours * POWER_COST;
  const hardwareCost = hardwareSpecs.price;
  const totalCost = powerCost + hardwareCost;
  const costPerToken = totalCost / totalTokens;
  
  return {
    totalTokens,
    powerCost,
    hardwareCost,
    totalCost,
    costPerToken,
    tokensPerSecond: hardwareSpecs.typicalInferenceTokens,
    tokensPerWatt: hardwareSpecs.typicalInferenceTokens / (hardwareSpecs.tdp / 1000),
  };
};
