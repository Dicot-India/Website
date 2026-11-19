import sharp from "sharp";
import { readFileSync } from "node:fs";

const logo = readFileSync("public/images/logo.svg").toString("base64");

const svg = (eyebrow, line1, line2, facts) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a28"/>
      <stop offset="1" stop-color="#14143f"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.12" r="0.6">
      <stop offset="0" stop-color="#cb0000" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#cb0000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <rect x="72" y="60" width="176" height="72" rx="10" fill="#ffffff"/>
  <image href="data:image/svg+xml;base64,${logo}" x="88" y="76" width="144" height="40"/>

  <text x="72" y="220" font-family="Lato, sans-serif" font-size="19" letter-spacing="4" fill="#ff6b6b" font-weight="700">${eyebrow}</text>
  <text x="72" y="306" font-family="Lato, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${line1}</text>
  <text x="72" y="380" font-family="Lato, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${line2}</text>

  <rect x="72" y="438" width="72" height="4" fill="#cb0000"/>
  <text x="72" y="500" font-family="Lato, sans-serif" font-size="26" fill="#bfbfd4">${facts}</text>
  <text x="72" y="566" font-family="Lato, sans-serif" font-size="22" fill="#8f8fb0">dicot.tech</text>
  <text x="1128" y="566" text-anchor="end" font-family="Lato, sans-serif" font-size="22" fill="#8f8fb0">Ahmedabad, India</text>
</svg>`;

const cards = [
  ["SCADA · IIOT · INDUSTRY 4.0", "SCADA &amp; IIoT software,", "built in India for the world.", "800+ customers · 1,000+ deployments · 4,000+ protocols", "og-default"],
  ["MINI-SCADA · DATA LOGGER", "Vision C", "Shop-floor SCADA in minutes.", "Up to 2,000 tags · Modbus TCP/IP, RTU, BCD, AIBUS", "og-vision-c"],
  ["CLOUD SCADA · IIOT PLATFORM", "Vision Web", "Your plant, on any screen.", "20,000 tags · 50–100 ms · WhatsApp and SMS alarms", "og-vision-web"],
  ["ENTERPRISE SCADA", "Vision S", "Full SCADA for regulated plants.", "60,000 tags · 4,000+ protocols · 21 CFR-ready audits", "og-vision-s"],
  ["CLOUD REPORT GENERATOR", "VGraphic", "Plant data to branded PDFs.", "Excel, CSV, SQL and DAT · no installation", "og-vgraphic"],
];

for (const [eyebrow, l1, l2, facts, name] of cards) {
  await sharp(Buffer.from(svg(eyebrow, l1, l2, facts)))
    .png()
    .toFile(`public/images/${name}.png`);
  console.log("wrote", name);
}
