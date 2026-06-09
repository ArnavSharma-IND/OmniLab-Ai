/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LabExperiment, TableData } from '../types';
import { parseCSV } from '../utils';
import { 
  Plus, 
  Trash2, 
  Upload, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Layers, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ReportFormProps {
  experiment: LabExperiment;
  onChange: (updated: LabExperiment) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onLoadTemplate: (id: string) => void;
  templates: LabExperiment[];
}

export default function ReportForm({ 
  experiment, 
  onChange, 
  onGenerate, 
  isLoading, 
  onLoadTemplate,
  templates 
}: ReportFormProps) {
  const [newApparatus, setNewApparatus] = useState('');
  const [newProcedure, setNewProcedure] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Subject folders configuration
  const subjects = [
    "Applied Physics", 
    "Analytical Chemistry", 
    "Electrical Engineering", 
    "Mechanical Engineering", 
    "Civil Engineering",
    "General STEM"
  ];

  // Apparatus tag management
  const addApparatus = () => {
    if (newApparatus.trim() && !experiment.apparatus.includes(newApparatus.trim())) {
      onChange({
        ...experiment,
        apparatus: [...experiment.apparatus, newApparatus.trim()]
      });
      setNewApparatus('');
    }
  };

  const removeApparatus = (item: string) => {
    onChange({
      ...experiment,
      apparatus: experiment.apparatus.filter(a => a !== item)
    });
  };

  // Procedure steps management
  const addProcedureStep = () => {
    if (newProcedure.trim()) {
      onChange({
        ...experiment,
        procedure: [...experiment.procedure, newProcedure.trim()]
      });
      setNewProcedure('');
    }
  };

  const removeProcedureStep = (index: number) => {
    onChange({
      ...experiment,
      procedure: experiment.procedure.filter((_, i) => i !== index)
    });
  };

  // Spreadsheet Cell Editing
  const updateCell = (rowIndex: number, colHeader: string, value: string) => {
    const updatedRows = [...experiment.tableData.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [colHeader]: value
    };
    onChange({
      ...experiment,
      tableData: {
        ...experiment.tableData,
        rows: updatedRows
      }
    });
  };

  // Add Column
  const [newColumnHeader, setNewColumnHeader] = useState('');
  const addColumn = () => {
    const col = newColumnHeader.trim().replace(/\s+/g, '_');
    if (col && !experiment.tableData.headers.includes(col)) {
      const updatedHeaders = [...experiment.tableData.headers, col];
      const updatedRows = experiment.tableData.rows.map(row => ({
        ...row,
        [col]: '0'
      }));
      onChange({
        ...experiment,
        tableData: {
          headers: updatedHeaders,
          rows: updatedRows
        },
        // Automatically default xKey or yKey if empty
        graphConfig: {
          ...experiment.graphConfig,
          xKey: experiment.graphConfig.xKey || col,
          yKey: experiment.graphConfig.yKey || col
        }
      });
      setNewColumnHeader('');
    }
  };

  // Remove Column
  const removeColumn = (header: string) => {
    const updatedHeaders = experiment.tableData.headers.filter(h => h !== header);
    const updatedRows = experiment.tableData.rows.map(row => {
      const copy = { ...row };
      delete copy[header];
      return copy;
    });
    
    onChange({
      ...experiment,
      tableData: {
        headers: updatedHeaders,
        rows: updatedRows
      },
      graphConfig: {
        ...experiment.graphConfig,
        xKey: experiment.graphConfig.xKey === header ? (updatedHeaders[0] || '') : experiment.graphConfig.xKey,
        yKey: experiment.graphConfig.yKey === header ? (updatedHeaders[1] || updatedHeaders[0] || '') : experiment.graphConfig.yKey
      }
    });
  };

  // Add Row
  const addGridRow = () => {
    const newRow: Record<string, string> = {};
    experiment.tableData.headers.forEach(h => {
      newRow[h] = '0';
    });
    onChange({
      ...experiment,
      tableData: {
        ...experiment.tableData,
        rows: [...experiment.tableData.rows, newRow]
      }
    });
  };

  // Remove Row
  const removeGridRow = (index: number) => {
    onChange({
      ...experiment,
      tableData: {
        ...experiment.tableData,
        rows: experiment.tableData.rows.filter((_, i) => i !== index)
      }
    });
  };

  // CSV Drag and Drop / File Handling
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = parseCSV(event.target?.result as string);
          if (parsed.headers.length === 0) {
            setCsvError('No valid rows or columns found in CSV.');
            return;
          }
          onChange({
            ...experiment,
            tableData: parsed,
            graphConfig: {
              ...experiment.graphConfig,
              xKey: parsed.headers[0] || '',
              yKey: parsed.headers[1] || parsed.headers[0] || ''
            }
          });
          setCsvError(null);
        } catch (err) {
          setCsvError('Failed to parse CSV. Make sure it has a comma-separated format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Image base64 encoder
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...experiment,
          imageBase64: reader.result as string,
          imageName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onChange({
      ...experiment,
      imageBase64: undefined,
      imageName: undefined
    });
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="lab-report-editor">
      
      {/* Subject Templates Shortcut */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Click to load Academic Experiment Templates:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map(tmpl => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onLoadTemplate(tmpl.id)}
              className={`p-3 text-left rounded-xl border text-xs transition duration-200 ${
                experiment.id === tmpl.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-900 line-clamp-1">{tmpl.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{tmpl.subject}</div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Main Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Subject Category</label>
          <select
            value={experiment.subject}
            onChange={(e) => onChange({ ...experiment, subject: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Experiment Title</label>
          <input
            type="text"
            value={experiment.title}
            onChange={(e) => onChange({ ...experiment, title: e.target.value })}
            placeholder="e.g., Verification of Ohm's Law and Resistivity Determination"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Main Objective / Aim</label>
        <textarea
          rows={2}
          value={experiment.aim}
          onChange={(e) => onChange({ ...experiment, aim: e.target.value })}
          placeholder="To verify Ohm's law, determine the resistance of a constantan wire specimen..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
        />
      </div>

      {/* Apparatus manager */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Apparatus / Equipment Used</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newApparatus}
            onChange={(e) => setNewApparatus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApparatus())}
            placeholder="Add piece of apparatus (e.g. Voltmeter LC = 0.01V)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
          />
          <button
            type="button"
            onClick={addApparatus}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {experiment.apparatus.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No apparatus added yet.</span>
          ) : (
            experiment.apparatus.map((item, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                {item}
                <button 
                  type="button" 
                  onClick={() => removeApparatus(item)}
                  className="text-slate-400 hover:text-indigo-650 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Procedure Manager */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Procedure steps</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newProcedure}
            onChange={(e) => setNewProcedure(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProcedureStep())}
            placeholder="Add logical experimental step..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
          />
          <button
            type="button"
            onClick={addProcedureStep}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <ol className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {experiment.procedure.length === 0 ? (
            <li className="text-xs text-slate-400 italic">No experimental steps logged.</li>
          ) : (
            experiment.procedure.map((step, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700"
              >
                <span className="font-mono font-bold bg-slate-200 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1 leading-relaxed">{step}</span>
                <button 
                  type="button" 
                  onClick={() => removeProcedureStep(index)}
                  className="text-slate-400 hover:text-indigo-650 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))
          )}
        </ol>
      </div>

      <hr className="border-slate-100" />

      {/* Dynamic Spreadsheet observations & CSV upload */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Observations & Measurements Dataset
            </h4>
            <p className="text-xs text-slate-500">Edit values below or import a numeric laboratory CSV dataset.</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleCSVUpload} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" /> Import CSV
            </button>
          </div>
        </div>

        {csvError && (
          <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg">
            {csvError}
          </div>
        )}

        {/* Dynamic Column and grid generator */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-slate-600">New Parameter column:</span>
            <input 
              type="text"
              value={newColumnHeader}
              onChange={(e) => setNewColumnHeader(e.target.value)}
              placeholder="e.g. Current_A, Temp_C"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none w-32"
            />
            <button
              type="button"
              onClick={addColumn}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1 transition text-slate-920"
            >
              <Plus className="w-3.5 h-3.5" /> Add Column
            </button>
          </div>
        </div>

        {/* Data spreadsheet grid wrapper */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {experiment.tableData.headers.map(header => (
                  <th key={header} className="p-2 text-xs font-semibold text-slate-700 min-w-32">
                    <div className="flex items-center justify-between gap-2 group">
                      <span className="font-mono">{header}</span>
                      <button 
                        type="button"
                        onClick={() => removeColumn(header)}
                        className="text-slate-400 hover:text-indigo-600 transition"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {experiment.tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50 transition">
                  {experiment.tableData.headers.map(header => (
                    <td key={header} className="p-1">
                      <input 
                        type="text"
                        value={row[header] ?? ''}
                        onChange={(e) => updateCell(rowIndex, header, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none rounded transition"
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center font-mono">
                    <button 
                      type="button"
                      onClick={() => removeGridRow(rowIndex)}
                      className="text-slate-400 hover:text-indigo-650 p-1.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {experiment.tableData.rows.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400 italic">No measurement rows added.</div>
          )}
        </div>

        <button
          type="button"
          onClick={addGridRow}
          className="mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-500" /> Add Row
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* Standard base64 laboratory / apparatus graphics uploader */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          Laboratory Photo / Setup Image (Optional)
        </h4>
        <p className="text-xs text-slate-500 mb-4 font-normal">
          Upload any oscilloscope plot, physical calibration apparatus setup, or data chart image.
          The AI will read and evaluate this visual material directly inside your report calculations!
        </p>

        {experiment.imageBase64 ? (
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
            <img 
              src={experiment.imageBase64} 
              alt="Raw laboratory observation" 
              className="w-16 h-16 object-cover rounded-lg border border-slate-300" 
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{experiment.imageName || 'lab_snapshot.png'}</div>
              <div className="text-[10px] text-slate-400 mt-1">Ready for Gemini Vision parsing</div>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-white text-slate-400 hover:text-indigo-600 rounded-full border shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400/50 cursor-pointer bg-slate-50 rounded-xl p-6 text-center transition"
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={imageInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-700">Drop your experimental setup photo or click to browse</div>
            <div className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, or WEBP formats</div>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Qualitative Raw Text Notes & Observations */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Qualitative Laboratory Notes & Observations</label>
        <textarea
          rows={3}
          value={experiment.rawObservationsMarkdown}
          onChange={(e) => onChange({ ...experiment, rawObservationsMarkdown: e.target.value })}
          placeholder="e.g. Constantan wire diameter felt warm to touch after reading #6. Resistance was verified at room temperature of 26°C with standard humidity, Screw gauge was standard digital model..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none text-sm text-slate-800 bg-slate-50"
        />
      </div>

      {/* CTA Section */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          * Powered securely by server-side Gemini 3.5 Models
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || experiment.tableData.rows.length === 0}
          className={`px-6 py-3.5 rounded font-bold text-sm tracking-wide shadow-lg transition duration-300 flex items-center gap-2 ${
            isLoading || experiment.tableData.rows.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-300/30'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 
          {isLoading ? 'REVIEWING & COMPILING...' : 'GENERATE PROFESSIONAL REPORT'}
        </button>
      </div>

    </div>
  );
}
