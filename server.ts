/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser limits increased to support base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Report Generation API
app.post('/api/generate-report', async (req, res) => {
  try {
    const { 
      title, 
      subject, 
      aim, 
      apparatus, 
      procedure, 
      rawObservationsMarkdown, 
      tableData, 
      imageBase64 
    } = req.body;

    if (!title || !aim) {
      return res.status(400).json({ error: 'Title and Aim are required fields' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not defined. Please configure it in your Secrets / Env variables.' 
      });
    }

    // Build the prompt
    let promptString = `You are an expert engineering laboratory professor and scientific researcher.
Your task is to write a comprehensive, rigorous academic lab report based on the raw observations, list of apparatus, procedures, and numeric measurements provided below.

Title: ${title}
Subject/Class: ${subject}
Aim/Objective: ${aim}
Apparatus: ${JSON.stringify(apparatus)}
Procedure: ${JSON.stringify(procedure)}
Raw Observations Markdown: ${rawObservationsMarkdown || 'None provided'}
Table Observations (CSV representation):
${JSON.stringify(tableData)}

`;

    if (imageBase64) {
      promptString += `\nAn image of the experimental setup, graph, or lab notes is attached. Interpret, evaluate, and refer to this image inside the theory, analysis, and calculations as appropriate.`;
    }

    promptString += `\n\nGenerate the following structured academic report details:
1. "theory": Elaborate on the underlying physical, chemical, or engineering laws, formulas, and history. Explain how they govern the experiment. Use elegant Markdown. Include standard formulas formatted using LaTeX (e.g. $F = m \\cdot a$ for inline or $$T = 2\\pi \\sqrt{\\frac{L}{g}}$$ for block equations).
2. "calculations": Provide a clear, step-by-step calculations walk-through using the provided table measurements. Show how raw variables calculate specified parameters. Include a rigorous analysis of standard mechanical, systematic or reading errors. Frame calculations with standard engineering formulas in LaTeX.
3. "analysis": Interpret the data trends. Analyze the correlation between independent and dependent variables. Speculate why anomalies exists and explain the scientific mechanisms behind the experimental curves.
4. "results": Summarize the ultimate results (e.g., determined physical constants, concentrations, or material properties) with appropriate uncertainties and average parameters.
5. "conclusion": Conclude the overall laboratory investigation, describing whether the initial target aim was achieved, confidence level, and general academic summaries.
6. "vivaQuestions": Draw 4 distinct viva-voce style defense questions that a professor would ask an engineering student based on this exact experiment. Each question must have an elaborate, helpful answer explaining the core concept.
7. "improvements": Write 3 practical, action-ready suggestions for lowering systematic errors, material wear, or improving sampling rate in future iterations.
8. "errorAnalysis": Present uncertainty sources. List parameter, estimated uncertainty limit, and description.
9. "statisticalCalculations": Identify 2-3 standard statistics (e.g. mean, standard deviation, least squares intercept) calculated from table columns, listing metric name, value, and formula used.`;

    const contents: any[] = [];
    if (imageBase64) {
      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64
            }
          },
          {
            text: promptString
          }
        ]
      });
    } else {
      contents.push({
        parts: [
          {
            text: promptString
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are a professional university professor who reviews engineering and physics lab logs and helps students draft elegant, error-free, mathematically bulletproof academic lab reports.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theory: { 
              type: Type.STRING, 
              description: "Rigorous academic theory containing the mathematical background and physical laws. Use markdown lists and LaTeX equations ($...$ for inline or $$...$$ for blocks) beautifully." 
            },
            calculations: { 
              type: Type.STRING, 
              description: "Detailed, calculated numerical steps based on the actual table rows, error thresholds, and uncertainty calculations. Use math formatting." 
            },
            analysis: { 
              type: Type.STRING, 
              description: "Interpretation of data trends, graph slopes, and experimental system response." 
            },
            results: { 
              type: Type.STRING, 
              description: "Summary of critical calculated values, constants, and their respective confidence/safety margins." 
            },
            conclusion: { 
              type: Type.STRING, 
              description: "Reflective and final summary matching initial objectives." 
            },
            vivaQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Distinct academic suggestions to enhance experimental precision."
            },
            errorAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING, description: "e.g., 'Voltmeter Least Count', 'Length Measurement'" },
                  uncertainty: { type: Type.STRING, description: "e.g., '± 0.01 V', '± 1 mm'" },
                  explanation: { type: Type.STRING, description: "Description of systematic reading limitations or tool thresholds." }
                },
                required: ["parameter", "uncertainty", "explanation"]
              }
            },
            statisticalCalculations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING, description: "e.g., 'Mean Resistance', 'Standard Error of T'" },
                  value: { type: Type.STRING },
                  formula: { type: Type.STRING, description: "Relevant statistical equation used." }
                },
                required: ["metric", "value", "formula"]
              }
            }
          },
          required: [
            "theory", 
            "calculations", 
            "analysis", 
            "results", 
            "conclusion", 
            "vivaQuestions", 
            "improvements", 
            "errorAnalysis", 
            "statisticalCalculations"
          ]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{}');
    res.json(parsedResponse);
  } catch (error: any) {
    console.error('Gemini lab generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate lab report. Please verify dataset values and API keys.',
      details: error.message 
    });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Lab Report Server is listening on http://localhost:${PORT}`);
  });
}

startServer();
