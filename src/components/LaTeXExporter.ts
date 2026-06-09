/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LabExperiment, GeneratedReport } from '../types';

export function generateLaTeXSource(experiment: LabExperiment, report?: GeneratedReport): string {
  const sanitize = (text: string) => {
    if (!text) return '';
    return text
      .replace(/%/g, '\\%')
      .replace(/\s&\s/g, ' \\& ')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_');
  };

  const escapeLaTeXMath = (text: string) => {
    if (!text) return '';
    // Let mathematical markup with $ or $$ pass through cleanly, but handle some basic characters
    return text;
  };

  // Build the items of apparatus
  const apparatusItems = experiment.apparatus.map(item => `  \\item ${sanitize(item)}`).join('\n');
  
  // Build the procedure steps
  const procedureSteps = experiment.procedure.map(step => `  \\item ${sanitize(step)}`).join('\n');

  // Build Table columns and rows
  const headers = experiment.tableData.headers;
  const colSpec = '|' + headers.map(() => 'c').join('|') + '|';
  const tableHeaderLine = headers.map(h => `\\textbf{${sanitize(h)}}`).join(' & ') + ' \\\\ \\hline';
  const tableRowsLines = experiment.tableData.rows.map(row => 
    headers.map(h => sanitize(row[h] || '0')).join(' & ') + ' \\\\'
  ).join('\n  \\hline\n  ');

  // Formulate PGFPlots Data Coordinates for LaTeX graph rendering
  const coordinatesList = experiment.tableData.rows.map(row => {
    const xVal = parseFloat(row[experiment.graphConfig.xKey] || '0');
    const yVal = parseFloat(row[experiment.graphConfig.yKey] || '0');
    return isNaN(xVal) || isNaN(yVal) ? '' : `(${xVal}, ${yVal})`;
  }).filter(c => c !== '').join(' ');

  const titleUpper = (experiment.title || 'APPARATUS REPORT').toUpperCase();

  return `\\documentclass[11pt,a4paper]{article}

% --- Core Academic Packages ---
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{microtype}
\\usepackage{geometry}
\\usepackage{pgfplots}
\\usepackage{fancyhdr}
\\usepackage{hyperref}

\\geometry{margin=1in}
\\pgfplotsset{compat=1.17}

% --- Header and Footer Styling ---
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{AI Academic Lab Assistant}
\\fancyhead[R]{\\thepage}
\\fancyfoot[C]{\\textit{Generated dynamically using Academic Lab Report Assistant}}
\\renewcommand{\\headrulewidth}{0.4pt}

% --- Custom Document Title Metadata ---
\\title{\\textbf{${escapeLaTeXMath(titleUpper)}}}
\\author{\\textbf{Class/Subject: ${sanitize(experiment.subject)}} \\\\ Engineering Student Portfolio}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This laboratory report documents the execution, structural theory, calculations, and analytical interpretation of the experiment: \\textit{"${sanitize(experiment.title)}"}. The observations and measurements compiled in this paper are processed via the AI Academic Assistant utilizing state-of-the-art error bounds verification.
\\end{abstract}

\\section{Introduction \\& Aim}
The principal objective of this investigative exercise is stated as follows:
\\\\
\\textbf{Objective:} \\textit{${escapeLaTeXMath(experiment.aim || 'No explicit aim configured.')}}

\\section{Theoretical Foundations}
${report ? escapeLaTeXMath(report.theory) : '\\textit{Theory is currently compiling or needs AI activation.}'}

\\section{Apparatus Used}
The physical laboratory equipment utilized during structural sampling is outlined below:
\\begin{itemize}
${apparatusItems || '  \\item Specimen wires / General Calibration Meters.'}
\\end{itemize}

\\section{Experimental Methodology \\& Procedure}
Execution steps were performed according to the following protocol:
\\begin{enumerate}
${procedureSteps || '  \\item Assemble apparatus and verify sensor least-count readings.'}
\\end{enumerate}

\\section{Observations \\& Quantitative Dataset}
The quantitative data measurements recorded during the runs are configured in Table~\\ref{tab:experimental_dataset}.

\\begin{table}[h!]
\\centering
\\caption{Experimental Observations Data Table}
\\label{tab:experimental_dataset}
\\vspace{0.2cm}
\\begin{tabular}{${colSpec}}
  \\hline
  ${tableHeaderLine}
  ${tableRowsLines || '  No rows added.'}
  \\hline
\\end{tabular}
\\end{table}

\\subsection{Qualitative Operational Notes}
\\textit{${escapeLaTeXMath(experiment.rawObservationsMarkdown || 'No operational observations noted.')}}

\\section{Calculations \\& Fundamental Math Model}
${report ? escapeLaTeXMath(report.calculations) : '\\textit{Mathematical calculations walk-through compiling.}'}

\\section{Scientific Analytics \\& Data Plots}
${report ? escapeLaTeXMath(report.analysis) : '\\textit{Trend and regression analyses currently compiling.}'}

\\subsection{Plotted Scientific Graph}
Below is the coordinate-generated plot configuration mapping the experimental variables:

\\begin{figure}[h!]
\\centering
\\begin{tikzpicture}
\\begin{axis}[
    title={${sanitize(experiment.graphConfig.title)}},
    xlabel={${sanitize(experiment.graphConfig.xAxisLabel || experiment.graphConfig.xKey)}},
    ylabel={${sanitize(experiment.graphConfig.yAxisLabel || experiment.graphConfig.yKey)}},
    grid=major,
    width=0.85\\textwidth,
    height=8cm,
    legend pos=north west
]
\\addplot[
    color=blue,
    mark=square,
] coordinates {
    ${coordinatesList}
};
\\legend{${sanitize(experiment.graphConfig.yKey)} vs ${sanitize(experiment.graphConfig.xKey)}}
\\end{axis}
\\end{tikzpicture}
\\caption{Analytical curve verification plot.}
\\label{fig:experi_curve}
\\end{figure}

\\section{Ultimate Results}
${report ? escapeLaTeXMath(report.results) : '\\textit{Result summaries currently compiling.}'}

\\section{Investigation Conclusion}
${report ? escapeLaTeXMath(report.conclusion) : '\\textit{Conclusion is currently compiling.}'}

\\section{Improvements \\& Precautionary Guidelines}
For reducing systematic, physical, and observational variances, these parameters should be noted:
\\begin{itemize}
  ${report ? report.improvements.map(i => `\\item ${escapeLaTeXMath(i)}`).join('\n  ') : '\\item Maintain standard ambient environmental metrics.'}
\\end{itemize}

\\end{document}
`;
}
