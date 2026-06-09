/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TableData, LabExperiment } from './types';

// Simple CSV line parser
export function parseCSV(text: string): TableData {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

// Converts a TableData object back to a CSV string
export function convertToCSV(data: TableData): string {
  if (!data || !data.headers || data.headers.length === 0) return '';
  const headerLine = data.headers.join(',');
  const rowLines = data.rows.map(row => 
    data.headers.map(header => row[header] ?? '').join(',')
  );
  return [headerLine, ...rowLines].join('\n');
}

// Computes essential statistics for numerical data in a column
export interface ColumnStats {
  count: number;
  mean: number;
  min: number;
  max: number;
  variance: number;
  stdDev: number;
  stdError: number;
}

export function calculateColumnStats(rows: Record<string, string>[], key: string): ColumnStats | null {
  const numericValues = rows
    .map(row => parseFloat(row[key]))
    .filter(val => !isNaN(val));

  if (numericValues.length === 0) return null;

  const count = numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const sqDiffSum = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = count > 1 ? sqDiffSum / (count - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const stdError = Math.sqrt(variance) / Math.sqrt(count);

  return {
    count,
    mean,
    min,
    max,
    variance,
    stdDev,
    stdError
  };
}

// Default experiment templates
export const DEFAULT_TEMPLATES: LabExperiment[] = [
  {
    id: 'ohms-law',
    title: "Verification of Ohm's Law and Resistivity Determination",
    subject: "Electrical Engineering",
    date: new Date().toISOString().split('T')[0],
    aim: "To verify Ohm's law, determine the resistance of a given wire specimen, and calculate its material resistivity.",
    apparatus: [
      "DC Power Supply (0-15V)",
      "Ammeter (0-1.5A)",
      "Voltmeter (0-10V)",
      "Slide-wire Rheostat",
      "Specimen Constantan Wire (L = 1.0 m, D = 0.45 mm)",
      "Standard Connection Wires",
      "Digital Screw Gauge"
    ],
    procedure: [
      "Connect the DC power supply, specimen wire, rheostat, and ammeter in a series loop configuration.",
      "Connect the high-impedance voltmeter in parallel directly across the terminals of the specimen wire.",
      "Switch on the power supply and adjust the slide-rheostat to minimum resistance.",
      "Gradually slide the rheostat to increase current. For each step, read and record the voltage (V) on the voltmeter and current (I) on the ammeter.",
      "Measure the diameter of the Constantine wire specimens at 3 distinct points using a calibrated screw gauge.",
      "Calculate the slope of the voltage-current graph to determine resistivity."
    ],
    rawObservationsMarkdown: "The wire SPECIMEN is Constantan alloy.\nLength = 100 cm exactly (0.01 m error).\nScrew gauge readings for wire diameter: 0.44mm, 0.46mm, 0.45mm. Mean diameter = 0.45 mm.\nRoom temperature was ~26 degrees celsius.",
    tableData: {
      headers: ["Current_I_A", "Voltage_V", "Calculated_R_ohms"],
      rows: [
        { "Current_I_A": "0.10", "Voltage_V": "0.31", "Calculated_R_ohms": "3.10" },
        { "Current_I_A": "0.20", "Voltage_V": "0.62", "Calculated_R_ohms": "3.10" },
        { "Current_I_A": "0.30", "Voltage_V": "0.91", "Calculated_R_ohms": "3.03" },
        { "Current_I_A": "0.40", "Voltage_V": "1.24", "Calculated_R_ohms": "3.10" },
        { "Current_I_A": "0.50", "Voltage_V": "1.52", "Calculated_R_ohms": "3.04" },
        { "Current_I_A": "0.60", "Voltage_V": "1.85", "Calculated_R_ohms": "3.08" },
        { "Current_I_A": "0.70", "Voltage_V": "2.18", "Calculated_R_ohms": "3.11" },
        { "Current_I_A": "0.80", "Voltage_V": "2.46", "Calculated_R_ohms": "3.08" }
      ]
    },
    graphConfig: {
      title: "V-I Characteristic curve of Specimen Wire",
      xAxisLabel: "Current (Amperes)",
      yAxisLabel: "Voltage (Volts)",
      type: "scatter",
      xKey: "Current_I_A",
      yKey: "Voltage_V",
      showGrid: true,
      lineColor: "#f43f5e"
    }
  },
  {
    id: 'simple-pendulum',
    title: "Acceleration due to Gravity Using a Simple Pendulum",
    subject: "Applied Physics",
    date: new Date().toISOString().split('T')[0],
    aim: "To determine the acceleration due to gravity (g) using a simple pendulum apparatus and analyze random measurement errors in time period.",
    apparatus: [
      "Heavy brass spherical bob",
      "Fine cotton suspension thread",
      "Split cork clamp and Stand",
      "Digital Stop Watch (Least count = 0.01 seconds)",
      "Vernier Calipers (Least count = 0.1 mm)",
      "Standard Meter Scale"
    ],
    procedure: [
      "Measure the diameter of the spherical brass bob using the Vernier calipers to determine its radius (r).",
      "Attach cotton cord to split cork clamp. Measure exact string lengths (L_string) from clamp base to top of bob.",
      "Effective length of pendulum L is computed as L = L_string + r.",
      "Displace the pendulum bob from rest position by a small angular displacement (theta < 5 degrees) and release.",
      "Discard first 2 oscillations. Start stop watch and count time for 20 completed oscillations.",
      "Repeat the oscillation measurements for at least five different lengths of string to establish linear gravity models."
    ],
    rawObservationsMarkdown: "Bob diameter d = 2.00 cm, so radius r = 1.00 cm (0.01 m).\nLeast count of Stopwatch = 0.01s\nLeast count of Meter Scale = 1 mm.",
    tableData: {
      headers: ["StringLength_cm", "TotalTime_20Osc_s", "TimePeriod_T_s", "T_squared_s2"],
      rows: [
        { "StringLength_cm": "40.0", "TotalTime_20Osc_s": "25.75", "TimePeriod_T_s": "1.288", "T_squared_s2": "1.658" },
        { "StringLength_cm": "50.0", "TotalTime_20Osc_s": "28.52", "TimePeriod_T_s": "1.426", "T_squared_s2": "2.033" },
        { "StringLength_cm": "60.0", "TotalTime_20Osc_s": "31.36", "TimePeriod_T_s": "1.568", "T_squared_s2": "2.459" },
        { "StringLength_cm": "70.0", "TotalTime_20Osc_s": "33.91", "TimePeriod_T_s": "1.696", "T_squared_s2": "2.875" },
        { "StringLength_cm": "80.0", "TotalTime_20Osc_s": "36.20", "TimePeriod_T_s": "1.810", "T_squared_s2": "3.276" },
        { "StringLength_cm": "90.0", "TotalTime_20Osc_s": "38.30", "TimePeriod_T_s": "1.915", "T_squared_s2": "3.667" }
      ]
    },
    graphConfig: {
      title: "Time Period Squared vs. Effective Length",
      xAxisLabel: "Effective Pendulum Length L (cm)",
      yAxisLabel: "T² (seconds squared)",
      type: "line",
      xKey: "StringLength_cm",
      yKey: "T_squared_s2",
      showGrid: true,
      lineColor: "#3b82f6"
    }
  },
  {
    id: 'acid-base-titration',
    title: "Acid-Base Titration & pH Curve Analysis",
    subject: "Analytical Chemistry",
    date: new Date().toISOString().split('T')[0],
    aim: "To determine the exact molar concentration of an unknown hydrochloric acid (HCl) sample by titrating with standard 0.1 M Sodium Hydroxide (NaOH) and mapping the neutralization pH curve.",
    apparatus: [
      "Calibrated 50 mL burette (LC = 0.1 mL)",
      "Volumetric pipette 10 mL",
      "Erlenmeyer Flask (250 mL)",
      "Digital pH Meter with glass electrode",
      "Magnetic Stirrer plate"
    ],
    procedure: [
      "Pipette exactly 10.0 mL of unknown concentration HCl into the Erlenmeyer flask. Add standard indicator.",
      "Fill the burette with 0.100 M sodium hydroxide solution.",
      "Calibrate the digital pH electrode with standard buffering capsules (pH 4.0 and 7.0). Place probe into flask.",
      "Titrate the KOH/NaOH into acidic tube. Add NaOH in 1.0 mL increments. Stir continually and record chemical pH.",
      "Near expected equivalence point (~7-12 mL), decrease NaOH additions to drops (0.2 mL) to closely plot transition curve."
    ],
    rawObservationsMarkdown: "Acid volume Pipetted = 10.00 mL HCl\nBurette solution concentration of NaOH = 0.100 M\nIndicator used: Phenolphthalein. Equivalence was marked by a sharp pink color change.",
    tableData: {
      headers: ["Volume_NaOH_added_mL", "Measured_pH", "dp_Over_dV"],
      rows: [
        { "Volume_NaOH_added_mL": "0.0", "Measured_pH": "1.20", "dp_Over_dV": "0.0" },
        { "Volume_NaOH_added_mL": "2.0", "Measured_pH": "1.32", "dp_Over_dV": "0.06" },
        { "Volume_NaOH_added_mL": "4.0", "Measured_pH": "1.48", "dp_Over_dV": "0.08" },
        { "Volume_NaOH_added_mL": "6.0", "Measured_pH": "1.70", "dp_Over_dV": "0.11" },
        { "Volume_NaOH_added_mL": "8.0", "Measured_pH": "2.10", "dp_Over_dV": "0.20" },
        { "Volume_NaOH_added_mL": "9.0", "Measured_pH": "2.50", "dp_Over_dV": "0.40" },
        { "Volume_NaOH_added_mL": "9.5", "Measured_pH": "3.10", "dp_Over_dV": "1.20" },
        { "Volume_NaOH_added_mL": "10.0", "Measured_pH": "7.00", "dp_Over_dV": "7.80" },
        { "Volume_NaOH_added_mL": "10.5", "Measured_pH": "10.90", "dp_Over_dV": "7.80" },
        { "Volume_NaOH_added_mL": "11.0", "Measured_pH": "11.50", "dp_Over_dV": "1.20" },
        { "Volume_NaOH_added_mL": "12.0", "Measured_pH": "12.10", "dp_Over_dV": "0.60" },
        { "Volume_NaOH_added_mL": "14.0", "Measured_pH": "12.50", "dp_Over_dV": "0.20" }
      ]
    },
    graphConfig: {
      title: "Acid-Base Neutralization Titration pH Curve",
      xAxisLabel: "Volume of 0.1M NaOH Added (mL)",
      yAxisLabel: "Measured Solution pH",
      type: "line",
      xKey: "Volume_NaOH_added_mL",
      yKey: "Measured_pH",
      showGrid: true,
      lineColor: "#10b981"
    }
  }
];
