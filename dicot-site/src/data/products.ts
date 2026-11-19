export type Plan = { name: string; detail: string };
export type Spec = { label: string; value: string };
export type Feature = { title: string; text: string };
export type Faq = { q: string; a: string };

export type Product = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  bestFor: string;
  facts: Spec[];
  features: Feature[];
  plans: Plan[];
  planNote: string;
  requirements: string[];
  faqs: Faq[];
  image: string;
  imageAlt: string;
  order: number;
  /** "upcoming" renders launch messaging instead of availability/pricing. */
  status?: "available" | "upcoming";
};

export const products: Product[] = [
  {
    slug: "vision-c",
    name: "Vision C",
    category: "Mini-SCADA & data logger",
    tagline: "Shop-floor SCADA that installs in minutes, not months.",
    summary:
      "Vision C is a Windows mini-SCADA and data logger for compact machines and single lines. It handles up to 100 tags, connects over Modbus TCP/IP, RTU, BCD and AIBUS, and pushes data to Vision Web in one click. Licences run from two years to perpetual.",
    metaTitle: "Vision C Mini-SCADA & Data Logger | Dicot",
    metaDescription:
      "Vision C is a lightweight Windows mini-SCADA and data logger for up to 100 tags. Modbus TCP/IP, RTU, BCD, AIBUS, 8 languages and one-click Vision Web connectivity.",
    bestFor:
      "Machine builders, panel integrators and plant teams that need reliable logging and remote monitoring without a development project.",
    facts: [
      { label: "Tags", value: "Up to 100" },
      { label: "Protocols", value: "Modbus TCP/IP, RTU, BCD, AIBUS" },
      { label: "Deployment", value: "On-premises, Windows" },
      { label: "User levels", value: "Unlimited" },
      { label: "Historical data", value: "File-based, exportable" },
      { label: "Trends", value: "Last 1 hour, live" },
      { label: "Recipes", value: "PID, up to 100 steps" },
      { label: "Languages", value: "8" },
      { label: "Security", value: "2-layer" },
      { label: "Install size", value: "~10 MB" },
      { label: "OS", value: "Windows 8 or later" },
      { label: "Licence", value: "2, 5, 10, 20 years or perpetual" },
    ],
    features: [
      {
        title: "Zero development time",
        text: "Install, map your tags and start logging the same day. No screens to code, no integration project.",
      },
      {
        title: "One-click Vision Web link",
        text: "Send live and historical data to the cloud without a gateway script or a second configuration.",
      },
      {
        title: "Batch recording",
        text: "Record multiple batches at the same time with batch-wise reports for traceability.",
      },
      {
        title: "PID recipes",
        text: "Store and recall up to 100-step recipes for repeatable process changes.",
      },
      {
        title: "Reports your team can read",
        text: "Print or export PDF reports with your logo, watermark and header.",
      },
      {
        title: "Runs on modest hardware",
        text: "About 10 MB installed, Windows 8 or later and 4 GB of RAM is enough.",
      },
    ],
    plans: [
      { name: "2-year licence", detail: "Full licence, unlimited tags within the 100-tag limit." },
      { name: "5-year licence", detail: "Same feature set with a longer support window." },
      { name: "10-year licence", detail: "For deployments with a long plant lifecycle." },
      { name: "20-year licence", detail: "Long-horizon licence for OEM and infrastructure projects." },
      { name: "Perpetual licence", detail: "Perpetual use without future software updates." },
    ],
    planNote:
      "Prices are shared through our authorised dealer network. Request a quote and we will route it to the right partner.",
    requirements: ["Windows 8 or later", "4 GB RAM or more", "Adobe PDF Reader for reports", "Ethernet or serial port for device connectivity"],
    faqs: [
      {
        q: "What is Vision C?",
        a: "Vision C is a mini-SCADA and data-logging application for Windows. It reads tags from PLCs and devices, shows live values and trends, stores history, records batches and generates reports. It supports up to 100 tags.",
      },
      {
        q: "Which protocols does Vision C support?",
        a: "Modbus TCP/IP, Modbus RTU, BCD and AIBUS, across multiple ports.",
      },
      {
        q: "Can Vision C send data to the cloud?",
        a: "Yes. A one-click connection forwards data to Vision Web, Dicot's hosted SCADA platform, for remote monitoring and alerts.",
      },
      {
        q: "How is Vision C licensed?",
        a: "As a time-based licence of 2, 5, 10 or 20 years, or perpetual without future updates. Pricing is provided by authorised dealers.",
      },
      {
        q: "Do I need a developer to set it up?",
        a: "No. Configuration is done through the application. Most customers are logging data on the first day.",
      },
    ],
    image: "/images/vision-c.png",
    imageAlt: "Vision C mini-SCADA interface showing live indicator tiles",
    order: 1,
  },
  {
    slug: "vision-web",
    name: "Vision Web",
    category: "Cloud SCADA & IIoT platform",
    tagline: "Your plant on any screen, with alarms where your team already is.",
    summary:
      "Vision Web is Dicot's hosted cloud SCADA platform. It brings up to 20,000 tags per project into a browser, updates at 50–100 ms, keeps two years of history and sends alarms by SMS, email, WhatsApp and Telegram. Dicot hosts and maintains the platform; you log in and run the plant.",
    metaTitle: "Vision Web Cloud SCADA & IIoT Platform | Dicot",
    metaDescription:
      "Vision Web is a hosted cloud SCADA platform with up to 20,000 tags, 50–100 ms updates, two-year history and SMS, email, WhatsApp and Telegram alarms.",
    bestFor:
      "Teams that need remote monitoring, multi-site visibility and mobile alarms without running servers or a VPN.",
    facts: [
      { label: "Tags", value: "Up to 20,000 per project" },
      { label: "Protocols", value: "HTTP, MQTT" },
      { label: "Update latency", value: "50–100 ms" },
      { label: "Hosting", value: "Managed by Dicot" },
      { label: "Historical data", value: "NoSQL, 2-year retention" },
      { label: "Alarms", value: "SMS, email, WhatsApp, Telegram" },
      { label: "Security", value: "3-layer encryption, 2FA" },
      { label: "Users", value: "Unlimited user levels" },
      { label: "Reports", value: "Print and PDF, automatable" },
      { label: "Licence", value: "Yearly subscription" },
    ],
    features: [
      {
        title: "No server to maintain",
        text: "Dicot hosts, patches and backs up the platform. Your team opens a browser or the mobile app.",
      },
      {
        title: "Alarms on the channels you use",
        text: "Route different triggers to SMS, email, WhatsApp or Telegram so the right person hears about it.",
      },
      {
        title: "Derived channels",
        text: "Calculate efficiency, totals and ratios in the platform instead of adding logic to every PLC.",
      },
      {
        title: "Two-factor authentication",
        text: "Protect operator access with a second factor, alongside per-user passwords and roles.",
      },
      {
        title: "Data forwarding",
        text: "Push selected data to your own systems instead of locking it inside a dashboard.",
      },
      {
        title: "Mobile-first monitoring",
        text: "Android and Windows clients keep the plant visible when nobody is at a desk.",
      },
    ],
    plans: [
      { name: "10 tags", detail: "Single small asset or a pilot project." },
      { name: "50 tags", detail: "One machine or a compact production line." },
      { name: "500 tags", detail: "A full line or a small plant." },
      { name: "5,000 tags", detail: "Multi-line or multi-site monitoring." },
      { name: "Enterprise", detail: "Above 5,000 tags, scoped with our team." },
      { name: "Add-ons", detail: "Additional users, SMS credits and WhatsApp alerts." },
    ],
    planNote:
      "Yearly subscription, quoted through authorised dealers. User add-ons apply after the included user allowance.",
    requirements: ["Modern browser", "Internet connection at the plant gateway", "Android 8+ or Windows for the client apps", "MQTT-capable gateway or Vision C for data collection"],
    faqs: [
      {
        q: "Is Vision Web hosted by Dicot?",
        a: "Yes. Dicot hosts, maintains and backs up Vision Web. Customers do not need to provision cloud infrastructure or manage servers.",
      },
      {
        q: "How fast does Vision Web update?",
        a: "Typical latency is 50–100 ms on a stable connection.",
      },
      {
        q: "How long is data retained?",
        a: "Two years of historical data is retained in the platform's NoSQL store.",
      },
      {
        q: "Which alarm channels are supported?",
        a: "SMS, email, WhatsApp and Telegram, with different triggers and recipients per alarm.",
      },
      {
        q: "Can I connect an existing PLC or Vision C installation?",
        a: "Yes. Vision Web receives data over MQTT or HTTP, and Vision C can forward data with a one-click connection.",
      },
      {
        q: "How is Vision Web priced?",
        a: "As a yearly subscription by tag count, with add-ons for extra users, SMS and WhatsApp. Prices are shared through authorised dealers.",
      },
    ],
    image: "/images/vision-web.png",
    imageAlt: "Vision Web cloud SCADA dashboard showing connected projects",
    order: 2,
  },
  {
    slug: "vision-s",
    name: "Vision S",
    category: "Enterprise SCADA",
    tagline: "Full SCADA for regulated, high-tag-count plants.",
    summary:
      "Vision S is Dicot's enterprise SCADA for large and regulated plants. It scales to 60,000 tags, speaks 4,000+ protocols including OPC UA and DA, keeps 21 CFR-ready audit trails and stores history in PostgreSQL. Runtime, development, client-server and web-client licences can be mixed to fit the architecture.",
    metaTitle: "Vision S Enterprise SCADA Software | Dicot",
    metaDescription:
      "Vision S enterprise SCADA scales to 60,000 tags with 4,000+ protocols, OPC UA/DA, 21 CFR audit trails, PostgreSQL history, C scripting and web clients.",
    bestFor:
      "Pharma, process and large manufacturing sites that need audit trails, high tag counts and a configurable SCADA architecture.",
    facts: [
      { label: "Tags", value: "Up to 60,000" },
      { label: "Protocols", value: "4,000+, OPC UA and DA" },
      { label: "Audit trails", value: "21 CFR-ready" },
      { label: "Historical database", value: "PostgreSQL" },
      { label: "Scripting", value: "C" },
      { label: "User levels", value: "Unlimited" },
      { label: "Recipes", value: "Unlimited" },
      { label: "Batches", value: "Multiple simultaneous" },
      { label: "Reports", value: "Print and PDF, fully customisable" },
      { label: "Extras", value: "E-signature, OPC UA server, multi-monitor" },
      { label: "Licence", value: "Tag-based, runtime and development" },
    ],
    features: [
      {
        title: "Audit trails that stand up",
        text: "21 CFR-ready trails, electronic signatures and user-level control for regulated manufacturing.",
      },
      {
        title: "4,000+ device protocols",
        text: "Connect mixed PLCs, drives and legacy equipment through OPC UA, OPC DA and native drivers.",
      },
      {
        title: "PostgreSQL history",
        text: "Plant data lands in a standard database, so your BI and reporting tools can query it directly.",
      },
      {
        title: "C scripting",
        text: "Write custom logic where configuration stops being enough, without leaving the platform.",
      },
      {
        title: "Architecture that fits",
        text: "Mix development, runtime, client-server and web-client licences as the plant grows.",
      },
      {
        title: "Built for the control room",
        text: "Multi-monitor layouts, alarms and batch views for operators who live in the system all shift.",
      },
    ],
    plans: [
      { name: "Development licence", detail: "For building and testing projects. Not for production deployment." },
      { name: "Runtime licence", detail: "For live deployment on the plant floor, sized by tags." },
      { name: "Client/Server licence", detail: "For distributed architectures without an I/O licence included." },
      { name: "Web Client licence", detail: "Browser-based remote operation, sized by concurrent users." },
      { name: "Accessories", detail: "Electronic signature and OPC UA server add-ons." },
      { name: "Enterprise scope", detail: "Multi-site and 60,000-tag deployments scoped with our team." },
    ],
    planNote:
      "Tag-based licensing with separate development and runtime editions. Prices are shared through authorised dealers.",
    requirements: ["Windows 7 or Windows 10", "Pentium 4, 1 GHz or higher", "4 GB RAM recommended (1 GB minimum)", "PostgreSQL for historical logging"],
    faqs: [
      {
        q: "What is Vision S?",
        a: "Vision S is an enterprise SCADA platform for Windows. It collects data from PLCs and devices, provides operator screens, alarms, trends, reports, recipes and batch recording, and scales to 60,000 tags.",
      },
      {
        q: "Does Vision S support 21 CFR Part 11 requirements?",
        a: "Vision S provides 21 CFR-ready audit trails, electronic signatures and user-level access control. Validation and compliance remain the responsibility of the regulated site.",
      },
      {
        q: "Which protocols are supported?",
        a: "More than 4,000 drivers, including OPC UA and OPC DA, with multi-port connectivity.",
      },
      {
        q: "Can I develop and deploy with different licences?",
        a: "Yes. Development, runtime, client-server and web-client licences are separate, and can be combined.",
      },
      {
        q: "Where is historical data stored?",
        a: "In PostgreSQL, with options for third-party integration.",
      },
    ],
    image: "/images/visions.png",
    imageAlt: "Vision S enterprise SCADA project explorer and configuration interface",
    order: 3,
  },
  {
    // Vision S Lite launch provision. Set status to "available" after launch and
    // remove the launch-only copy in the product page CTA.
    slug: "vision-s-lite",
    name: "Vision S Lite",
    category: "Lightweight enterprise SCADA",
    tagline: "The Vision S platform, sized for cost-sensitive plants.",
    summary:
      "Vision S Lite is a lighter edition of Vision S, in development at Dicot. It keeps the Vision S software approach but uses a reduced protocol set and a smaller design library, for applications that need Vision S-style SCADA without the full footprint.",
    metaTitle: "Vision S Lite — Lightweight Vision S SCADA | Dicot",
    metaDescription:
      "Vision S Lite is a lighter edition of Vision S with fewer protocols and a smaller design library, built for cost-sensitive SCADA applications. In development.",
    bestFor:
      "Machine builders and plant teams that need Vision S-style SCADA, but do not need the full protocol library or the full design environment.",
    facts: [
      { label: "Base", value: "Vision S platform" },
      { label: "Protocols", value: "Reduced set vs Vision S" },
      { label: "Design library", value: "Smaller than Vision S" },
      { label: "Target", value: "Cost-sensitive applications" },
      { label: "Status", value: "In development" },
      { label: "Licensing", value: "Announced at launch" },
    ],
    features: [
      {
        title: "Vision S core",
        text: "Built on the Vision S software platform, with the same operating model for tags, alarms, trends and reports.",
      },
      {
        title: "A reduced protocol set",
        text: "Fewer drivers than the full Vision S library, matched to the equipment a cost-sensitive application actually uses.",
      },
      {
        title: "A smaller design library",
        text: "A leaner set of screens and objects, so engineering effort stays proportional to the plant.",
      },
      {
        title: "Sized for the budget",
        text: "For machines and plants where the full Vision S footprint costs more than the application needs.",
      },
      {
        title: "One platform to learn",
        text: "It runs on the Vision S architecture, so it is not a separate toolchain for your team.",
      },
    ],
    plans: [],
    planNote:
      "Vision S Lite is in development. Editions and pricing will be announced at launch and quoted through authorised dealers.",
    requirements: [],
    faqs: [
      {
        q: "What is Vision S Lite?",
        a: "Vision S Lite is a lighter edition of Vision S, in development at Dicot. It keeps the Vision S software approach but uses a reduced protocol set and a smaller design library for cost-sensitive applications.",
      },
      {
        q: "How is Vision S Lite different from Vision S?",
        a: "Vision S Lite is scoped below Vision S: fewer protocols and a smaller design library. Vision S remains the choice for 60,000-tag, multi-line plants that need the full 4,000+ protocol library, OPC UA/DA and 21 CFR-ready audit trails.",
      },
      {
        q: "Is Vision S Lite available now?",
        a: "Not yet. It is in development. Register your interest and the team will share availability, editions and pricing when they are confirmed.",
      },
      {
        q: "Who is Vision S Lite for?",
        a: "Machine builders and plant teams with cost-sensitive applications that need Vision S-style SCADA, but do not need the full protocol library or design environment.",
      },
      {
        q: "How will Vision S Lite be licensed?",
        a: "Editions and pricing will be announced at launch. As with the rest of the Dicot range, quotes will be handled through authorised dealers.",
      },
    ],
    image: "/images/visions.png",
    imageAlt: "Vision S Lite is in development",
    order: 4,
    status: "upcoming",
  },
  {
    slug: "vgraphic",
    name: "VGraphic",
    category: "Cloud report generator",
    tagline: "Turn plant files into branded PDF reports from anywhere.",
    summary:
      "VGraphic is a cloud report generator for industrial data. Upload or connect Excel, CSV, SQL and DAT files, filter by time or file, and export branded PDF tables and graphs from a desktop or mobile browser. There is nothing to install.",
    metaTitle: "VGraphic Industrial Report Generator | Dicot",
    metaDescription:
      "VGraphic turns Excel, CSV, SQL and DAT plant data into branded PDF reports and graphs. Cloud-based, mobile and desktop, with time and file filters.",
    bestFor:
      "Quality, maintenance and production teams that spend hours turning exported data into shift and management reports.",
    facts: [
      { label: "Installation", value: "None, cloud-based" },
      { label: "Input files", value: "Excel, CSV, SQL, DAT" },
      { label: "Output", value: "PDF tables and graphs" },
      { label: "Apps", value: "Desktop and mobile" },
      { label: "Filters", value: "Time and file" },
      { label: "Branding", value: "Logo, header, footer" },
      { label: "Storage", value: "Cloud, expandable" },
      { label: "Licence", value: "1, 5 or 10 years; offline lifetime" },
    ],
    features: [
      {
        title: "No installation",
        text: "Open a browser, load the data and generate the report. Nothing to deploy on operator PCs.",
      },
      {
        title: "Works with what you already export",
        text: "Excel, CSV, SQL and DAT files from PLCs, loggers and historians.",
      },
      {
        title: "Branded PDFs",
        text: "Add your logo, header and footer so reports go out looking like your company made them.",
      },
      {
        title: "Graphs and tables",
        text: "Export both views in one report, filtered by time range or source file.",
      },
      {
        title: "Access from the floor",
        text: "Desktop and mobile apps let supervisors pull a shift report without returning to a cabin.",
      },
    ],
    plans: [
      { name: "1-year cloud", detail: "Cloud licence with report generation and storage." },
      { name: "5-year cloud", detail: "Longer cloud term for recurring reporting." },
      { name: "10-year cloud", detail: "For long-life plant and OEM programmes." },
      { name: "Offline lifetime", detail: "Perpetual offline licence for air-gapped sites." },
      { name: "Extra storage", detail: "Additional cloud storage per GB per year." },
    ],
    planNote:
      "Cloud and offline editions are available. Prices are shared through authorised dealers.",
    requirements: ["Modern browser for the cloud edition", "Excel, CSV, SQL or DAT source files", "Internet connection for cloud sync"],
    faqs: [
      {
        q: "What is VGraphic?",
        a: "VGraphic is a report generator for industrial data. It converts Excel, CSV, SQL and DAT files into branded PDF reports with tables and graphs.",
      },
      {
        q: "Do I need to install anything?",
        a: "No for the cloud edition. The offline lifetime edition is available for sites that cannot use the cloud.",
      },
      {
        q: "Can reports carry our logo?",
        a: "Yes. Logo, header and footer are configurable per report.",
      },
      {
        q: "How is VGraphic licensed?",
        a: "Cloud licences run for 1, 5 or 10 years. An offline lifetime licence and extra cloud storage are also available.",
      },
    ],
    image: "/images/vgraphic.png",
    imageAlt: "VGraphic report generator showing plotted channel data and chart options",
    order: 5,
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
