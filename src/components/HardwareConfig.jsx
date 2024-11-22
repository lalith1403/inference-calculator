import React from 'react';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function HardwareConfig({ type, model, onModelChange, results, icon: Icon, specs }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6" />
        <h2 className="text-xl font-semibold">{type.toUpperCase()} Configuration</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select {type.toUpperCase()} Model
          </label>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${type.toUpperCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(specs[type]).map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {results && (
          <div className="space-y-2">
            <p className="text-sm">Tokens/Second: {formatNumber(results.tokensPerSecond)}</p>
            <p className="text-sm">Power Cost: {formatCurrency(results.powerCost)}</p>
            <p className="text-sm">Hardware Cost: {formatCurrency(results.hardwareCost)}</p>
            <p className="text-sm">Cost per Token: {formatCurrency(results.costPerToken)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
