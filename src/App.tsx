/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LabExperiment, GeneratedReport, SavedReport } from './types';
import { DEFAULT_TEMPLATES } from './utils';
import ReportForm from './components/ReportForm';
import GraphEngine from './components/GraphEngine';
import AcademicReport from './components/AcademicReport';
import { 
  Sparkles, 
  FlaskConical, 
  History, 
  Layers, 
  FolderLock, 
  BookOpenCheck,
  GraduationCap,
  Bookmark,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Printer,
  Compass,
  Trash2,
  Info
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // Master Experiment State - initialized with the physics simple pendulum template by default
  const [experiment, setExperiment] = useState<LabExperiment>({
    ...JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[0])),
    date: new Date().toISOString().split('T')[0]
  });

  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student portfolio / history persistence
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const userEmail = "arnav.sharma9051@gmail.com";

  // Load portfolio from LocalStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('engineering_lab_reports_v1');
      if (cached) {
        setSavedReports(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read past laboratory index:', e);
    }
  }, []);

  // Save portfolio to LocalStorage
  const persistReports = (list: SavedReport[]) => {
    setSavedReports(list);
    try {
      localStorage.setItem('engineering_lab_reports_v1', JSON.stringify(list));
    } catch (e) {
      console.error('Could not save laboratory to disk:', e);
    }
  };

  // Loads a pre-built template
  const handleLoadTemplate = (id: string) => {
    // Locate the template
    const template = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (template) {
      setExperiment({
        ...JSON.parse(JSON.stringify(template)),
        id: `${id}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      });
      setGeneratedReport(undefined);
      setErrorMsg(null);
    }
  };

  // Reset current draft back to blank slate
  const handleResetDraft = () => {
    setExperiment({
      id: `custom-${Date.now()}`,
      title: "New Quantitative Physics Investigation",
      subject: "Applied Physics",
      date: new Date().toISOString().split('T')[0],
      aim: "To determine fundamental properties and verify empirical constants of the specimen...",
      apparatus: ["Digital Multimeter", "Calibrated Rules"],
      procedure: ["Calibrate measuring instrument limits", "Log raw observation samples in coordinate rows"],
      rawObservationsMarkdown: "Recorded at standard room temp ~25°C.",
      tableData: {
        headers: ["Independent_x", "Dependent_y"],
        rows: [
          { "Independent_x": "1", "Dependent_y": "1.2" },
          { "Independent_x": "2", "Dependent_y": "2.1" },
          { "Independent_x": "3", "Dependent_y": "2.9" }
        ]
      },
      graphConfig: {
        title: "Experimental Metric Correlation",
        xAxisLabel: "Independent Property (x)",
        yAxisLabel: "Dependent Property (y)",
        type: "line",
        xKey: "Independent_x",
        yKey: "Dependent_y",
        showGrid: true,
        lineColor: "#3b82f6"
      }
    });
    setGeneratedReport(undefined);
    setErrorMsg(null);
  };

  // Save compiled report to Local Student Drive
  const handleSaveToDrive = () => {
    const isExisting = savedReports.some(r => r.id === experiment.id);
    let updated: SavedReport[];

    const newReportRecord: SavedReport = {
      id: experiment.id,
      experiment: experiment,
      generated: generatedReport,
      createdAt: new Date().toLocaleString()
    };

    if (isExisting) {
      updated = savedReports.map(r => r.id === experiment.id ? newReportRecord : r);
    } else {
      updated = [newReportRecord, ...savedReports];
    }

    persistReports(updated);
  };

  // Delete from portfolio
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedReports.filter(r => r.id !== id);
    persistReports(updated);
  };

  // Load a report from portfolio
  const handleLoadSavedReport = (saved: SavedReport) => {
    setExperiment(saved.experiment);
    setGeneratedReport(saved.generated);
    setErrorMsg(null);
    setShowHistory(false);
  };

  // Handle server-side Gemini generation trigger
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: experiment.title,
          subject: experiment.subject,
          aim: experiment.aim,
          apparatus: experiment.apparatus,
          procedure: experiment.procedure,
          rawObservationsMarkdown: experiment.rawObservationsMarkdown,
          tableData: experiment.tableData,
          imageBase64: experiment.imageBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server responded with a non-OK status');
      }

      const reportData: GeneratedReport = await response.json();
      setGeneratedReport(reportData);

      // Auto-save the compiled report to portfolio
      const isExisting = savedReports.some(r => r.id === experiment.id);
      const newRecord: SavedReport = {
        id: experiment.id,
        experiment: experiment,
        generated: reportData,
        createdAt: new Date().toLocaleString()
      };
      persistReports(isExisting ? savedReports.map(r => r.id === experiment.id ? newRecord : r) : [newRecord, ...savedReports]);

    } catch (err: any) {
      console.error('API Error compilation:', err);
      setErrorMsg(err.message || 'Unable to connect to model server. Confirm you have defined GEMINI_API_KEY in secrets.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-indigo-500/10 selection:text-indigo-600 antialiased" id="main-application-frame">
      
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-200 z-40 navbar print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/15">
              Ω
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-tight text-slate-800 block uppercase">OmniLab AI</span>
              <span className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">Lab Report Assistant</span>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              Student Portfolio ({savedReports.length})
            </button>
            <button
              onClick={handleResetDraft}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center gap-1 transition"
              title="Clear active inputs and start a fresh laboratory report template"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

        </div>
      </header>

      {/* Primary Layout Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Hero Callout */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10 border border-slate-800 print:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" /> Academic Lab Reporter
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-extrabold tracking-tight">
              Create Peer-Review Standard Laboratory Manuscripts Instantly
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
              Engineering students, paste raw measurements, plot interactive scientific graph parameters, 
              upload bench equipment visuals, and utilize Gemini to generate LaTeX-compliant formula calculations, 
              viva preparation aids, and rigorous error analyses.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-sm text-rose-800 tracking-wide items-start print:hidden">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Compilation/Server connection interrupted:</div>
              <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Main interactive split work areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* L: Input forms & spreadsheet */}
          <div className="space-y-8 print:hidden">
            <div className="flex items-center gap-2 px-1">
              <Compass className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stage 1: Observation Entry & Config</h3>
            </div>
            
            <ReportForm 
              experiment={experiment} 
              onChange={setExperiment}
              onGenerate={handleGenerateReport}
              isLoading={isLoading}
              onLoadTemplate={handleLoadTemplate}
              templates={DEFAULT_TEMPLATES}
            />

            <GraphEngine 
              experiment={experiment}
              onChange={setExperiment}
            />
          </div>

          {/* R: Generated paper / preview */}
          <div className="space-y-8" id="report-output-viewport">
            <div className="flex items-center justify-between px-1 print:hidden">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stage 2: Academic Manuscript Output</h3>
              </div>
              {generatedReport && (
                <button
                  onClick={handleSaveToDrive}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
                >
                  <Bookmark className="w-4.5 h-4.5" /> Keep in Portfolio
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-4 print:hidden">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-serif text-lg font-bold">
                    g
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Compiling Mathematical Models...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Gemini is processing your observation table columns, evaluating least-counts, 
                    structuring standard LaTeX equations, and preparing oral mock defense questions.
                  </p>
                </div>
              </div>
            ) : (
              <AcademicReport 
                experiment={experiment}
                report={generatedReport}
                userEmail={userEmail}
              />
            )}
          </div>

        </div>

      </main>

      {/* PORTFOLIO DRAWER MODAL */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end print:hidden">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between"
            >
              
              <div className="space-y-6 overflow-hidden flex flex-col h-full mb-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-extrabold uppercase text-slate-900">Student Portfolio</h3>
                      <p className="text-[10px] text-slate-500">History of compiled lab reports saved in index.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1 rounded"
                  >
                    Close
                  </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {savedReports.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <FolderLock className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs italic">Your portfolio drive is empty. Create and generate a report and save to portfolio!</p>
                    </div>
                  ) : (
                    savedReports.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadSavedReport(item)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer transition flex items-start justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-indigo-600 uppercase block tracking-wider">{item.experiment.subject}</span>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition">{item.experiment.title}</h4>
                          <span className="text-[9px] text-slate-400 block mt-1 font-mono">{item.createdAt}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteReport(item.id, e)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Drawer footer info */}
              <div className="border-t pt-4 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Synchronized cleanly to client local state.</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled print footer */}
      <footer className="bg-white border-t border-slate-200 py-8 relative print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-widest block">AI Academic Lab Reporter v1.0.0</span>
          <span className="text-[10px] text-slate-400 block">Designed for rigorous engineering experiment evaluation and viva examination prep.</span>
        </div>
      </footer>

    </div>
  );
}
