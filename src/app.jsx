import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import BenefitDetailPage from './BenefitDetailPage.jsx';
import AboutPage from './AboutPage.jsx';
import ServicesPage from './ServicesPage.jsx';
import VerticalsPage from './VerticalsPage.jsx';
import ProcessPage from './ProcessPage.jsx';
import QualityPage from './QualityPage.jsx';
import ContactPage from './ContactPage.jsx';
import InquiriesPage from './InquiriesPage.jsx';

const assets = {
  logo: new URL('./assets/branding/sapphire-asia-white-mark.png', import.meta.url).href,
  wordmark: new URL('./assets/branding/sapphire-asia-wordmark.png', import.meta.url).href,
  heroCity: new URL('./assets/sapphire-ppt/hero-city.webp', import.meta.url).href,
  businessConnections: new URL('./assets/sapphire-ppt/business-connections.webp', import.meta.url).href,
  mobileSupport: new URL('./assets/sapphire-ppt/image2.png', import.meta.url).href,
  indiaMap: new URL('./assets/maps/india.svg', import.meta.url).href,
  japanMap: new URL('./assets/maps/japan.svg', import.meta.url).href,
  processMap: new URL('./assets/sapphire-ppt/image8.png', import.meta.url).href,
  processField: new URL('./assets/sapphire-ppt/image9.png', import.meta.url).href,
  processMeeting: new URL('./assets/sapphire-ppt/image10.png', import.meta.url).href,
  processAssess: new URL('./assets/sapphire-ppt/image11.jpeg', import.meta.url).href,
  processInterview: new URL('./assets/sapphire-ppt/image12.jpeg', import.meta.url).href,
  processBoard: new URL('./assets/sapphire-ppt/image13.png', import.meta.url).href,
  processChecklist: new URL('./assets/sapphire-ppt/image14.jpeg', import.meta.url).href,
  altran: new URL('./assets/sapphire-ppt/image17.png', import.meta.url).href,
  creativeSynergies: new URL('./assets/sapphire-ppt/image18.png', import.meta.url).href,
  mecaplast: new URL('./assets/sapphire-ppt/image19.png', import.meta.url).href,
  pricol: new URL('./assets/sapphire-ppt/image20.jpeg', import.meta.url).href,
  veeCreate: new URL('./assets/sapphire-ppt/image21.png', import.meta.url).href,
  semcon: new URL('./assets/sapphire-ppt/image22.png', import.meta.url).href,
  rleInternational: new URL('./assets/sapphire-ppt/image23.png', import.meta.url).href,
  morbark: new URL('./assets/sapphire-ppt/image24.jpeg', import.meta.url).href,
  inditeq: new URL('./assets/sapphire-ppt/inditeq.webp', import.meta.url).href,
  valeo: new URL('./assets/sapphire-ppt/image26.png', import.meta.url).href,
  etcs: new URL('./assets/sapphire-ppt/image27.jpeg', import.meta.url).href,
  mahindra: new URL('./assets/sapphire-ppt/image28.png', import.meta.url).href,
  godrej: new URL('./assets/sapphire-ppt/image29.jpeg', import.meta.url).href,
  ebz: new URL('./assets/sapphire-ppt/image30.png', import.meta.url).href,
  magna: new URL('./assets/sapphire-ppt/image31.png', import.meta.url).href,
  difacto: new URL('./assets/sapphire-ppt/image32.jpeg', import.meta.url).href,
  gm: new URL('./assets/sapphire-ppt/image33.jpeg', import.meta.url).href,
  volkswagen: new URL('./assets/sapphire-ppt/image34.png', import.meta.url).href,
  tesla: new URL('./assets/sapphire-ppt/image35.png', import.meta.url).href,
  mercedes: new URL('./assets/sapphire-ppt/image36.png', import.meta.url).href,
  reportingGroup: new URL('./assets/sapphire-ppt/image37.jpeg', import.meta.url).href,
  reportingTable: new URL('./assets/sapphire-ppt/image38.jpeg', import.meta.url).href,
  reportingMeeting: new URL('./assets/sapphire-ppt/image39.jpeg', import.meta.url).href,
  chinaMap: new URL('./assets/maps/china.svg', import.meta.url).href,
  singaporeMap: new URL('./assets/maps/singapore.svg', import.meta.url).href,
  northAmericaMap: new URL('./assets/maps/north-america.svg', import.meta.url).href,
  africaMap: new URL('./assets/maps/africa.svg', import.meta.url).href,
  australiaMap: new URL('./assets/maps/australia.svg', import.meta.url).href,
  finlandMap: new URL('./assets/maps/finland.svg', import.meta.url).href,
};

function SmartImage({
  alt,
  className,
  priority = false,
  src,
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      draggable="false"
    />
  );
}

const missionPoints = [
  'Leading service provider for Japan and India corporations.',
  'Handling commercial intricacies across cross-border business transactions and sectors.',
  'Addressing gaps in business understanding and customer insight.',
  'Helping clients navigate market uncertainties with steady confidence.',
  'Helping companies innovate and launch new capabilities faster.',
];

const services = [
  'Advising Japanese companies in manufacturing, construction, and adjacent sectors for joint ventures in India.',
  'Providing consultancy to Indian subsidiaries of Japan-based companies.',
  'Offering compliance and governance support as a full-service partner.',
  'Assisting wholly owned Indian subsidiaries of Japanese companies with approvals and government guidance.',
  'Providing post-establishment business support after launch.',
  'Helping companies expand into new markets with a cross-border PM team.',
  'Reducing complexity by consolidating multiple providers under one project management structure.',
  'Supporting projects with experienced consultants who understand both Japan and India.',
];

const verticals = [
  {
    title: 'Business Consulting',
    icon: Building2,
    accent: 'from-slate-700 to-slate-950',
    summary: 'Strategic guidance and market-entry support for companies building between India and Japan.',
    bullets: [
      'Business consulting and development.',
      'Customer visit management from Japan to India and vice versa.',
      'IT Management.',
      'Bilingual resources.',
      'Virtual office and plug-and-play setup for temporary operations.',
    ],
  },
  {
    title: 'International School',
    icon: GraduationCap,
    accent: 'from-sky-500 to-indigo-600',
    websiteUrl: 'https://kerriainternationalschool.com/',
    websiteLabel: 'Kerria International School',
    summary: 'Bilingual international education in Tokyo (Edogawa-ku) offering preschool, kindergarten, and after-school programs.',
    bullets: [
      'Bilingual curriculum led by native English and Japanese educators.',
      'Early childhood education: preschool, kindergarten & after-school care.',
      'Thematic learning approach bridging social, emotional, and academic development.',
      'Approved for Japanese government childcare subsidy in Tokyo (Edogawa / Koto-ku).',
    ],
  },
  {
    title: 'Technology',
    icon: Cpu,
    accent: 'from-cyan-500 to-blue-700',
    websiteUrl: 'https://m4spider.com/',
    websiteLabel: 'M4 Spider Technologies',
    summary: 'Building intelligent software products, AI solutions, developer tools, and enterprise digital systems.',
    bullets: [
      'Proprietary AI solutions including Spider AI, Spider Maps, and Notebook AI Agents.',
      'Intelligent software products and developer tool creation.',
      'Custom software development, cloud infrastructure, and system architecture.',
      'Cross-border IT project execution and product engineering.',
    ],
  },
  {
    title: 'Restaurants',
    icon: Utensils,
    accent: 'from-amber-500 to-rose-600',
    websiteUrl: 'https://andhradining.com/',
    websiteLabel: 'Andhra Dining',
    summary: 'Authentic South Indian and Andhra regional cuisine across Tokyo (Ginza, Shibuya) supporting restaurant expansion.',
    bullets: [
      'Authentic traditional Andhra thalis, biryanis, and South Indian specialties in Tokyo.',
      'Popular dining destination for international food lovers and Indian diaspora in Japan.',
      'Expanding restaurant group across major Tokyo locations (Ginza, Shibuya, Okachimachi).',
      'End-to-end support for restaurant market entry, staff sourcing, and operations in Japan.',
    ],
  },
  {
    title: 'Imports & Exports',
    icon: Globe,
    accent: 'from-emerald-500 to-teal-700',
    summary: 'Cross-border trade, product sourcing, customs compliance, and international logistics support.',
    bullets: [
      'India-Japan cross-border import and export management.',
      'Sourcing and procurement of high-quality products and materials.',
      'Customs clearance, documentation, and regulatory compliance.',
      'Supply chain management, warehousing, and distribution channels.',
      'Market-entry strategy for trade expansion across Asia.',
    ],
  },
];

const processSteps = [
  {
    title: 'Identify the locations',
    copy: 'Understand the requirement from the Japanese supervising organization and map the right operating geography.',
    image: assets.processMap,
  },
  {
    title: 'Field work',
    copy: 'Select the right partners and validate the market with on-ground research and outreach.',
    image: assets.processField,
  },
  {
    title: 'Meetings, interviews and follow-up',
    copy: 'Coordinate meetings with the Japanese counterpart, interview stakeholders, and continue follow-up until fit is clear.',
    image: assets.processMeeting,
  },
  {
    title: 'Assessment and review',
    copy: 'Run continuous assessment, support incorporation, and align contracts and MoUs for the next stage.',
    image: assets.processAssess,
  },
];

const partnerLogos = [
  { name: 'Altran', image: assets.altran },
  { name: 'Creative Synergies', image: assets.creativeSynergies },
  { name: 'Mecaplast Group', image: assets.mecaplast },
  { name: 'Pricol', image: assets.pricol },
  { name: 'Vee Create', image: assets.veeCreate },
  { name: 'Semcon', image: assets.semcon },
  { name: 'RLE International', image: assets.rleInternational },
  { name: 'Morbark', image: assets.morbark },
  { name: 'Inditeq', image: assets.inditeq },
  { name: 'Valeo', image: assets.valeo },
  { name: 'ETCS Inc', image: assets.etcs },
  { name: 'Mahindra', image: assets.mahindra },
  { name: 'Godrej Tooling', image: assets.godrej },
  { name: 'EBZ SysTec', image: assets.ebz },
  { name: 'Magna', image: assets.magna },
  { name: 'DiFacto', image: assets.difacto },
  { name: 'General Motors', image: assets.gm },
  { name: 'Volkswagen', image: assets.volkswagen },
  { name: 'Tesla', image: assets.tesla },
  { name: 'Mercedes-Benz', image: assets.mercedes },
];

const partnerRailA = [...partnerLogos.slice(0, 10), ...partnerLogos.slice(0, 10)];
const partnerRailB = [...partnerLogos.slice(10), ...partnerLogos.slice(10)];

const qualityPhases = [
  {
    title: 'Planning',
    bullets: [
      'Quality plan available for tracking defects, schedule, and efforts.',
      'Acceptance criteria sign-off before work starts.',
    ],
  },
  {
    title: 'Execution',
    bullets: [
      'Quality checklists followed through delivery.',
      'Second-level peer review to target 100% quality.',
    ],
  },
  {
    title: 'Management',
    bullets: [
      'Project metrics monitored in monthly review meetings.',
      'Customer feedback analysis and review.',
      'Lessons learned and process improvement monitoring.',
    ],
  },
  {
    title: 'Post Delivery',
    bullets: [
      'Customer feedback at the end of project delivery.',
      'Quarterly customer satisfaction survey.',
      'Root cause analysis for critical issues.',
    ],
  },
];

const monitoringDocuments = [
  {
    title: 'Project Communication',
    image: assets.reportingGroup,
    detail:
      'A single communication sheet for the entire project to avoid duplicate questions and keep shared context in one place.',
    benefit: 'Avoids duplication and centralizes information.',
  },
  {
    title: 'Statement Of Work',
    image: assets.reportingTable,
    detail:
      'Summarizes scope, inputs, deliverables, and timelines so both sides align before execution begins.',
    benefit: 'Creates clarity on deliverables and supports proper project planning.',
  },
  {
    title: 'QC Sheets',
    image: assets.reportingTable,
    detail:
      'Captures quality requirements before project start so deliveries match the approved expectations.',
    benefit: 'Supports better quality and defect-free delivery.',
  },
  {
    title: 'Project Tracking Sheet',
    image: assets.reportingMeeting,
    detail:
      'Tracks planned and actual dates for parts and assemblies to keep execution visible throughout the project.',
    benefit: 'Improves planning and day-to-day tracking.',
  },
  {
    title: 'Engagement Performance Assessment',
    image: assets.reportingGroup,
    detail:
      'Periodic client feedback to understand service quality and identify areas for improvement.',
    benefit: 'Drives continuous improvement and better service delivery.',
  },
];

const reportingRows = [
  {
    group: 'Project Leads & Offshore Team',
    role: 'Technical team',
    cadence: 'Weekly status reports and weekly or monthly meetings',
  },
  {
    group: 'Middle Management',
    role: 'Account managers',
    cadence: 'Monthly status reports and quarterly meetings',
  },
  {
    group: 'Senior Management',
    role: 'Delivery head / client',
    cadence: 'Monthly status reports and half-yearly meetings',
  },
];

const benefits = [
  {
    id: 'prompt-communication',
    title: 'Prompt in communication',
    summary: 'Faster communication loops help cross-border teams move without waiting for avoidable clarification delays.',
    highlights: [
      'Shortens the time between question, answer, and action.',
      'Improves coordination between Japan-facing and India-based teams.',
      'Keeps customer interactions more transparent and easier to track.',
      'Reduces friction during approvals, reviews, and follow-up.',
    ],
    impacts: [
      { title: 'Fewer bottlenecks', body: 'Decisions do not stall because updates, reviews, and queries move faster.' },
      { title: 'Cleaner project flow', body: 'Teams stay aligned when expectations and status are communicated promptly.' },
      { title: 'Better client confidence', body: 'Consistent responsiveness makes the delivery model feel dependable.' },
    ],
    closer: 'Prompt communication turns cross-border coordination from a risk area into an operating strength.',
  },
  {
    id: 'reduced-time-to-market',
    title: 'Reduced time to market',
    summary: 'The delivery model is built to help businesses reach launch or operational readiness faster.',
    highlights: [
      'Reduces delays in setup, approvals, and coordination.',
      'Brings market-entry support and execution under one structure.',
      'Supports quicker movement from study to action.',
      'Helps compress planning and launch timelines.',
    ],
    impacts: [
      { title: 'Faster entry', body: 'Companies can start market activity earlier instead of losing time to fragmentation.' },
      { title: 'Earlier feedback', body: 'Launches happen sooner, which means the business learns from the market faster.' },
      { title: 'Better competitiveness', body: 'Speed improves positioning when entering or expanding in active markets.' },
    ],
    closer: 'Reduced time to market means the opportunity is reached before it cools down.',
  },
  {
    id: 'fast-turnaround-time',
    title: 'Fast turnaround time',
    summary: 'Sapphire Asia emphasizes quick response and execution cycles across support, consulting, and coordination work.',
    highlights: [
      'Shortens response time for project needs and operational follow-ups.',
      'Supports faster issue handling and decision turnaround.',
      'Improves delivery rhythm across multiple stakeholders.',
      'Keeps work moving even when teams are distributed across countries.',
    ],
    impacts: [
      { title: 'Less waiting', body: 'Projects lose less time between handoffs and review points.' },
      { title: 'Higher momentum', body: 'Faster turnaround helps teams maintain pace through execution.' },
      { title: 'Operational confidence', body: 'Clients experience the business as responsive rather than reactive.' },
    ],
    closer: 'Fast turnaround is a visible signal that the operating model is active, organized, and accountable.',
  },
  {
    id: 'business-satisfaction',
    title: 'Business expectations and satisfaction',
    summary: 'Delivery is shaped around alignment, visibility, and follow-through so expectations are met more consistently.',
    highlights: [
      'Creates clearer expectations before work starts.',
      'Uses reporting and review cycles to maintain transparency.',
      'Tracks quality before delivery reaches the client.',
      'Supports long-term trust instead of one-off completion.',
    ],
    impacts: [
      { title: 'Better experience', body: 'Clients see clearer communication, steadier updates, and fewer surprises.' },
      { title: 'Stronger retention', body: 'Satisfaction improves when service quality stays visible across the lifecycle.' },
      { title: 'More reliable outcomes', body: 'Projects are less likely to drift away from agreed expectations.' },
    ],
    closer: 'Satisfaction grows when expectations are not only promised well, but managed well.',
  },
  {
    id: 'cross-functional-expertise',
    title: 'Cross-functional expertise',
    summary: 'The model combines business consulting, technical coordination, quality controls, and cross-border support under one umbrella.',
    highlights: [
      'Supports clients across business, technical, and operational needs.',
      'Connects strategy, execution, and governance instead of isolating them.',
      'Reduces dependency on multiple disconnected service providers.',
      'Improves coordination when projects span sectors and disciplines.',
    ],
    impacts: [
      { title: 'Broader support', body: 'Clients can solve more problems without reassembling a new team each time.' },
      { title: 'Smoother integration', body: 'Cross-functional knowledge improves handoffs between project layers.' },
      { title: 'Lower coordination cost', body: 'Fewer external gaps mean fewer management burdens for the client.' },
    ],
    closer: 'Cross-functional expertise is what helps the bridge stay useful across different industries and project types.',
  },
  {
    id: '24x7-support',
    title: '24 x 7 business support',
    summary: 'Time-zone coverage and cross-border coordination create a more continuous support experience.',
    highlights: [
      'Improves continuity between regions and teams.',
      'Helps reduce downtime caused by waiting for the next local business day.',
      'Supports faster escalation and visibility across borders.',
      'Keeps client-facing operations more responsive.',
    ],
    impacts: [
      { title: 'More continuity', body: 'Work progresses across time windows instead of pausing unnecessarily.' },
      { title: 'Faster issue handling', body: 'Important updates can move earlier through the support chain.' },
      { title: 'Higher resilience', body: 'Clients benefit from a model that feels active beyond a single office schedule.' },
    ],
    closer: '24 x 7 support gives the business model a more durable and responsive operating pulse.',
  },
  {
    id: 'reliable-quality',
    title: 'Reliable quality',
    summary: 'The quality framework is designed to make delivery consistent, reviewable, and trustworthy.',
    highlights: [
      'Uses quality plans, checklists, and peer review.',
      'Monitors metrics and customer feedback over time.',
      'Adds governance instead of relying on informal checking.',
      'Builds confidence through repeated process discipline.',
    ],
    impacts: [
      { title: 'Fewer avoidable issues', body: 'Structured review catches more problems before delivery.' },
      { title: 'Higher predictability', body: 'Clients can expect a steadier standard across projects.' },
      { title: 'Better reputation', body: 'Reliable quality strengthens long-term trust and credibility.' },
    ],
    closer: 'Reliable quality is not a slogan here; it is the result of repeated checkpoints and visible controls.',
  },
  {
    id: 'zero-defect-delivery',
    title: 'Error-free / zero-defect delivery',
    summary: 'The project structure aims to reduce defects through planned quality gates rather than relying on last-minute correction.',
    highlights: [
      'Encourages defect prevention before final delivery.',
      'Uses QC sheets and acceptance criteria to set the right standard early.',
      'Supports review discipline across execution and management.',
      'Improves confidence in client-facing output.',
    ],
    impacts: [
      { title: 'Cleaner delivery', body: 'Output reaches the client in a more complete and stable state.' },
      { title: 'Less rework', body: 'Teams spend less energy fixing avoidable mistakes after the fact.' },
      { title: 'Stronger trust', body: 'Consistent low-defect delivery improves perceived professionalism.' },
    ],
    closer: 'Zero-defect delivery is the goal that the quality and PMO system is built to serve.',
  },
  {
    id: 'optimized-costs',
    title: 'Low overheads and optimized costs',
    summary: 'The integrated support model helps clients avoid unnecessary overhead from fragmented coordination and duplicated effort.',
    highlights: [
      'Reduces duplication across providers and conversations.',
      'Improves planning and control, which lowers waste.',
      'Supports leaner operations during entry and execution.',
      'Helps clients do more with a coordinated support structure.',
    ],
    impacts: [
      { title: 'Less waste', body: 'Better coordination means fewer repeated tasks and management overheads.' },
      { title: 'More efficient scaling', body: 'Businesses can expand with a tighter support structure behind them.' },
      { title: 'Sharper value', body: 'Clients get more useful output from a more organized delivery model.' },
    ],
    closer: 'Optimized cost is strongest when coordination, quality, and execution are designed to work together.',
  },
];

const footprint = [
  { name: 'Japan', accent: 'from-cyan-400/20 to-sky-500/10', line: 'Japan-facing strategy and business relationships', map: assets.japanMap, mapLabel: 'Japan map silhouette' },
  { name: 'India', accent: 'from-blue-500/20 to-cyan-400/10', line: 'Execution, delivery, and operational support', map: assets.indiaMap, mapLabel: 'India map silhouette' },
  { name: 'China', accent: 'from-emerald-400/20 to-cyan-400/10', line: 'Regional business awareness and wider Asia links', map: assets.chinaMap, mapLabel: 'China map silhouette' },
  { name: 'Singapore', accent: 'from-amber-400/20 to-cyan-400/10', line: 'Strategic gateway for Asia-linked opportunities', map: assets.singaporeMap, mapLabel: 'Singapore map silhouette' },
  { name: 'North America', accent: 'from-violet-400/20 to-cyan-400/10', line: 'Customer and project reach into North America', map: assets.northAmericaMap, mapLabel: 'North America map silhouette' },
  { name: 'Africa', accent: 'from-orange-400/20 to-cyan-400/10', line: 'Global project reach across emerging markets', map: assets.africaMap, mapLabel: 'Africa map silhouette' },
  { name: 'Australia', accent: 'from-rose-400/20 to-cyan-400/10', line: 'Broader APAC-facing international services footprint', map: assets.australiaMap, mapLabel: 'Australia map silhouette' },
  { name: 'Finland', accent: 'from-slate-300/20 to-cyan-400/10', line: 'European-facing presence in the execution network', map: assets.finlandMap, mapLabel: 'Finland map silhouette' },
];

const navItems = [
  ['About', 'about'],
  ['Services', 'services'],
  ['Verticals', 'verticals'],
  ['Process', 'process'],
  ['Quality', 'quality'],
  ['Contact', 'contact'],
  ['Inquiries', 'inquiries'],
];

function SectionIntro({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
      <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">{eyebrow}</div>
      <div className="section-spark mt-4" />
      <h2 className="mt-4 text-4xl md:text-5xl font-black leading-tight text-white">{title}</h2>
      {copy ? <p className="mt-5 text-base md:text-lg leading-8 text-slate-300">{copy}</p> : null}
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [activeBenefit, setActiveBenefit] = useState(null);
  const benefitReturnScrollRef = useRef(0);
  const shouldRestoreBenefitScrollRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!activeBenefit && shouldRestoreBenefitScrollRef.current) {
      shouldRestoreBenefitScrollRef.current = false;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: benefitReturnScrollRef.current, behavior: 'auto' });
      });
    }
  }, [activeBenefit]);

  const openPage = (id) => {
    setMenuOpen(false);
    setActivePage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBenefit = (benefit) => {
    benefitReturnScrollRef.current = window.scrollY;
    shouldRestoreBenefitScrollRef.current = false;
    setActiveBenefit(benefit);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeBenefit = () => {
    shouldRestoreBenefitScrollRef.current = true;
    setActiveBenefit(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'about':
        return <AboutPage assets={assets} missionPoints={missionPoints} SmartImage={SmartImage} />;
      case 'services':
        return (
          <ServicesPage
            SectionIntro={SectionIntro}
            services={services}
            benefits={benefits}
            footprint={footprint}
            onBenefitOpen={openBenefit}
            SmartImage={SmartImage}
          />
        );
      case 'verticals':
        return <VerticalsPage SectionIntro={SectionIntro} verticals={verticals} />;
      case 'process':
        return <ProcessPage SectionIntro={SectionIntro} processSteps={processSteps} assets={assets} SmartImage={SmartImage} />;
      case 'quality':
        return (
          <QualityPage
            SectionIntro={SectionIntro}
            qualityPhases={qualityPhases}
            assets={assets}
            monitoringDocuments={monitoringDocuments}
            reportingRows={reportingRows}
            SmartImage={SmartImage}
          />
        );
      case 'contact':
        return <ContactPage />;
      case 'inquiries':
        return <InquiriesPage />;
      default:
        return null;
    }
  };

  if (activeBenefit) {
    return <BenefitDetailPage benefit={activeBenefit} onBack={closeBenefit} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#143b58_0%,_#1d5578_34%,_#255f80_56%,_#163a50_80%,_#081726_100%)] text-white">
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-white/12 bg-[rgba(12,35,53,0.92)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <button
            onClick={() => openPage('home')}
            className="flex items-center gap-4 text-left"
          >
            <SmartImage src={assets.logo} alt="Sapphire Asia logo" className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20" priority />
            <SmartImage src={assets.wordmark} alt="Sapphire Asia wordmark" className="h-10 w-auto max-w-[13rem] object-contain sm:h-12 sm:max-w-[16rem] lg:h-14 lg:max-w-[19rem]" priority />
          </button>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map(([label, id]) => (
              <button
                key={id}
                onClick={() => openPage(id)}
                className={`text-sm font-bold uppercase tracking-[0.18em] transition hover:text-white ${
                  activePage === id ? 'text-white' : 'text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-2xl border border-white/15 bg-[rgba(12,31,47,0.72)] p-3 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 transition ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        } lg:hidden`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed inset-x-5 top-24 z-50 rounded-[2rem] border border-white/15 bg-[rgba(12,31,47,0.92)] p-6 shadow-2xl transition lg:hidden ${
          menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-3">
          {navItems.map(([label, id]) => (
            <button
              key={id}
              onClick={() => openPage(id)}
              className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/6 px-4 py-4 text-left text-sm font-bold uppercase tracking-[0.18em] text-white"
            >
              {label}
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </div>

      {activePage === 'home' ? (
      <>
      <header className="relative" id="top">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(13,42,62,0.08)_0%,_rgba(13,42,62,0)_48%)]" />
        <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.32em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Bridging for the better world
            </div>

            <h1 className="mt-8 max-w-4xl font-['Cormorant_Garamond'] text-6xl leading-[0.95] text-white sm:text-7xl lg:text-[6.5rem]">
              A better way to manage cross-culture businesses.
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openPage('about')}
                className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200"
              >
                Explore the full story
                <ArrowRight size={18} />
              </button>
            </div>

          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
              <SmartImage
                src={assets.businessConnections}
                alt="Business connections handshake"
                className="aspect-[1522/580] w-full rounded-[2rem] bg-[#1d5578] object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <section id="about" className="mx-auto mt-6 max-w-7xl px-5 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">About Us</div>
              <h2 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
                Strategic, management, and consulting support for businesses crossing India and Japan.
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-300">
                Sapphire Asia is a one-stop platform supporting expansion business in India and Japan. The company
                combines strategic thinking, practical execution, and cultural insight to build a bridge between
                business vision and grounded business consultancy.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-300">
                The approach is human-centric: balancing technology, consulting, operations, and relationship management
                so cross-border businesses can move with more clarity and control.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="lift-card rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                  <SmartImage src={assets.japanMap} alt="Japan map" className="h-14 w-14 rounded-2xl bg-[rgba(255,255,255,0.88)] object-contain p-2" />
                  <div className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-400">Company structure</div>
                  <div className="mt-2 text-2xl font-black">Tokyo</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">Strategic front-end, relationship building, and Japan-facing delivery coordination.</p>
                </div>
                <div className="lift-card rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                  <SmartImage src={assets.indiaMap} alt="India map" className="h-14 w-14 rounded-2xl bg-[rgba(255,255,255,0.88)] object-contain p-2" />
                  <div className="mt-5 text-sm uppercase tracking-[0.24em] text-blue-100/70">Execution hub</div>
                  <div className="mt-2 text-2xl font-black">Hyderabad</div>
                  <p className="mt-3 text-sm leading-7 text-blue-50/80">Delivery, project coordination, operational support, and India-side expansion services.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3 text-cyan-300">
                  <Target size={20} />
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.32em]">Our Mission</div>
                </div>
                <div className="mt-6 space-y-4">
                  {missionPoints.map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-1 shrink-0 text-cyan-300" size={18} />
                      <p className="text-sm leading-7 text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="border-b border-white/12 bg-gradient-to-br from-cyan-400/12 via-blue-500/8 to-transparent p-7">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-cyan-300">Why this matters</div>
                  <h3 className="mt-4 text-2xl font-black text-white">Built for plug-and-play cross-border execution.</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    The deck emphasizes plug-and-play support, virtual operations, and easier communication.
                  </p>
                </div>

                <div className="grid gap-0 sm:grid-cols-3">
                  {[
                    ['Virtual setup', 'Fast operational support for temporary or early-stage business activity.'],
                    ['Bilingual bridge', 'Clearer communication between India- and Japan-facing teams.'],
                    ['Visible delivery', 'Strategy, support, and execution shown upfront instead of buried in hidden sections.'],
                  ].map(([title, body], index) => (
                    <div
                      key={title}
                      className={`p-5 ${index > 0 ? 'border-t border-white/10 sm:border-t-0 sm:border-l' : ''} sm:border-white/10`}
                    >
                      <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <div className="overflow-hidden rounded-[2.4rem] border border-cyan-100/14 bg-[linear-gradient(135deg,rgba(32,77,108,0.72),rgba(52,103,138,0.68)_38%,rgba(34,77,104,0.7)_100%)]">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-white/10 p-7 md:p-10 lg:border-b-0 lg:border-r">
                <SectionIntro
                  eyebrow="What We Do"
                  title="Hands-on support across advisory, governance, execution, and expansion."
                />
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                {services.map((service, index) => (
                  <div key={service} className="border-t border-white/10 p-6 first:border-t-0 md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(odd)]:border-r md:border-white/10">
                    <div className="text-4xl font-black text-white/15">{String(index + 1).padStart(2, '0')}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{service}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="verticals" className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <SectionIntro
            eyebrow="Business Verticals"
            title="Current service provided and customers"
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {verticals.map((vertical) => {
              const Icon = vertical.icon;
              return (
                <article key={vertical.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${vertical.accent}`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black">{vertical.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{vertical.summary}</p>
                  <div className="mt-6 space-y-3">
                    {vertical.bullets.map((bullet) => (
                      <div key={bullet} className="flex gap-3">
                        <ChevronRight size={18} className="mt-1 shrink-0 text-cyan-300" />
                        <p className="text-sm leading-7 text-slate-300">{bullet}</p>
                      </div>
                    ))}
                  </div>

                  {vertical.websiteUrl && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <a
                        href={vertical.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-300/20 hover:text-white"
                      >
                        <span>Visit Website</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section id="process" className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
            <SectionIntro
              eyebrow="Our Services Process"
              title="How Sapphire Asia builds the bridge from idea to execution."
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <div key={step.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                  <SmartImage src={step.image} alt={step.title} className="h-24 w-24 rounded-2xl bg-white object-contain p-3" />
                  <div className="mt-5 text-xs font-extrabold uppercase tracking-[0.28em] text-cyan-300">
                    Step {index + 1}
                  </div>
                  <h3 className="mt-3 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <SmartImage src={assets.processInterview} alt="Assessment icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                <p className="mt-4 text-sm leading-7 text-slate-300">Assessment stays continuous, not one-time.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <SmartImage src={assets.processBoard} alt="Presentation icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                <p className="mt-4 text-sm leading-7 text-slate-300">Partner selection and alignment are treated as working sessions with feedback loops, not just static introductions.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <SmartImage src={assets.processChecklist} alt="Checklist icon" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                <p className="mt-4 text-sm leading-7 text-slate-300">Contracts, MoUs, and formal review checkpoints are part of the process from the start.</p>
              </div>
            </div>
          </div>
        </section>



        <section id="quality" className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
              <SectionIntro
                eyebrow="Quality Assurance"
                title="The best to everyone."
              />

              <div className="mt-7 grid gap-5 xl:grid-cols-2">
                {qualityPhases.map((phase) => (
                  <div key={phase.title} className="lift-card rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-cyan-300" />
                      <h3 className="text-lg font-black">{phase.title}</h3>
                    </div>
                    <div className="mt-4 space-y-3">
                      {phase.bullets.map((bullet) => (
                        <div key={bullet} className="flex gap-3">
                          <CheckCircle2 size={18} className="mt-1 shrink-0 text-cyan-300" />
                          <p className="text-sm leading-7 text-slate-300">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-300">Review Cycle Snapshot</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Planning', 'Execution', 'Management', 'Post Delivery'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: 'Peer Review',
                      copy: 'Second-level checks keep quality consistent before delivery.',
                      image: assets.reportingGroup,
                    },
                    {
                      title: 'Quality Checklist',
                      copy: 'Requirements are aligned before execution starts.',
                      image: assets.reportingTable,
                    },
                    {
                      title: 'Customer Feedback',
                      copy: 'Periodic feedback helps identify improvements early.',
                      image: assets.reportingMeeting,
                    },
                  ].map((item) => (
                    <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                      <SmartImage src={item.image} alt={item.title} className="h-12 w-12 rounded-xl bg-white object-contain p-2" />
                      <div className="mt-3 text-sm font-black text-white">{item.title}</div>
                      <p className="mt-2 text-xs leading-6 text-slate-300">{item.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-300">Quality Outcomes</div>
                <h3 className="mt-3 text-2xl font-black text-white">What the review system is designed to protect.</h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: 'Defect-free delivery',
                      body: 'QC sheets and peer review keep output aligned before it reaches the client.',
                    },
                    {
                      title: 'Planning clarity',
                      body: 'Scope, timelines, and acceptance criteria are locked before execution starts.',
                    },
                    {
                      title: 'Continuous improvement',
                      body: 'Metrics reviews and customer feedback create a recurring improvement loop.',
                    },
                    {
                      title: 'Cross-team visibility',
                      body: 'Technical, account, and senior management reporting stays synchronized.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                      <div className="text-sm font-black uppercase tracking-[0.14em] text-white">{item.title}</div>
                      <p className="mt-2 text-xs leading-6 text-slate-300">{item.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
                  Sapphire Asia's PMO model is not just about reporting status. It is built to catch issues early,
                  validate quality before delivery, and keep improvement actions visible across the full lifecycle.
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Project Monitoring Documents</div>
              <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Operational documents that keep delivery visible.</h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {monitoringDocuments.map((doc) => (
                  <article key={doc.title} className="lift-card rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                    <SmartImage src={doc.image} alt={doc.title} className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                    <h3 className="mt-4 text-lg font-black">{doc.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{doc.detail}</p>
                    <div className="mt-4 rounded-2xl bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                      Benefit: {doc.benefit}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-cyan-300" />
                  <h3 className="text-xl font-black">Reporting Interaction</h3>
                </div>
                <div className="mt-6 space-y-4">
                  {reportingRows.map((row) => (
                    <div key={row.group} className="lift-card flex flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.045] px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-black">{row.group}</div>
                        <div className="text-sm text-slate-400">{row.role}</div>
                      </div>
                      <div className="max-w-sm text-sm leading-7 text-cyan-100">{row.cadence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-transparent p-7 md:p-10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-200">Business Benefits</div>
              <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Business benefit with Sapphire Asia.</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit) => (
                  <button
                    key={benefit.id}
                    onClick={() => openBenefit(benefit)}
                    className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] px-4 py-4 text-left text-sm font-bold leading-6 text-slate-100"
                  >
                    <div>{benefit.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto mt-8 max-w-7xl px-5 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Contact Us</div>
              <h2 className="mt-4 text-4xl font-black">Leadership contacts.</h2>

              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Box 1: Leadership Contact Card (No Map Button) */}
                <div className="lift-card flex flex-col justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                  <div>
                    <div className="text-xl font-black">Dr. Saradhi Paramata</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Director</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-cyan-300" /> Sapphire Asia KK</div>
                      <div className="flex items-start gap-3"><Phone size={16} className="mt-1 shrink-0 text-cyan-300" /> India: +91 89772837449</div>
                      <div className="flex items-start gap-3"><Phone size={16} className="mt-1 shrink-0 text-cyan-300" /> Japan: +81 9084644889</div>
                      <div className="flex items-start gap-3"><Mail size={16} className="mt-1 shrink-0 text-cyan-300" /> saradhi@sapphire-asia.com</div>
                    </div>
                  </div>
                </div>

                {/* Box 2: Dedicated Address Box */}
                <div className="lift-card flex flex-col justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">Tokyo Headquarters</div>
                    <div className="mt-2 text-xl font-black">Office Address</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-1 shrink-0 text-cyan-300" />
                        <span className="leading-6 font-medium text-slate-200">
                          〒110-0005 Tokyo, Taito City, Ueno, 3-20-2 Mizuno building B
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10">
                    <a
                      href="https://maps.m4spider.com/?lat=35.70584&lng=139.77352&zoom=16&embed=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-300/20 hover:text-white"
                    >
                      <span>Open SpiderMaps</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Box 3: Map Only Container */}
                <div className="overflow-hidden rounded-[1.6rem] border border-cyan-400/20 bg-slate-950/80 shadow-2xl min-h-[300px] h-full w-full">
                  <iframe
                    src="https://maps.m4spider.com/?lat=35.70584&lng=139.77352&zoom=16&embed=true"
                    title="SpiderMaps Tokyo Office Location"
                    className="h-full w-full min-h-[300px] border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div id="inquiries" className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:p-10">
              <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Inquiry Snapshot</div>
                  <h3 className="mt-4 text-3xl font-black">Ready for a proper inquiry flow.</h3>

                  <div className="mt-6 space-y-4">
                    {[
                      ['Cross-border expansion', 'India-Japan business setup, coordination, and execution support.'],
                      ['Project monitoring', 'Structured communication, quality tracking, review cycles, and reporting cadence.'],
                      ['Market entry support', 'Consulting, partner selection, vertical-specific expansion, and bilingual support.'],
                    ].map(([title, body]) => (
                      <div key={title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                        <div className="text-sm font-black uppercase tracking-[0.18em] text-white">{title}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-300">{body}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-cyan-300">Quick Guide</div>
                  <div className="mt-5 space-y-4">
                    {[
                      { icon: FileText, title: 'Scope clearly', body: 'Share business objective, sector, and operating geography.' },
                      { icon: Search, title: 'Match support', body: 'We map the right consulting, vertical, and process support.' },
                      { icon: TrendingUp, title: 'Move forward', body: 'Review structure, timeline, and execution path together.' },
                      { icon: ClipboardCheck, title: 'Stay governed', body: 'Quality, communication, and tracking stay visible throughout delivery.' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="lift-card rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                          <Icon size={18} className="text-cyan-300" />
                          <div className="mt-3 text-sm font-black uppercase tracking-[0.16em]">{item.title}</div>
                          <div className="mt-2 text-sm leading-6 text-slate-300">{item.body}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      </>
      ) : (
        renderPage()
      )}
    </div>
  );
}

export default App;
