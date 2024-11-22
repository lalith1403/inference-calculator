import { POWER_COST } from '../constants/hardware';

// Constants for business calculations
const AVERAGE_7B_MODEL_FLOPS = 7e9; // 7B parameters
const AVERAGE_TOKEN_PRICE = 0.0001; // $0.0001 per token market rate
const FLOPS_PER_TOKEN = 2 * AVERAGE_7B_MODEL_FLOPS; // Approximate FLOPs per token for a 7B model

export const calculateMetrics = (model, type, utilizationHours, specs) => {
  if (!model || !utilizationHours) return null;
  const hardwareSpecs = specs[type][model];
  
  // Calculate base metrics with safe number operations
  const tokensPerSecond = Number(hardwareSpecs.typicalInferenceTokens) || 0;
  const tokensPerHour = tokensPerSecond * 3600;
  const dailyTokens = tokensPerHour * Number(utilizationHours);
  const monthlyTokens = dailyTokens * 30; // Assuming 30 days per month
  
  // Calculate power consumption and costs
  const dailyPowerKWh = (Number(hardwareSpecs.tdp) / 1000) * Number(utilizationHours);
  const dailyPowerCost = dailyPowerKWh * Number(POWER_COST);
  const monthlyPowerCost = dailyPowerCost * 30;
  const hardwareCost = Number(hardwareSpecs.price) || 0;
  
  // Calculate efficiency metrics
  const tokensPerWatt = hardwareSpecs.tdp > 0 ? tokensPerSecond / (hardwareSpecs.tdp / 1000) : 0;
  
  // Calculate unit economics
  const costPerMillionTokens = monthlyTokens > 0 
    ? ((monthlyPowerCost + (hardwareCost / 24)) / monthlyTokens) * 1000000 // Amortizing hardware cost over 2 years
    : 0;
  
  const hourlyOperatingCost = dailyPowerCost / utilizationHours;
  const tokensPer1USD = hourlyOperatingCost > 0 
    ? tokensPerHour / hourlyOperatingCost 
    : 0;
  
  // Calculate business metrics
  const monthlyRevenue = monthlyTokens * AVERAGE_TOKEN_PRICE;
  const monthlyProfit = monthlyRevenue - monthlyPowerCost - (hardwareCost / 24); // Hardware cost amortized over 2 years
  const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
  
  // Calculate ROI metrics
  const flopsPerSecond = tokensPerSecond * FLOPS_PER_TOKEN;
  const flopsPerDollar = flopsPerSecond / (hardwareSpecs.price > 0 ? hardwareSpecs.price : 1);
  const tokensToBreakEven = hardwareCost / (AVERAGE_TOKEN_PRICE - (costPerMillionTokens / 1000000));
  const daysToBreakEven = tokensToBreakEven / dailyTokens;
  
  return {
    // Performance metrics
    tokensPerSecond,
    tokensPerHour,
    dailyTokens,
    monthlyTokens,
    tokensPerWatt,
    
    // Cost metrics
    dailyPowerKWh,
    dailyPowerCost,
    monthlyPowerCost,
    hardwareCost,
    costPerMillionTokens,
    tokensPer1USD,
    hourlyOperatingCost,
    
    // Business metrics
    monthlyRevenue,
    monthlyProfit,
    profitMargin,
    flopsPerSecond,
    flopsPerDollar,
    tokensToBreakEven,
    daysToBreakEven,
    
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
      metric: 'Daily Tokens',
      CPU: cpuMetrics.dailyTokens,
      GPU: gpuMetrics.dailyTokens,
      unit: 'tokens',
      description: 'Total tokens processed per day'
    },
    {
      metric: 'Power Efficiency',
      CPU: cpuMetrics.tokensPerWatt,
      GPU: gpuMetrics.tokensPerWatt,
      unit: 'tokens/watt',
      description: 'Tokens processed per watt of power'
    },
    {
      metric: 'Cost per 1M Tokens',
      CPU: cpuMetrics.costPerMillionTokens,
      GPU: gpuMetrics.costPerMillionTokens,
      unit: 'USD',
      description: 'Cost to process 1 million tokens'
    },
    {
      metric: 'Tokens per $1',
      CPU: cpuMetrics.tokensPer1USD,
      GPU: gpuMetrics.tokensPer1USD,
      unit: 'tokens',
      description: 'Number of tokens processed per dollar'
    }
  ];
};

export const generateROIData = (cpuMetrics, gpuMetrics) => {
  if (!cpuMetrics || !gpuMetrics) return [];
  
  return [
    {
      metric: 'FLOPS per $',
      CPU: cpuMetrics.flopsPerDollar,
      GPU: gpuMetrics.flopsPerDollar,
      unit: 'FLOPS/$',
      description: 'Computational power per dollar invested'
    },
    {
      metric: 'Profit Margin',
      CPU: cpuMetrics.profitMargin,
      GPU: gpuMetrics.profitMargin,
      unit: '%',
      description: 'Monthly profit as percentage of revenue'
    },
    {
      metric: 'Monthly Profit',
      CPU: cpuMetrics.monthlyProfit,
      GPU: gpuMetrics.monthlyProfit,
      unit: 'USD',
      description: 'Net profit per month after costs'
    }
  ];
};

export const generateBreakEvenData = (cpuMetrics, gpuMetrics, timeHorizonMonths = 24, utilizationHours = 24) => {
  if (!cpuMetrics || !gpuMetrics) return [];
  
  const data = [];
  const daysPerMonth = 30;
  
  // Calculate monthly revenue and costs
  const cpuMonthlyRevenue = cpuMetrics.monthlyRevenue;
  const gpuMonthlyRevenue = gpuMetrics.monthlyRevenue;
  const cpuMonthlyPowerCost = cpuMetrics.dailyPowerCost * daysPerMonth;
  const gpuMonthlyPowerCost = gpuMetrics.dailyPowerCost * daysPerMonth;
  
  // Generate monthly cumulative revenue
  for (let month = 0; month <= timeHorizonMonths; month++) {
    const cpuRevenue = (cpuMonthlyRevenue * month) - cpuMetrics.hardwareCost - (cpuMonthlyPowerCost * month);
    const gpuRevenue = (gpuMonthlyRevenue * month) - gpuMetrics.hardwareCost - (gpuMonthlyPowerCost * month);
    
    data.push({
      months: month,
      CPURevenue: Math.round(cpuRevenue),
      GPURevenue: Math.round(gpuRevenue),
      difference: Math.round(Math.abs(cpuRevenue - gpuRevenue)),
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

export const formatLargeNumber = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(1);
};
