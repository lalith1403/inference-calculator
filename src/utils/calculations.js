import { POWER_COST } from '../constants/hardware';

export const calculateMetrics = (model, type, utilizationHours, specs) => {
  if (!model || !utilizationHours) return null;
  const hardwareSpecs = specs[type][model];
  
  // Calculate base metrics with safe number operations
  const tokensPerSecond = Number(hardwareSpecs.typicalInferenceTokens) || 0;
  const tokensPerHour = tokensPerSecond * 3600;
  const dailyTokens = tokensPerHour * Number(utilizationHours);
  
  // Calculate daily power consumption and cost
  const dailyPowerKWh = (Number(hardwareSpecs.tdp) / 1000) * Number(utilizationHours);
  const dailyPowerCost = dailyPowerKWh * Number(POWER_COST);
  const hardwareCost = Number(hardwareSpecs.price) || 0;
  
  // Calculate efficiency metrics
  const tokensPerWatt = hardwareSpecs.tdp > 0 ? tokensPerSecond / (hardwareSpecs.tdp / 1000) : 0;
  
  return {
    // Performance metrics
    tokensPerSecond,
    tokensPerHour,
    dailyTokens,
    tokensPerWatt,
    
    // Cost metrics
    dailyPowerKWh,
    dailyPowerCost,
    hardwareCost,
    
    // Hardware specs for reference
    specs: {
      tdp: hardwareSpecs.tdp,
      price: hardwareSpecs.price,
      memory: hardwareSpecs.memory,
    }
  };
};

export const generateComparisonData = (cpuMetrics, gpuMetrics) => {
  if (!cpuMetrics || !gpuMetrics) return [];
  
  return [
    {
      metric: 'Tokens/Hour',
      CPU: Math.round(cpuMetrics.tokensPerHour),
      GPU: Math.round(gpuMetrics.tokensPerHour),
      unit: 'tokens'
    },
    {
      metric: 'Power Efficiency',
      CPU: Math.round(cpuMetrics.tokensPerWatt),
      GPU: Math.round(gpuMetrics.tokensPerWatt),
      unit: 'tokens/watt'
    },
    {
      metric: 'Daily Tokens',
      CPU: Math.round(cpuMetrics.dailyTokens),
      GPU: Math.round(gpuMetrics.dailyTokens),
      unit: 'tokens'
    }
  ];
};

export const generateBreakEvenData = (cpuMetrics, gpuMetrics, timeHorizonMonths = 24, utilizationHours = 24) => {
  if (!cpuMetrics || !gpuMetrics) return [];
  
  const data = [];
  const daysPerMonth = 30;
  
  // Calculate monthly costs based on daily utilization
  const cpuMonthlyPowerCost = cpuMetrics.dailyPowerCost * daysPerMonth;
  const gpuMonthlyPowerCost = gpuMetrics.dailyPowerCost * daysPerMonth;
  
  // Generate monthly cumulative costs
  for (let month = 0; month <= timeHorizonMonths; month++) {
    const cpuTotalCost = cpuMetrics.hardwareCost + (cpuMonthlyPowerCost * month);
    const gpuTotalCost = gpuMetrics.hardwareCost + (gpuMonthlyPowerCost * month);
    
    data.push({
      months: month,
      CPU: Math.round(cpuTotalCost),
      GPU: Math.round(gpuTotalCost),
      cpuMonthlyPowerCost: Math.round(cpuMonthlyPowerCost),
      gpuMonthlyPowerCost: Math.round(gpuMonthlyPowerCost),
      difference: Math.round(Math.abs(cpuTotalCost - gpuTotalCost)),
      utilizationHours
    });
  }
  
  return data;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};
