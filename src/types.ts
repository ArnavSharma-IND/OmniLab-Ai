/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DataRow {
  [key: string]: string;
}

export interface TableData {
  headers: string[];
  rows: DataRow[];
}

export interface GraphConfig {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  type: 'line' | 'bar' | 'scatter';
  xKey: string;
  yKey: string;
  showGrid: boolean;
  lineColor: string;
}

export interface LabExperiment {
  id: string;
  title: string;
  subject: string;
  date: string;
  aim: string;
  apparatus: string[];
  procedure: string[];
  rawObservationsMarkdown: string;
  tableData: TableData;
  graphConfig: GraphConfig;
  imageBase64?: string;
  imageName?: string;
}

export interface VivaQuestion {
  question: string;
  answer: string;
}

export interface ErrorParameter {
  parameter: string;
  uncertainty: string;
  explanation: string;
}

export interface StatisticalCalculation {
  metric: string;
  value: string;
  formula: string;
}

export interface GeneratedReport {
  theory: string;
  calculations: string;
  analysis: string;
  results: string;
  conclusion: string;
  vivaQuestions: VivaQuestion[];
  improvements: string[];
  errorAnalysis: ErrorParameter[];
  statisticalCalculations: StatisticalCalculation[];
}

export interface SavedReport {
  id: string;
  experiment: LabExperiment;
  generated?: GeneratedReport;
  createdAt: string;
}
