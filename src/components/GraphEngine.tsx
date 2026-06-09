/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LabExperiment, GraphConfig } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Activity, Grid, Sliders, Palette } from 'lucide-react';

interface GraphEngineProps {
  experiment: LabExperiment;
  onChange: (updated: LabExperiment) => void;
}

export default function GraphEngine({ experiment, onChange }: GraphEngineProps) {
  const { tableData, graphConfig } = experiment;
  const { headers, rows } = tableData;

  // Convert raw string data to numbers safely for Recharts
  const chartData = rows.map((row, idx) => {
    const formatted: Record<string, any> = { id: idx + 1 };
    headers.forEach(header => {
      const val = parseFloat(row[header]);
      formatted[header] = isNaN(val) ? row[header] : val;
    });
    return formatted;
  });

  const updateConfig = (key: keyof GraphConfig, value: any) => {
    onChange({
      ...experiment,
      graphConfig: {
        ...graphConfig,
        [key]: value
      }
    });
  };

  const lineColors = [
    { name: 'Sleek Indigo', hex: '#4f46e5' },
    { name: 'Imperial Blue', hex: '#3b82f6' },
    { name: 'Emerald Wave', hex: '#10b981' },
    { name: 'Cobalt Violet', hex: '#8b5cf6' },
    { name: 'Monochrome Slate', hex: '#475569' }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="graphical-plotting-engine">
      
      <div>
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          Interactive Graph Engine
        </h4>
        <p className="text-xs text-slate-500">Configure parameters to plot real-time scientific indicators based on loaded dataset.</p>
      </div>

      {headers.length === 0 || rows.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
          <Grid className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
          <p className="text-xs text-slate-500 text-center">Spreadsheet is empty. Add data table parameters first to preview the experimental plots.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Graphical Display Area */}
          <div className="lg:col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-slate-800 tracking-wide block uppercase font-mono">
                {graphConfig.title || 'Scientific Plot Area'}
              </span>
            </div>

            <div className="w-full h-64 text-xs font-mono">
              <ResponsiveContainer width="99%" height="100%">
                {graphConfig.type === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    {graphConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                    <XAxis 
                      dataKey={graphConfig.xKey} 
                      label={{ value: graphConfig.xAxisLabel || graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }} 
                      tick={{ fill: '#475569', fontSize: '9px' }}
                    />
                    <YAxis 
                      label={{ value: graphConfig.yAxisLabel || graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                      tick={{ fill: '#475569', fontSize: '9px' }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey={graphConfig.yKey} 
                      stroke={graphConfig.lineColor} 
                      strokeWidth={2} 
                      activeDot={{ r: 6 }} 
                      name={`${graphConfig.yKey} vs ${graphConfig.xKey}`}
                    />
                  </LineChart>
                ) : graphConfig.type === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    {graphConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                    <XAxis 
                      dataKey={graphConfig.xKey} 
                      label={{ value: graphConfig.xAxisLabel || graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }}
                      tick={{ fill: '#475569', fontSize: '9px' }}
                    />
                    <YAxis 
                      label={{ value: graphConfig.yAxisLabel || graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                      tick={{ fill: '#475569', fontSize: '9px' }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar 
                      dataKey={graphConfig.yKey} 
                      fill={graphConfig.lineColor} 
                      name={`${graphConfig.yKey} vs ${graphConfig.xKey}`}
                    />
                  </BarChart>
                ) : (
                  <ScatterChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    {graphConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                    <XAxis 
                      dataKey={graphConfig.xKey} 
                      name={graphConfig.xKey}
                      label={{ value: graphConfig.xAxisLabel || graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }}
                      tick={{ fill: '#475569', fontSize: '9px' }}
                      type="number"
                    />
                    <YAxis 
                      dataKey={graphConfig.yKey} 
                      name={graphConfig.yKey}
                      label={{ value: graphConfig.yAxisLabel || graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                      tick={{ fill: '#475569', fontSize: '9px' }}
                      type="number"
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Scatter 
                      name={`${graphConfig.yKey} vs ${graphConfig.xKey}`} 
                      data={chartData} 
                      fill={graphConfig.lineColor} 
                    />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </div>
            
            <div className="text-[10px] text-slate-400 text-center font-mono mt-2">
              Note: Non-numerical observation entries automatically filtered from plots.
            </div>
          </div>

          {/* Controls Config Block */}
          <div className="space-y-4">
            
            <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/50">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Axis Mapping Settings
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">X-Axis Variable</label>
                <select
                  value={graphConfig.xKey}
                  onChange={(e) => updateConfig('xKey', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Y-Axis Variable</label>
                <select
                  value={graphConfig.yKey}
                  onChange={(e) => updateConfig('yKey', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Chart Representation</label>
                <div className="grid grid-cols-3 gap-1 grid-flow-row">
                  {(['line', 'bar', 'scatter'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateConfig('type', type)}
                      className={`py-1 rounded text-[10px] font-bold uppercase border transition ${
                        graphConfig.type === type 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-650' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/50">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                Axis & Style Labels
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Figure Caption</label>
                <input
                  type="text"
                  value={graphConfig.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="e.g., Characteristic curve"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">X-Axis Title</label>
                <input
                  type="text"
                  value={graphConfig.xAxisLabel}
                  onChange={(e) => updateConfig('xAxisLabel', e.target.value)}
                  placeholder="Amperes (A)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Y-Axis Title</label>
                <input
                  type="text"
                  value={graphConfig.yAxisLabel}
                  onChange={(e) => updateConfig('yAxisLabel', e.target.value)}
                  placeholder="Voltage (V)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-dashed border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Gridlines</span>
                <input
                  type="checkbox"
                  checked={graphConfig.showGrid}
                  onChange={(e) => updateConfig('showGrid', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Plot Spec Palette</span>
                <div className="flex gap-2">
                  {lineColors.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => updateConfig('lineColor', color.hex)}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        graphConfig.lineColor === color.hex 
                          ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
