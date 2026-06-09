/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LabExperiment, GeneratedReport } from '../types';
import { generateLaTeXSource } from './LaTeXExporter';
import { calculateColumnStats } from '../utils';
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
import { 
  Printer, 
  Copy, 
  Check, 
  Cpu, 
  ChevronDown, 
  BookOpen, 
  Settings, 
  HelpCircle,
  FileCheck2,
  FileCode2,
  Info
} from 'lucide-react';

interface AcademicReportProps {
  experiment: LabExperiment;
  report?: GeneratedReport;
  userEmail?: string;
}

export default function AcademicReport({ experiment, report, userEmail }: AcademicReportProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'latex' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);
  const [expandedViva, setExpandedViva] = useState<Record<number, boolean>>({});

  // Compute local Javascript statistics on the specified Y column for validation
  const stats = calculateColumnStats(
    experiment.tableData.rows, 
    experiment.graphConfig.yKey
  );

  const toggleViva = (index: number) => {
    setExpandedViva(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Triggers modern customized print-to-pdf layout
  const handlePrint = () => {
    window.print();
  };

  // Custom regex-free micro-renderer to style LaTeX blocks in Markdown
  const renderLaTeXText = (text: string) => {
    if (!text) return '';
    
    // Split by block math $$
    const blockParts = text.split(/\$\$(.*?)\$\$/g);
    return blockParts.map((part, index) => {
      // Every odd index is inside $$...$$
      if (index % 2 === 1) {
        return (
          <div 
            key={index} 
            className="my-5 p-4 bg-slate-50 border-l-4 border-indigo-505 rounded-r-xl text-center font-serif text-base italic overflow-x-auto text-slate-800 shadow-inner"
          >
            {part}
          </div>
        );
      }

      // Inside even indices, look for inline math $...$
      const inlineParts = part.split(/\$(.*?)\$/g);
      return (
        <span key={index}>
          {inlineParts.map((subPart, subIdx) => {
            if (subIdx % 2 === 1) {
              return (
                <code 
                  key={subIdx} 
                  className="px-1.5 py-0.5 mx-0.5 bg-slate-50 border border-slate-100 rounded text-indigo-650 font-serif italic font-medium shrink-0"
                >
                  {subPart}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  const laTeXCode = generateLaTeXSource(experiment, report);

  const markdownCode = `# ${experiment.title}
**Subject:** ${experiment.subject}
**Date:** ${new Date().toLocaleDateString()}

## Aim
${experiment.aim}

## Theory
${report?.theory || ''}

## Calculations
${report?.calculations || ''}

## Analysis
${report?.analysis || ''}

## Results
${report?.results || ''}

## Conclusion
${report?.conclusion || ''}
`;

  return (
    <div className="space-y-6" id="generated-report-view">
      
      {/* Exporter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-930'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            Manuscript Preview
          </button>
          <button
            onClick={() => setActiveTab('latex')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'latex' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-930'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-blue-500" />
            LaTeX TeX Code
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'markdown' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-930'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Markdown
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'preview' ? (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Print to PDF / Save
            </button>
          ) : (
            <button
              onClick={() => handleCopy(activeTab === 'latex' ? laTeXCode : markdownCode)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Boilerplate!' : 'Copy Source Code'}
            </button>
          )}
        </div>
      </div>

      {/* RENDER VIEWPORTS */}
      {activeTab === 'latex' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-sm text-slate-300 font-mono text-xs max-h-[600px] overflow-y-auto leading-6 relative print:hidden">
          <div className="absolute top-4 right-4 bg-slate-900 px-2.5 py-1 text-[9px] rounded font-bold uppercase text-slate-500 border border-slate-800">
            Copy-paste directly to Overleaf / TeXshop
          </div>
          <pre className="whitespace-pre-wrap">{laTeXCode}</pre>
        </div>
      )}

      {activeTab === 'markdown' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-sm text-slate-300 font-mono text-xs max-h-[600px] overflow-y-auto leading-6 relative print:hidden">
          <pre className="whitespace-pre-wrap">{markdownCode}</pre>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-6">
          
          {/* REAL ACADEMIC LAYOUT */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-150 shadow-md max-w-4xl mx-auto font-sans text-slate-800 space-y-8 relative leading-relaxed print:shadow-none print:border-0 print:p-0">
            
            {/* Paper Header banner */}
            <div className="border-b border-slate-100 pb-2 flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-wider print:hidden">
              <span>National Institute of Engineering Research Paper</span>
              <span>Draft ID: LAB-{experiment.id.slice(0, 6)}</span>
            </div>

            {/* Title block */}
            <div className="text-center space-y-3 pt-6 border-b-2 border-double border-slate-200 pb-8">
              <span className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest">{experiment.subject}</span>
              <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
                {experiment.title || 'UNCONFIGURED LAB EXPERIMENT'}
              </h1>
              <div className="text-xs text-slate-500 font-medium space-y-1">
                <div>Drafted by: <span className="font-semibold text-slate-800">{userEmail || 'arnav.sharma9051@gmail.com'}</span></div>
                <div>Date of Investigation: {experiment.date || new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Abstract */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic text-slate-600 text-xs leading-relaxed max-w-2xl mx-auto">
              <strong className="text-slate-800 font-sans uppercase not-italic tracking-wider text-[10px] block mb-1">Abstract</strong>
              This quantitative laboratory investigation logs and analyzes the physical properties of the experiment: <strong className="not-italic text-slate-800">"{experiment.title}"</strong>. State variables, empirical datasets, and coordinate-plane trends were automatically mapped with interactive graphing interfaces and error limits parsing. Objective alignment levels and systematic variance sources are evaluated.
            </div>

            {/* Objective */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">1. Objective / Aim</h2>
              <p className="text-sm font-medium italic text-slate-700 leading-relaxed bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/50">
                {experiment.aim || 'No objective specified.'}
              </p>
            </div>

            {/* Theory */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">2. Theoretical Foundations</h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line text-justify">
                {report ? (
                  renderLaTeXText(report.theory)
                ) : (
                  <p className="text-slate-400 italic text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 animate-spin text-indigo-400" />
                    Theoretical physics formulas and laws compiling. Click green button to call Gemini.
                  </p>
                )}
              </div>
            </div>

            {/* Apparatus list */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">3. Apparatus Used</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {experiment.apparatus.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-medium bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
                {experiment.apparatus.length === 0 && (
                  <span className="text-slate-400 italic">No apparatus added yet.</span>
                )}
              </ul>
            </div>

            {/* Procedure */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">4. Experimental Procedure</h2>
              <ol className="space-y-2 text-xs">
                {experiment.procedure.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <span className="font-mono font-bold bg-slate-200 text-slate-500 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700">{step}</span>
                  </li>
                ))}
                {experiment.procedure.length === 0 && (
                  <span className="text-slate-400 italic">No procedural parameters configured.</span>
                )}
              </ol>
            </div>

            {/* Observations Table */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">5. Quantitative Observations</h2>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {experiment.tableData.headers.map(h => (
                        <th key={h} className="p-3 font-semibold text-slate-700 uppercase font-mono">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {experiment.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-150 last:border-0 hover:bg-slate-50/50 transition">
                        {experiment.tableData.headers.map(h => (
                          <td key={h} className="p-3 font-mono text-slate-800">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {experiment.rawObservationsMarkdown && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs italic text-slate-600 font-mono leading-relaxed">
                  <span className="font-sans font-bold text-slate-700 uppercase block text-[9px] tracking-wider mb-1">Qualitative Lab Notes:</span>
                  {experiment.rawObservationsMarkdown}
                </div>
              )}
            </div>

            {/* Embedded JavaScript statistics engine & Calculations */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">6. Dynamic Statistical Calculations</h2>
              
              {/* Grid with JS Stats vs AI calculations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Mean stats */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Computed Mean (Y-Axis)</div>
                  <div className="text-xl font-mono font-bold text-slate-800 mt-2">
                    {stats ? stats.mean.toFixed(4) : 'NaN'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{"$$\\mu = \\\\frac{1}{N}\\\\sum_i x_i$$"}</div>
                </div>

                {/* Std Dev */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Standard Deviation</div>
                  <div className="text-xl font-mono font-bold text-slate-800 mt-2">
                    {stats ? stats.stdDev.toFixed(4) : 'NaN'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{"$$\\sigma = \\\\sqrt{s^2}$$"}</div>
                </div>

                {/* Standard Error of estimate */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Standard Error (S.E.)</div>
                  <div className="text-xl font-mono font-bold text-slate-800 mt-2">
                    {stats ? stats.stdError.toFixed(4) : 'NaN'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{"$$S.E. = \\\\frac{\\\\sigma}{\\\\sqrt{N}}$$" }</div>
                </div>

              </div>

              {/* Statistical calculations table of limits */}
              {report && report.statisticalCalculations && (
                <div className="border border-slate-155 rounded-xl overflow-hidden bg-slate-50/50 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-2.5 font-bold text-slate-700">Metric Parameters</th>
                        <th className="p-2.5 font-bold text-slate-700">Stat Value</th>
                        <th className="p-2.5 font-bold text-slate-700 font-mono">Formula Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.statisticalCalculations.map((sc, scIdx) => (
                        <tr key={scIdx} className="border-b border-slate-150 last:border-0 hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">{sc.metric}</td>
                          <td className="p-2.5 font-mono text-indigo-650 font-semibold">{sc.value}</td>
                          <td className="p-2.5 font-mono text-slate-500 text-[10px]">{sc.formula}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Calculations Text detailing math steps */}
              <div className="text-sm leading-relaxed text-slate-750 font-serif whitespace-pre-line text-justify pt-1">
                {report ? (
                  renderLaTeXText(report.calculations)
                ) : (
                  <p className="text-slate-400 italic text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 animate-spin text-indigo-400" />
                    Standard physical calculations block resolving. Click compile report!
                  </p>
                )}
              </div>
            </div>

            {/* Error sources table */}
            {report && report.errorAnalysis && (
              <div className="space-y-3">
                <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">Least Count & Instrumental Limits</h3>
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/30 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150">
                        <th className="p-2.5 font-bold text-slate-700 uppercase">Observable/Instrument</th>
                        <th className="p-2.5 font-bold text-slate-700 uppercase">Tolerance / Least Count</th>
                        <th className="p-2.5 font-bold text-slate-700 uppercase">Scientific Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.errorAnalysis.map((ea, eaIdx) => (
                        <tr key={eaIdx} className="border-b border-slate-150 last:border-0 hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-800 font-semibold">{ea.parameter}</td>
                          <td className="p-2.5 font-mono text-indigo-650 font-medium">{ea.uncertainty}</td>
                          <td className="p-2.5 text-slate-600 leading-relaxed">{ea.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Graph plotted inline */}
            <div className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-155 pb-1 uppercase tracking-tight">7. Scientific Graph Representation</h2>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col justify-between items-center">
                <span className="text-xs font-bold text-slate-700 font-sans block uppercase tracking-wider mb-4 border-b border-indigo-300 pb-1">
                  Figure 1: {experiment.graphConfig.title}
                </span>

                <div className="w-full h-64 text-xs font-mono">
                  <ResponsiveContainer width="95%" height="100%">
                    {experiment.graphConfig.type === 'line' ? (
                      <LineChart data={experiment.tableData.rows.map(row => {
                        const formatted: Record<string, any> = {};
                        experiment.tableData.headers.forEach(h => {
                          formatted[h] = parseFloat(row[h]);
                        });
                        return formatted;
                      })} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey={experiment.graphConfig.xKey} 
                          label={{ value: experiment.graphConfig.xAxisLabel || experiment.graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }} 
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <YAxis 
                          label={{ value: experiment.graphConfig.yAxisLabel || experiment.graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey={experiment.graphConfig.yKey} 
                          stroke={experiment.graphConfig.lineColor} 
                          strokeWidth={2} 
                          name={`${experiment.graphConfig.yKey}`}
                        />
                      </LineChart>
                    ) : experiment.graphConfig.type === 'bar' ? (
                      <BarChart data={experiment.tableData.rows.map(row => {
                        const formatted: Record<string, any> = {};
                        experiment.tableData.headers.forEach(h => {
                          formatted[h] = parseFloat(row[h]);
                        });
                        return formatted;
                      })} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey={experiment.graphConfig.xKey} 
                          label={{ value: experiment.graphConfig.xAxisLabel || experiment.graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }}
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <YAxis 
                          label={{ value: experiment.graphConfig.yAxisLabel || experiment.graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <Tooltip />
                        <Bar 
                          dataKey={experiment.graphConfig.yKey} 
                          fill={experiment.graphConfig.lineColor} 
                        />
                      </BarChart>
                    ) : (
                      <ScatterChart data={experiment.tableData.rows.map(row => {
                        const formatted: Record<string, any> = {};
                        experiment.tableData.headers.forEach(h => {
                          formatted[h] = parseFloat(row[h]);
                        });
                        return formatted;
                      })} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey={experiment.graphConfig.xKey} 
                          type="number"
                          label={{ value: experiment.graphConfig.xAxisLabel || experiment.graphConfig.xKey, position: 'bottom', offset: 0, style: { fontSize: '10px', fill: '#64748b' } }}
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <YAxis 
                          dataKey={experiment.graphConfig.yKey} 
                          type="number"
                          label={{ value: experiment.graphConfig.yAxisLabel || experiment.graphConfig.yKey, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '10px', fill: '#64748b' } }}
                          tick={{ fill: '#475569', fontSize: '9px' }}
                        />
                        <Tooltip />
                        <Scatter 
                          data={experiment.tableData.rows.map(row => {
                            const formatted: Record<string, any> = {};
                            experiment.tableData.headers.forEach(h => {
                              formatted[h] = parseFloat(row[h]);
                            });
                            return formatted;
                          })}
                          fill={experiment.graphConfig.lineColor} 
                        />
                      </ScatterChart>
                    )}
                  </ResponsiveContainer>
                </div>
                
                <span className="text-[10px] text-slate-400 italic text-center mt-3 font-medium">
                  Fig.1: Experimental plotting curve showing relations of logged metrics.
                </span>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">8. Scientific Analysis \\& Regression</h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line text-justify font-serif">
                {report ? (
                  renderLaTeXText(report.analysis)
                ) : (
                  <p className="text-slate-400 italic text-xs">Trend verification in progress.</p>
                )}
              </div>
            </div>

            {/* Practical Image interpretation if present */}
            {experiment.imageBase64 && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-mono">Attachment Figure Proof</span>
                <img 
                  src={experiment.imageBase64} 
                  alt="Aesthetic physical verification screenshot" 
                  className="max-h-72 object-contain rounded-xl border mx-auto bg-white p-2 shadow-sm"
                />
                <p className="text-xs text-center text-slate-500 italic max-w-md mx-auto">
                  Laboratory screenshot/apparatus reference uploaded by student. Automatically inspected and parsed by the model.
                </p>
              </div>
            )}

            {/* Results */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">9. Quantitative Experimental Results</h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line font-serif">
                {report ? (
                  renderLaTeXText(report.results)
                ) : (
                  <p className="text-slate-400 italic text-xs">Summary calculations in progress.</p>
                )}
              </div>
            </div>

            {/* Conclusion */}
            <div className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-150 pb-1 uppercase tracking-tight">10. Conclusion</h2>
              <p className="text-sm leading-relaxed text-slate-750 font-serif whitespace-pre-line text-justify">
                {report ? report.conclusion : 'Conclusion statement in compile pipeline.'}
              </p>
            </div>

            {/* Improvement Suggestions */}
            {report && report.improvements && (
              <div className="space-y-2">
                <h2 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-155 pb-1 uppercase tracking-tight">11. Improvement Suggestions</h2>
                <ul className="space-y-1.5 text-xs">
                  {report.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed p-2.5 bg-slate-55 rounded-lg border border-slate-100">
                      <span className="font-mono font-bold text-indigo-600 shrink-0">11.{idx+1}</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* INTERACTIVE VIVA PREPARATION ROOM */}
          {report && report.vivaQuestions && report.vivaQuestions.length > 0 && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-850 shadow-md space-y-4 print:hidden">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">Interactive Viva-Voce Prep Room</h3>
                  <p className="text-xs text-slate-400 font-normal">Expand each common defense question to reveal the deep scientific model answer.</p>
                </div>
              </div>

              <div className="space-y-3">
                {report.vivaQuestions.map((viva, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-850 transition">
                    <button
                      onClick={() => toggleViva(idx)}
                      className="w-full p-4 flex items-center justify-between text-left gap-3 text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      <span className="leading-snug text-slate-100 flex items-start gap-2">
                        <span className="text-indigo-400 font-mono">Q{idx+1}:</span> {viva.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${expandedViva[idx] ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedViva[idx] && (
                      <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                        <span className="font-mono text-emerald-400 font-bold block mb-1">Model Answer:</span>
                        {viva.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
