const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5

let slide = pres.addSlide();
slide.background = { color: "0B0F1A" };

// Security wrapper band (top)
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.6, y: 0.35, w: 12.1, h: 0.85,
  rectRadius: 0.12,
  fill: { color: "141B2E" },
  line: { color: "38BDF8", width: 1, dashType: "dash" }
});
slide.addText("SECURITY LAYER  —  Zoho Vault (encryption)      Zoho Directory (role-based access & audit logs)", {
  x: 0.6, y: 0.35, w: 12.1, h: 0.85,
  align: "center", valign: "middle",
  fontFace: "Arial", fontSize: 14, bold: true, color: "38BDF8"
});

// Pipeline boxes
const boxes = [
  { title: "Zoho Sheet + Creator", sub: "Data entry / capture", color: "1E293B", accent: "38BDF8" },
  { title: "Zoho Flow", sub: "Real-time trigger on new row", color: "1E293B", accent: "FBBF24" },
  { title: "Zoho DataPrep", sub: "Auto-join FIR/Accused/Victim/Timeline", color: "1E293B", accent: "34D399" },
  { title: "Zoho Catalyst", sub: "Serverless matching, scoring, clustering", color: "271A22", accent: "F43F5E" },
  { title: "Zoho Analytics + Zia", sub: "Dashboards, maps, NL chatbot", color: "1E293B", accent: "38BDF8" },
];

const boxW = 2.2, gap = 0.28;
const totalW = boxes.length * boxW + (boxes.length - 1) * gap;
const startX = (13.33 - totalW) / 2;
const boxY = 1.75, boxH = 1.35;

boxes.forEach((b, i) => {
  const x = startX + i * (boxW + gap);
  slide.addShape(pres.ShapeType.roundRect, {
    x, y: boxY, w: boxW, h: boxH,
    rectRadius: 0.1,
    fill: { color: b.color },
    line: { color: b.accent, width: 1.5 }
  });
  slide.addText(b.title, {
    x: x + 0.1, y: boxY + 0.18, w: boxW - 0.2, h: 0.5,
    align: "center", valign: "top",
    fontFace: "Arial", fontSize: 13, bold: true, color: "FFFFFF"
  });
  slide.addText(b.sub, {
    x: x + 0.12, y: boxY + 0.62, w: boxW - 0.24, h: 0.65,
    align: "center", valign: "top",
    fontFace: "Arial", fontSize: 9.5, color: "94A3B8"
  });

  if (i < boxes.length - 1) {
    slide.addShape(pres.ShapeType.rightArrow, {
      x: x + boxW + 0.02, y: boxY + boxH / 2 - 0.09, w: gap - 0.04, h: 0.18,
      fill: { color: "475569" },
      line: { type: "none" }
    });
  }
});

// Downstream: Chatbot / Dashboard user-facing row
const outY = boxY + boxH + 0.55;
slide.addShape(pres.ShapeType.roundRect, {
  x: startX + 2.5*(boxW+gap) - 2.0, y: outY, w: 4.0, h: 0.75,
  rectRadius: 0.1,
  fill: { color: "0F1729" },
  line: { color: "94A3B8", width: 1 }
});
slide.addText("Investigator Chat  •  Supervisor Dashboard  •  Data Entry Form", {
  x: startX + 2.5*(boxW+gap) - 2.0, y: outY, w: 4.0, h: 0.75,
  align: "center", valign: "middle",
  fontFace: "Arial", fontSize: 11, bold: true, color: "E2E8F0"
});

// connector from Zia box down to this row
const ziaBoxIndex = 4;
const ziaX = startX + ziaBoxIndex * (boxW + gap) + boxW/2;
slide.addShape(pres.ShapeType.downArrow, {
  x: ziaX - 0.1, y: boxY + boxH + 0.03, w: 0.2, h: 0.45,
  fill: { color: "475569" }, line: { type: "none" }
});

// Footer note
slide.addText(
  "Prototype note: Catalyst's matching/scoring logic is simulated with seeded test data for this demo — the data flow and Zoho architecture shown are the real production design.",
  {
    x: 0.6, y: outY + 1.15, w: 12.1, h: 0.5,
    align: "center",
    fontFace: "Arial", fontSize: 10.5, italic: true, color: "64748B"
  }
);

// Zero-data footer badge
slide.addText("🔒 Zero data leaves Zoho's private cloud  •  Zero third-party AI calls", {
  x: 0.6, y: outY + 1.6, w: 12.1, h: 0.4,
  align: "center",
  fontFace: "Arial", fontSize: 11, bold: true, color: "34D399"
});

pres.writeFile({ fileName: "architecture_diagram.pptx" }).then(() => {
  console.log("done");
});