import React from 'react';

export function HardwareConfig({ type, selectedModel, onModelChange, specs }) {
  if (!specs) return null;

  const HardwareCard = ({ model, hardware, isSelected }) => (
    <div 
      className={`p-6 backdrop-blur-xl rounded-2xl border transition-all duration-200 cursor-pointer h-[280px] ${
        isSelected 
          ? 'bg-blue-950/60 border-blue-700/50 shadow-lg' 
          : 'bg-blue-950/30 border-blue-800/20 hover:bg-blue-950/40'
      }`}
      onClick={() => onModelChange(model)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-blue-50 font-display tracking-tight">{model}</h3>
        <div className={`w-4 h-4 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-blue-900'}`} />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-200">Performance</span>
            <span className="text-blue-100 font-mono">{hardware.typicalInferenceTokens} tokens/s</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-900/50">
            <div 
              className="h-full rounded-full bg-blue-500" 
              style={{ 
                width: `${(hardware.typicalInferenceTokens / Math.max(...Object.values(specs).map(h => h.typicalInferenceTokens))) * 100}%` 
              }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-200">Cost</span>
            <span className="text-blue-100 font-mono">${hardware.price}</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-900/50">
            <div 
              className="h-full rounded-full bg-blue-500" 
              style={{ 
                width: `${(hardware.price / Math.max(...Object.values(specs).map(h => h.price))) * 100}%` 
              }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-200">Power Usage</span>
            <span className="text-blue-100 font-mono">{hardware.tdp}W</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-900/50">
            <div 
              className="h-full rounded-full bg-blue-500" 
              style={{ 
                width: `${(hardware.tdp / Math.max(...Object.values(specs).map(h => h.tdp))) * 100}%` 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-50">{type} Options</h2>
        <div className="flex-1 h-px bg-blue-800/30"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(specs).map(([model, hardware]) => (
          <HardwareCard 
            key={model}
            model={model}
            hardware={hardware}
            isSelected={selectedModel === model}
          />
        ))}
      </div>
    </div>
  );
}
