export const POWER_COST = 0.12; // USD per kWh

export const HARDWARE_SPECS = {
  cpu: {
    "Intel Xeon Platinum 8480+": {
      cores: 56,
      baseFreq: 2.0,
      maxFreq: 3.8,
      tdp: 350,
      price: 8999,
      memory: "112MB L3 Cache",
      typicalInferenceTokens: 30,
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
      memoryBandwidth: 2039,
      tdp: 400,
      price: 10000,
      typicalInferenceTokens: 100,
      tensorCores: 432,
    },
    "NVIDIA H100 80GB": {
      memory: "80GB HBM3",
      memoryBandwidth: 3350,
      tdp: 700,
      price: 30000,
      typicalInferenceTokens: 180,
      tensorCores: 528,
    },
    "NVIDIA L4": {
      memory: "24GB GDDR6",
      memoryBandwidth: 300,
      tdp: 72,
      price: 2000,
      typicalInferenceTokens: 45,
      tensorCores: 144,
    },
    "NVIDIA T4": {
      memory: "16GB GDDR6",
      memoryBandwidth: 320,
      tdp: 70,
      price: 1500,
      typicalInferenceTokens: 30,
      tensorCores: 320,
    },
  },
};
