export const stats = [
  { value: "800+", label: "customers" },
  { value: "1,000+", label: "deployments" },
  { value: "4,000+", label: "device protocols" },
  { value: "50–100 ms", label: "cloud update latency" },
];

export const recognitions = [
  { name: "Startup India", image: "/images/sui.png", alt: "Startup India" },
  { name: "i-Hub, Gujarat Government", image: "/images/i-hub.png", alt: "i-Hub, a Gujarat Government enterprise" },
  { name: "Wadhwani Foundation", image: "/images/wf-logo.png", alt: "Wadhwani Foundation" },
  { name: "Make in India", image: "/images/image-1.png", alt: "Make in India" },
];

export const customerLogos = [
  { name: "Cipla", image: "/images/cipla_logo.png" },
  // Square marks need more optical height than wide wordmarks.
  { name: "Tata Steel", image: "/images/tata.png", scale: 1.5 },
  { name: "Apollo Tyres", image: "/images/apollotireslogo.png" },
  { name: "Nippon Paint", image: "/images/nipponpaintslogo.png" },
  { name: "BHEL", image: "/images/bhel.png", scale: 1.12 },
  { name: "ISRO", image: "/images/isro.jpg", scale: 1.2 },
  { name: "Lubi", image: "/images/lubi.png" },
  { name: "Sansel", image: "/images/sansellogo.jpeg" },
];

export const industries = [
  {
    name: "Pharmaceuticals",
    slug: "pharma",
    text: "Batch records, audit trails and 21 CFR-ready controls for regulated production. Vision S keeps the evidence trail your auditors ask for.",
    proof: "Audit trails and e-signature",
  },
  {
    name: "Textiles",
    slug: "textiles",
    text: "Monitor dyeing, spinning and processing lines, log shifts and catch deviations before a batch is wasted.",
    proof: "Multi-line data logging",
  },
  {
    name: "Food & beverage",
    slug: "food-beverage",
    text: "Track temperature, pressure and batch times with reports that satisfy quality teams and customers.",
    proof: "Batch-wise reporting",
  },
  {
    name: "Machine tools",
    slug: "machine-tools",
    text: "Give OEM machines a ready SCADA and cloud layer without building software for every customer.",
    proof: "OEM and white-label ready",
  },
  {
    name: "Water treatment",
    slug: "water-treatment",
    text: "Watch tank levels, flow, pH and conductivity across remote sites, with alarms on the phones your operators carry.",
    proof: "Remote alarms",
  },
  {
    name: "Foundry",
    slug: "foundry",
    text: "Log furnace, moulding and cooling data in harsh environments and compare shifts without paper registers.",
    proof: "Rugged, low-footprint logging",
  },
  {
    name: "Ceramics",
    slug: "ceramics",
    text: "Follow kiln curves and energy use over long cycles, and export the evidence for every batch.",
    proof: "Long-cycle trending",
  },
  {
    name: "Railway",
    slug: "railway",
    text: "Monitor wayside and depot equipment with local logging and central visibility, even across distributed sites.",
    proof: "Distributed monitoring",
  },
  {
    name: "HVAC",
    slug: "hvac",
    text: "Track AHU temperatures, humidity and energy use, and alert facility teams when a space drifts out of range.",
    proof: "Comfort and energy visibility",
  },
];

export const testimonials = [
  {
    quote:
      "Dicot's IIoT software offers unmatched compatibility. Their data acquisition software is ideal for logging and remote monitoring, making them a top choice for manufacturing clients seeking reliable SCADA alternatives.",
    name: "Raj Kanabar",
    role: "CEO, Radical TechArt",
  },
  {
    quote:
      "Vision C is a game-changer. As a mini-SCADA, it is quick to set up and drives digitalisation forward. Our customers consistently praise its effectiveness as a modern SCADA India solution.",
    name: "Mayank Dantwala",
    role: "CEO, Control Equipments & Marketing Co.",
  },
  {
    quote:
      "Dicot's SCADA software is intuitive and stable. The prompt support ensures seamless remote monitoring and data logging, which is critical for our industrial operations and Industry 4.0 initiatives.",
    name: "Amit Prajapati",
    role: "Maintenance Head, Electrotherm India Ltd.",
  },
];

export const team = [
  {
    name: "Nandan Shukla",
    role: "Chief Executive Officer",
    group: "Leadership",
    image: "/images/team/nandan.webp",
    position: "42% 32%",
  },
  {
    name: "Darshana Shukla",
    role: "Director",
    group: "Leadership",
    image: "/images/team/darshana.webp",
  },
  {
    name: "Dharren Savla",
    role: "Director, Deep Industries Ltd.",
    group: "Board & mentors",
    image: "/images/team/dharren.webp",
  },
  {
    name: "Niket Gorakhia",
    role: "Director, Micon Automation",
    group: "Board & mentors",
    image: "/images/team/niket.webp",
  },
];

export const homeFaqs = [
  {
    q: "What does Dicot Innovations do?",
    a: "Dicot builds SCADA, IIoT and data-acquisition software for manufacturers. Its products are Vision C (mini-SCADA and data logger), Vision S (enterprise SCADA), Vision Web (hosted cloud SCADA) and VGraphic (cloud report generator). Vision S Lite, a lighter Vision S for cost-sensitive applications, is in development. The company was founded in Ahmedabad in 2022 and its software is deployed in more than 1,000 plants.",
  },
  {
    q: "Is Dicot's SCADA software made in India?",
    a: "Yes. Dicot designs and develops its software in Ahmedabad, Gujarat. It is recognised under Startup India, incubated at i-Hub (a Gujarat Government enterprise), supported by the Wadhwani Foundation and part of the Make in India initiative.",
  },
  {
    q: "What is the difference between Vision C, Vision S and Vision Web?",
    a: "Vision C is a lightweight on-premises mini-SCADA for up to 100 tags. Vision S is an enterprise SCADA for up to 60,000 tags, with 4,000+ protocols and 21 CFR-ready audit trails. Vision Web is a cloud SCADA platform hosted by Dicot, with up to 20,000 tags per project and mobile alarms. Vision S Lite, in development, is a lighter Vision S with fewer protocols and a smaller design library for cost-sensitive applications.",
  },
  {
    q: "Can Dicot software connect to existing PLCs and machines?",
    a: "Yes. Vision C supports Modbus TCP/IP, RTU, BCD and AIBUS. Vision S supports more than 4,000 device protocols including OPC UA and OPC DA. Vision Web receives data over MQTT and HTTP, including from Vision C.",
  },
  {
    q: "How do I get pricing?",
    a: "Dicot sells through an authorised dealer network, so prices are shared by your nearest dealer rather than published online. Send an enquiry with your tag count and deployment type and the team will route it to the right partner.",
  },
  {
    q: "Which industries use Dicot software?",
    a: "Pharmaceuticals, textiles, food and beverage, machine tools, water treatment, foundry, ceramics, railway and HVAC. Deployments range from a single machine to multi-line plants.",
  },
];

export const downloads = [
  {
    name: "Vision C",
    items: [
      { label: "Vision C setup (Windows)", href: "https://dicot.in/VisionCsetup.exe", type: "EXE" },
      { label: "Vision C user guide", href: "https://dicot.in/Userguidevc2.pdf", type: "PDF" },
    ],
  },
  {
    name: "Vision Web",
    items: [
      { label: "Vision Web client (Windows)", href: "https://dicot.tech/VisionWebClient.exe", type: "EXE" },
      { label: "Vision Web app (Android)", href: "https://dicot.tech/VisionWeb.apk", type: "APK" },
    ],
  },
  {
    name: "Vision S manuals",
    items: [{ label: "Vision S manual pack", href: "https://dicot.tech/VisionS_Manual.zip", type: "ZIP" }],
  },
  {
    name: "VGraphic",
    items: [
      { label: "VGraphic setup", href: "https://dicot.tech/VGSetup.exe", type: "EXE" },
      { label: "VGraphic manual", href: "https://dicot.tech/Vgraphic_Manual.pdf", type: "PDF" },
    ],
  },
  {
    name: "Utilities",
    items: [
      { label: "RS-485 driver", href: "https://dicot.tech/485driver.exe", type: "EXE" },
      { label: "Product catalogue", href: "https://dicot.tech/Catalogue.pdf", type: "PDF" },
    ],
  },
];

export const partnerTypes = [
  {
    title: "Dealers & resellers",
    text: "Sell and support Dicot products in your territory, with dealer pricing and technical backing from our team.",
  },
  {
    title: "System integrators",
    text: "Deliver SCADA and IIoT projects faster using a platform you can configure instead of code.",
  },
  {
    title: "OEMs & machine builders",
    text: "Ship Vision C or Vision Web under your own brand, with licensing that matches your machine warranty.",
  },
];
