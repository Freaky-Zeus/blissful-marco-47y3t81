import React, { useState } from "react";
// Assuming FlowchartNode and Arrow are in a components folder
// You might need to adjust this path if they are in the same file.
// import { FlowchartNode } from "./components/FlowchartNode";
// import { Arrow } from "./components/Arrow";
import {
  Camera,
  Database,
  Brain,
  User,
  FileText,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// --- FlowchartNode Component ---
// Added onClick and isClickable props
const FlowchartNode = ({
  x,
  y,
  width,
  height,
  label,
  shape,
  color,
  onClick,
  isClickable,
  isLoading,
}) => {
  const shapeProps = {
    fill: color,
    stroke: "rgba(0,0,0,0.3)",
    strokeWidth: 2,
  };

  let nodeShape;
  switch (shape) {
    case "cylinder":
      nodeShape = (
        <g>
          <ellipse
            cx={x + width / 2}
            cy={y + height * 0.15}
            rx={width / 2}
            ry={height * 0.15}
            {...shapeProps}
          />
          <rect
            x={x}
            y={y + height * 0.15}
            width={width}
            height={height * 0.7}
            fill={color}
          />
          <line
            x1={x}
            y1={y + height * 0.15}
            x2={x}
            y2={y + height * 0.85}
            stroke={shapeProps.stroke}
            strokeWidth={shapeProps.strokeWidth}
          />
          <line
            x1={x + width}
            y1={y + height * 0.15}
            x2={x + width}
            y2={y + height * 0.85}
            stroke={shapeProps.stroke}
            strokeWidth={shapeProps.strokeWidth}
          />
          <ellipse
            cx={x + width / 2}
            cy={y + height * 0.85}
            rx={width / 2}
            ry={height * 0.15}
            {...shapeProps}
          />
        </g>
      );
      break;
    case "hexagon":
      const hexPoints = [
        [x + width * 0.25, y],
        [x + width * 0.75, y],
        [x + width, y + height / 2],
        [x + width * 0.75, y + height],
        [x + width * 0.25, y + height],
        [x, y + height / 2],
      ].join(" ");
      nodeShape = <polygon points={hexPoints} {...shapeProps} />;
      break;
    default: // rectangle
      nodeShape = (
        <rect x={x} y={y} width={width} height={height} rx="8" {...shapeProps} />
      );
  }

  // Handle multi-line text
  const textLines = label.split("\n");
  const lineHeight = 18;
  const totalTextHeight = textLines.length * lineHeight;
  const startY = y + height / 2 - totalTextHeight / 2 + lineHeight / 2 + 5; // Centered

  return (
    <g
      onClick={onClick}
      className={
        isClickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
      }
    >
      {nodeShape}
      <text
        x={x + width / 2}
        y={startY}
        textAnchor="middle"
        fill="#1F2937" // Dark text for readability
        style={{ fontSize: "14px", fontWeight: 500, pointerEvents: "none" }}
      >
        {textLines.map((line, index) => (
          <tspan key={index} x={x + width / 2} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      {isLoading && (
        <foreignObject
          x={x + width / 2 - 12}
          y={y + height / 2 - 12}
          width="24"
          height="24"
        >
          <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
        </foreignObject>
      )}
    </g>
  );
};

// --- Arrow Component ---
// (No changes from your last version)
const Arrow = ({ x1, y1, x2, y2, dashed = false, curved = false }) => {
  const markerId = dashed ? "arrowhead-dashed" : "arrowhead-solid";
  const strokeColor = dashed ? "#6B7280" : "#374151";
  const strokeDasharray = dashed ? "5, 5" : "none";

  let pathData;
  if (curved) {
    const midX = (x1 + x2) / 2 + (y1 - y2) / 4;
    const midY = (y1 + y2) / 2 + (x2 - x1) / 4;
    pathData = `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
  } else {
    pathData = `M${x1},${y1} L${x2},${y2}`;
  }

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
        </marker>
      </defs>
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#${markerId})`}
        strokeDasharray={strokeDasharray}
      />
    </g>
  );
};

// --- Main App Component ---
export default function App() {
  // Define colors for each layer
  const colors = {
    blue: "#93C5FD",
    lightBlue: "#BFDBFE",
    green: "#86EFAC",
    purple: "#C4B5FD",
    teal: "#5EEAD4",
    orange: "#FDB574",
  };

  // --- State for Gemini Integration ---
  const [aiResults, setAiResults] = useState(null);
  const [draftReport, setDraftReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });

  // --- Modal Functions ---
  const openModal = (title, content) => {
    if (!content) return;
    setModalContent({ title, content });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // --- Gemini API Call Helper ---
  const generateDraftReport = async (aiResultsJson) => {
    const apiKey = ""; // Leave as-is
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt =
      "You are a helpful medical assistant. Based on the following AI analysis of a medical scan, generate a concise preliminary report with a 'Findings' section and an 'Impression' section.";

    const payload = {
      contents: [{ parts: [{ text: `AI Analysis Results: ${aiResultsJson}` }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    let retries = 3;
    let delay = 1000;
    while (retries > 0) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          return candidate.content.parts[0].text;
        } else {
          throw new Error("Invalid response structure from Gemini API.");
        }
      } catch (error) {
        console.error("Gemini API call failed:", error);
        retries--;
        if (retries === 0) {
          return "Error: Could not generate report. Please try again.";
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  };

  // --- Click Handlers for Flowchart ---
  const handleCvWorkerClick = () => {
    const mockResults = {
      scan_type: "Chest X-Ray (CXR)",
      patient_id: "P-123456",
      findings_ai: [
        "Mild cardiomegaly noted.",
        "Small bilateral pleural effusions, right greater than left.",
        "No focal airspace consolidation to suggest pneumonia.",
        "Mild degenerative changes in the thoracic spine.",
      ],
      key_measurements: {
        cardiothoracic_ratio: 0.58,
      },
    };
    setAiResults(JSON.stringify(mockResults, null, 2));
    setDraftReport(null); // Clear old report
  };

  const handleLlmOrchestratorClick = async () => {
    if (!aiResults || isLoadingReport) return;

    setIsLoadingReport(true);
    setDraftReport(null); // Clear previous report

    const report = await generateDraftReport(aiResults);

    setDraftReport(report);
    setIsLoadingReport(false);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        content={modalContent.content}
      />
      <div className="min-h-screen bg-gray-50 p-8 font-sans">
        <div className="max-w-[2200px] mx-auto">
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-12">
            AI-Driven Medical Operative Platform – End-to-End Data & Workflow
            Flow
          </h1>

          {/* Legend */}
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {/* ... legend items ... */}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.blue }}
              ></div>
              <span>Image Ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.lightBlue }}
              ></div>
              <span>Workflow & Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.green }}
              ></div>
              <span>AI Systems</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.purple }}
              ></div>
              <span>Clinical Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.teal }}
              ></div>
              <span>EHR Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.orange }}
              ></div>
              <span>Feedback & Learning</span>
            </div>
          </div>

          {/* Scrollable container for the flowchart */}
          <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
            <svg width="1880" height="750" className="mx-auto">
              {/* ... Other layers (1, 2) ... */}
              {/* Layer 1: Image Ingestion (Blue) */}
              <g>
                <rect
                  x="20"
                  y="50"
                  width="280"
                  height="650"
                  rx="8"
                  fill="#EFF6FF"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="160"
                  y="80"
                  textAnchor="middle"
                  fill="#1E40AF"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  1. Image Ingestion Layer
                </text>

                <FlowchartNode
                  x={50}
                  y={130}
                  width={220}
                  height={70}
                  label="DICOM Listener"
                  shape="rectangle"
                  color={colors.blue}
                />
                <FlowchartNode
                  x={50}
                  y={240}
                  width={220}
                  height={70}
                  label="Study Ingest"
                  shape="rectangle"
                  color={colors.blue}
                />
                <FlowchartNode
                  x={50}
                  y={350}
                  width={220}
                  height={80}
                  label={"MinIO Object\nStorage"}
                  shape="cylinder"
                  color={colors.blue}
                />
                <FlowchartNode
                  x={50}
                  y={470}
                  width={220}
                  height={80}
                  label={"PostgreSQL\nMetadata DB"}
                  shape="cylinder"
                  color={colors.blue}
                />

                {/* Icons */}
                <foreignObject x="65" y="150" width="30" height="30">
                  <Camera className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="65" y="375" width="30" height="30">
                  <Database className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="65" y="495" width="30" height="30">
                  <Database className="w-6 h-6 text-gray-700" />
                </foreignObject>
              </g>

              {/* Arrows within Layer 1 */}
              <Arrow x1={160} y1={200} x2={160} y2={240} />
              
              {/* New arrow: Study Ingest to MinIO Object Storage */}
              <Arrow x1={160} y1={310} x2={160} y2={350} />

              {/* New arrow: Study Ingest to PostgreSQL Metadata DB (from left side) */}
              <path
                d="M140 310 L 140 340 L 24 340 L 70 470"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead-solid)"
              />
              
              {/* Removed:
              <path d="M160 310 L 160 330 L 100 330 L 100 470" stroke="#374151" strokeWidth="2" fill="none" />
              <Arrow x1={100} y1={470} x2={100} y2={470} /> 
              <path d="M160 310 L 160 330 L 220 330 L 220 350" stroke="#374151" strokeWidth="2" fill="none" />
              <Arrow x1={220} y1={350} x2={220} y2={350} />
              <Arrow x1={160} y1={310} x2={160} y2={350} />
              <Arrow x1={160} y1={310} x2={160} y2={470} /> 
              */}


              {/* Layer 2: Workflow & Event Processing (Light Blue) */}
              <g>
                <rect
                  x="340"
                  y="50"
                  width="280"
                  height="650"
                  rx="8"
                  fill="#F0F9FF"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="480"
                  y="80"
                  textAnchor="middle"
                  fill="#0C4A6E"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  2. Workflow & Event Processing
                </text>

                <FlowchartNode
                  x={370}
                  y={240}
                  width={220}
                  height={70}
                  label="Kafka Event Bus"
                  shape="rectangle"
                  color={colors.lightBlue}
                />
                <FlowchartNode
                  x={370}
                  y={370}
                  width={220}
                  height={80}
                  label={"Temporal Workflow\nOrchestrator"}
                  shape="rectangle"
                  color={colors.lightBlue}
                />
              </g>

              {/* Arrows from Layer 1 to Layer 2 */}
              <Arrow x1={270} y1={390} x2={370} y2={275} />
              <Arrow x1={270} y1={510} x2={370} y2={275} />

              {/* Arrow within Layer 2 */}
              <Arrow x1={480} y1={310} x2={480} y2={370} />

              {/* Layer 3: AI Systems (Green) - NOW INTERACTIVE! */}
              <g>
                <rect
                  x="660"
                  y="50"
                  width="380"
                  height="650"
                  rx="8"
                  fill="#F0FDF4"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="850"
                  y="80"
                  textAnchor="middle"
                  fill="#166534"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  3. AI Systems Layer
                </text>

                <FlowchartNode
                  x={690}
                  y={150}
                  width={160}
                  height={80}
                  label={"✨CV Worker\n(Click to Run)"}
                  shape="hexagon"
                  color={colors.green}
                  onClick={handleCvWorkerClick}
                  isClickable={true}
                />
                <FlowchartNode
                  x={880}
                  y={150}
                  width={140}
                  height={80}
                  label={
                    aiResults ? "AI Results\n(Click to View)" : "  AI Results\nDB"
                  }
                  shape="cylinder"
                  color={colors.green}
                  onClick={() => openModal("AI Results (Mock Data)", aiResults)}
                  isClickable={!!aiResults}
                />
                <FlowchartNode
                  x={670}
                  y={280}
                  width={180}
                  height={90}
                  label={"✨LLM Orchestrator\n(Click to Draft)"}
                  shape="hexagon"
                  color={colors.green}
                  onClick={handleLlmOrchestratorClick}
                  isClickable={!!aiResults && !isLoadingReport}
                  isLoading={isLoadingReport}
                />
                <FlowchartNode
                  x={880}
                  y={280}
                  width={160}
                  height={90}
                  label={
                    draftReport
                      ? " Draft Report\n(Click to View)"
                      : "Draft Report\n(Findings +\nImpression)"
                  }
                  shape="rectangle"
                  color={colors.green}
                  onClick={() => openModal("Gemini-Generated Report", draftReport)}
                  isClickable={!!draftReport}
                />

                {/* Icons */}
                <foreignObject x="757" y="150" width="30" height="30">
                  <Brain className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="895" y="170" width="30" height="30">
                  <Database className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="748" y="285" width="30" height="30">
                  <Brain className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="895" y="300" width="30" height="30">
                  <FileText className="w-6 h-6 text-gray-700" />
                </foreignObject>
              </g>

              {/* Arrows from Layer 2 to Layer 3 */}
              <Arrow x1={590} y1={410} x2={690} y2={185} />

              {/* Arrows within Layer 3 */}
              <Arrow x1={830} y1={185} x2={880} y2={190} />
              <Arrow x1={760} y1={220} x2={760} y2={280} />
              <Arrow x1={950} y1={230} x2={950} y2={280} />
              <Arrow x1={830} y1={315} x2={880} y2={320} />

              {/* ... Other layers (4, 5, 6) ... */}
              {/* Layer 4: Clinical Interface (Purple) */}
              <g>
                <rect
                  x="1080"
                  y="50"
                  width="380"
                  height="650"
                  rx="8"
                  fill="#FAF5FF"
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="1270"
                  y="80"
                  textAnchor="middle"
                  fill="#6B21A8"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  4. Clinical Interface Layer
                </text>

                <FlowchartNode
                  x={1110}
                  y={140}
                  width={160}
                  height={90}
                  label={"ReportGen\nService"}
                  shape="rectangle"
                  color={colors.purple}
                />
                <FlowchartNode
                  x={1290}
                  y={140}
                  width={160}
                  height={90}
                  label={"OHIF Viewer\nwith AI Overlays"}
                  shape="rectangle"
                  color={colors.purple}
                />
                <FlowchartNode
                  x={1110}
                  y={270}
                  width={160}
                  height={90}
                  label={"Radiologist\nReview & Edits"}
                  shape="rectangle"
                  color={colors.purple}
                />
                <FlowchartNode
                  x={1290}
                  y={270}
                  width={160}
                  height={90}
                  label={"Final Report\nApproved"}
                  shape="rectangle"
                  color={colors.purple}
                />

                {/* Icons */}
                <foreignObject x="1125" y="290" width="30" height="30">
                  <User className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="1305" y="160" width="30" height="30">
                  <User className="w-6 h-6 text-gray-700" />
                </foreignObject>
              </g>

              {/* Arrows from Layer 3 to Layer 4 */}
              <Arrow x1={1020} y1={320} x2={1110} y2={175} />
              <Arrow x1={1020} y1={190} x2={1290} y2={175} />

              {/* Arrows within Layer 4 */}
              <Arrow x1={1250} y1={175} x2={1290} y2={175} />
              <Arrow x1={1180} y1={210} x2={1180} y2={270} />
              <Arrow x1={1365} y1={210} x2={1365} y2={270} />
              <Arrow x1={1250} y1={310} x2={1290} y2={310} />

              {/* Layer 5: EHR Integration (Teal) */}
              <g>
                <rect
                  x="1500"
                  y="50"
                  width="340"
                  height="650"
                  rx="8"
                  fill="#F0FDFA"
                  stroke="#14B8A6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="1670"
                  y="80"
                  textAnchor="middle"
                  fill="#134E4A"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  5. EHR Integration Layer
                </text>

                <FlowchartNode
                  x={1530}
                  y={140}
                  width={280}
                  height={80}
                  label={"PostgreSQL\nFinal Report Storage"}
                  shape="cylinder"
                  color={colors.teal}
                />
                <FlowchartNode
                  x={1530}
                  y={270}
                  width={280}
                  height={70}
                  label="DICOM-SR/PDF Export"
                  shape="rectangle"
                  color={colors.teal}
                />
                <FlowchartNode
                  x={1530}
                  y={390}
                  width={280}
                  height={70}
                  label="FHIR DiagnosticReport"
                  shape="rectangle"
                  color={colors.teal}
                />
                <FlowchartNode
                  x={1530}
                  y={510}
                  width={280}
                  height={70}
                  label="Hospital EHR/PACS"
                  shape="rectangle"
                  color={colors.teal}
                />

                {/* Icons */}
                <foreignObject x="1545" y="160" width="30" height="30">
                  <Database className="w-6 h-6 text-gray-700" />
                </foreignObject>
                <foreignObject x="1545" y="290" width="30" height="30">
                  <FileText className="w-6 h-6 text-gray-700" />
                </foreignObject>
              </g>

              {/* Arrows from Layer 4 to Layer 5 */}
              <Arrow x1={1440} y1={310} x2={1530} y2={180} />

              {/* Arrows within Layer 5 */}
              <Arrow x1={1670} y1={220} x2={1670} y2={270} />
              <Arrow x1={1670} y1={340} x2={1670} y2={390} />
              <Arrow x1={1670} y1={460} x2={1670} y2={510} />

              {/* Layer 6: Feedback & Continuous Learning (Orange) */}
              <g>
                <rect
                  x="660"
                  y="550"
                  width="620"
                  height="130"
                  rx="8"
                  fill="#FFF7ED"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x="970"
                  y="580"
                  textAnchor="middle"
                  fill="#9A3412"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  6. Feedback & Continuous Learning
                </text>

                <FlowchartNode
                  x={690}
                  y={600}
                  width={130}
                  height={60}
                  label={"Radiologist\nFeedback"}
                  shape="rectangle"
                  color={colors.orange}
                />
                <FlowchartNode
                  x={860}
                  y={600}
                  width={130}
                  height={60}
                  label={"MLOps\nPipeline"}
                  shape="rectangle"
                  color={colors.orange}
                />
                <FlowchartNode
                  x={1030}
                  y={600}
                  width={130}
                  height={60}
                  label={"Model\nRetraining"}
                  shape="rectangle"
                  color={colors.orange}
                />

                {/* Icons */}
                <foreignObject x="705" y="615" width="30" height="30">
                  <User className="w-5 h-5 text-gray-700" />
                </foreignObject>
                <foreignObject x="875" y="615" width="30" height="30">
                  <RefreshCw className="w-5 h-5 text-gray-700" />
                </foreignObject>
              </g>

              {/* Dashed feedback arrow from Clinical to Feedback layer */}
              <Arrow x1={1180} y1={350} x2={755} y2={600} dashed={true} />

              {/* Arrows within Layer 6 */}
              <Arrow x1={820} y1={630} x2={860} y2={630} />
              <Arrow x1={990} y1={630} x2={1030} y2={630} />

              {/* Dashed feedback loop from Layer 6 back to Layer 3 CV Worker */}
              <Arrow
                x1={1095}
                y1={600}
                x2={760}
                y2={220}
                dashed={true}
                curved={true}
              />
            </svg>
          </div>

          {/* Key Information */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Flowchart Key</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <strong>Arrow Types:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Solid arrows: Data flow</li>
                  <li>Dashed arrows: Feedback/retraining loop</li>
                </ul>
              </div>
              <div>
                <p className="mb-2">
                  <strong>Component Shapes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Rounded rectangles: Processes/services</li>
                  <li>Cylinders: Databases</li>
                  <li>Hexagons: AI modules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

