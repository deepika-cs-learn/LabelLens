import { LegalMetrologyRuleInfo, SamplePack } from '../types';

// Helper to generate SVG data URIs for sample packaging labels
function generateSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const SAMPLE_PACKS: SamplePack[] = [
  {
    id: 'sp-1-masala-compliant',
    title: 'Swadish Royal Garam Masala (100g)',
    category: 'Spices & Seasonings',
    brand: 'Swadish Spices Ltd',
    thumbnail: '',
    scenarioType: 'compliant',
    expectedViolationsCount: 0,
    description: 'Fully compliant FMCG spice pouch with all 6 mandatory statutory declarations, correct standard SI units, MRP incl. of all taxes, complete consumer care and manufacturer address.',
    imageData: generateSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#800000; font-family: 'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7a0c0c"/>
      <stop offset="50%" stop-color="#991515"/>
      <stop offset="100%" stop-color="#550707"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF4B8"/>
      <stop offset="100%" stop-color="#AA771C"/>
    </linearGradient>
  </defs>

  <!-- Pouch Background -->
  <rect width="800" height="1000" rx="16" fill="url(#bgGrad)" stroke="#AA771C" stroke-width="6"/>
  
  <!-- Header / Brand -->
  <rect x="40" y="30" width="720" height="12" fill="url(#goldGrad)" rx="6"/>
  <circle cx="400" cy="110" r="50" fill="#111" stroke="url(#goldGrad)" stroke-width="3"/>
  <text x="400" y="118" font-size="28" font-weight="900" fill="#D4AF37" text-anchor="middle">SWADISH</text>
  
  <text x="400" y="200" font-size="44" font-weight="900" fill="#FFF" text-anchor="middle" letter-spacing="2">ROYAL GARAM MASALA</text>
  
  <!-- Generic Commodity Name -->
  <rect x="220" y="225" width="360" height="40" rx="8" fill="#550707" stroke="#D4AF37" stroke-width="1.5"/>
  <text x="400" y="252" font-size="20" font-weight="700" fill="#FFF4B8" text-anchor="middle">Generic Name: Mixed Powdered Spice</text>
  
  <!-- Veg Symbol -->
  <rect x="700" y="50" width="40" height="40" fill="#FFF" stroke="#2e7d32" stroke-width="2" rx="4"/>
  <circle cx="720" cy="70" r="12" fill="#2e7d32"/>

  <!-- Center Decorative Banner -->
  <rect x="80" y="290" width="640" height="180" rx="12" fill="#3a0404" stroke="#AA771C" stroke-width="2"/>
  <text x="400" y="360" font-size="32" font-weight="800" fill="#D4AF37" text-anchor="middle">100% PURE &amp; AROMATIC</text>
  <text x="400" y="405" font-size="18" fill="#EEE" text-anchor="middle">Finest handpicked coriander, cumin, cardamom, and clove blend</text>
  <text x="400" y="440" font-size="16" fill="#AAA" text-anchor="middle">FSSAI Lic. No. 10019022009845</text>

  <!-- Statutory Legal Metrology Mandatory Declarations Panel -->
  <rect x="60" y="500" width="680" height="440" rx="14" fill="#FFFFFF" stroke="#333" stroke-width="3"/>
  <rect x="60" y="500" width="680" height="40" rx="14" fill="#1e293b"/>
  <text x="400" y="527" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MANDATORY STATUTORY DECLARATIONS (PC RULES, 2011)</text>

  <!-- Row 1: Net Quantity & MRP -->
  <g transform="translate(80, 560)">
    <text x="0" y="0" font-size="18" font-weight="bold" fill="#0f172a">Net Quantity:</text>
    <text x="140" y="0" font-size="20" font-weight="900" fill="#047857">100 g</text>
    <text x="210" y="0" font-size="14" fill="#64748b">(Unit Sale Price: ₹0.85/g)</text>

    <text x="380" y="0" font-size="18" font-weight="bold" fill="#0f172a">MRP:</text>
    <text x="440" y="0" font-size="20" font-weight="900" fill="#b91c1c">₹85.00</text>
    <text x="510" y="0" font-size="14" font-weight="bold" fill="#0f172a">(incl. of all taxes)</text>
  </g>

  <!-- Divider -->
  <line x1="80" y1="585" x2="720" y2="585" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Row 2: Date of Manufacture & Batch -->
  <g transform="translate(80, 620)">
    <text x="0" y="0" font-size="16" font-weight="bold" fill="#0f172a">Month &amp; Year of Mfg:</text>
    <text x="200" y="0" font-size="16" font-weight="bold" fill="#0284c7">07/2026</text>

    <text x="380" y="0" font-size="16" font-weight="bold" fill="#0f172a">Batch No:</text>
    <text x="470" y="0" font-size="16" font-family="monospace" fill="#334155">SGM-2026-B44</text>
    
    <text x="0" y="30" font-size="14" fill="#475569">Best Before: 12 months from date of packaging</text>
  </g>

  <!-- Divider -->
  <line x1="80" y1="675" x2="720" y2="675" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Row 3: Manufacturer Details -->
  <g transform="translate(80, 710)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Manufactured &amp; Packed by:</text>
    <text x="0" y="24" font-size="14" font-weight="600" fill="#1e293b">Swadish Spices Private Limited</text>
    <text x="0" y="44" font-size="13" fill="#475569">Plot No. 42-B, Industrial Area, Sector 9, Gandhinagar, Gujarat - 382028, India</text>
    <text x="0" y="64" font-size="13" fill="#475569">Country of Origin: India</text>
  </g>

  <!-- Divider -->
  <line x1="80" y1="795" x2="720" y2="795" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Row 4: Consumer Care Details -->
  <g transform="translate(80, 830)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Customer Care Executive / Complaints:</text>
    <text x="0" y="24" font-size="13" fill="#334155">In case of consumer complaints, contact Manager - Consumer Response Cell at:</text>
    <text x="0" y="44" font-size="13" font-weight="600" fill="#0369a1">Address: Swadish Spices Pvt Ltd, Plot 42-B, Sector 9, Gandhinagar - 382028</text>
    <text x="0" y="66" font-size="13" font-weight="bold" fill="#047857">Toll Free Phone: 1800-209-4455 | Email: customercare@swadishspices.in</text>
  </g>
</svg>
    `)
  },
  {
    id: 'sp-2-chips-violation',
    title: 'Crunchy Bites Wavy Potato Chips (Non-Standard Qty & Missing Taxes)',
    category: 'Snacks & Confectionery',
    brand: 'Crunchy Bites Co.',
    thumbnail: '',
    scenarioType: 'missing_mrp_taxes',
    expectedViolationsCount: 2,
    description: 'Contains 2 major statutory violations: Net quantity uses illegal abbreviation "55 gms." (Rule 12), and MRP is listed as "MRP Rs. 20" omitting mandatory "(inclusive of all taxes)" (Rule 6(1)(f)).',
    imageData: generateSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#0f172a; font-family: 'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="chipsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>

  <rect width="800" height="1000" rx="16" fill="url(#chipsBg)" stroke="#fef3c7" stroke-width="4"/>

  <!-- Brand header -->
  <text x="400" y="110" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" stroke="#78350f" stroke-width="2">CRUNCHY BITES</text>
  <text x="400" y="160" font-size="28" font-weight="bold" fill="#fef08a" text-anchor="middle">TANGY TOMATO WAVY CHIPS</text>

  <!-- Commodity Generic Name -->
  <rect x="250" y="190" width="300" height="34" rx="6" fill="#78350f"/>
  <text x="400" y="214" font-size="16" font-weight="600" fill="#fef3c7" text-anchor="middle">Generic Name: Potato Chips</text>

  <!-- Graphical Snack Artwork -->
  <circle cx="400" cy="350" r="100" fill="#fef08a" stroke="#d97706" stroke-width="6"/>
  <text x="400" y="360" font-size="40" font-weight="900" fill="#b45309" text-anchor="middle">EXTRA CRUNCH</text>

  <!-- Back Panel Declarations (with intentional violations) -->
  <rect x="60" y="490" width="680" height="460" rx="12" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>
  <rect x="60" y="490" width="680" height="38" rx="12" fill="#0f172a"/>
  <text x="400" y="515" font-size="16" font-weight="bold" fill="#f8fafc" text-anchor="middle">PRODUCT INFORMATION &amp; PACKAGING DETAILS</text>

  <!-- VIOLATION 1: Net Qty non-standard units 'gms.' -->
  <g transform="translate(90, 560)">
    <text x="0" y="0" font-size="17" font-weight="bold" fill="#0f172a">Net Wt / Quantity:</text>
    <!-- Illegal unit symbol 'gms.' under Legal Metrology Rule 12 & Rule 13 -->
    <text x="180" y="0" font-size="22" font-weight="900" fill="#dc2626">55 gms.</text>
    <text x="290" y="-2" font-size="12" fill="#991b1b">[Non-compliant: Rule 12 specifies 'g' only]</text>
  </g>

  <!-- VIOLATION 2: MRP without 'inclusive of all taxes' -->
  <g transform="translate(90, 620)">
    <text x="0" y="0" font-size="17" font-weight="bold" fill="#0f172a">Maximum Retail Price:</text>
    <!-- Missing 'inclusive of all taxes' under Rule 6(1)(f) -->
    <text x="210" y="0" font-size="22" font-weight="900" fill="#dc2626">MRP Rs. 20.00</text>
    <text x="370" y="-2" font-size="12" fill="#991b1b">[Missing statutory '(incl. of all taxes)']</text>
  </g>

  <line x1="90" y1="650" x2="710" y2="650" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Mfg Date -->
  <g transform="translate(90, 685)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Date of Manufacture:</text>
    <text x="190" y="0" font-size="16" font-weight="600" fill="#1e293b">14/08/2026</text>
    <text x="340" y="0" font-size="15" font-weight="bold" fill="#0f172a">Batch:</text>
    <text x="400" y="0" font-size="15" font-family="monospace" fill="#334155">CB-994</text>
  </g>

  <!-- Manufacturer Details -->
  <g transform="translate(90, 740)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Manufactured &amp; Marketed by:</text>
    <text x="0" y="24" font-size="14" font-weight="600" fill="#1e293b">Crunchy Snack Foods Pvt Ltd</text>
    <text x="0" y="44" font-size="13" fill="#475569">Survey No 108/2, NH-48 Highway, Vapi, Valsad District, Gujarat - 396191</text>
  </g>

  <!-- Consumer Care (Compliant part) -->
  <g transform="translate(90, 835)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Consumer Grievance Redressal:</text>
    <text x="0" y="22" font-size="13" fill="#475569">For queries contact: Executive Customer Cell at above address</text>
    <text x="0" y="42" font-size="13" font-weight="bold" fill="#0284c7">Phone: 0260-2448899 | Email: help@crunchybites.com</text>
  </g>
</svg>
    `)
  },
  {
    id: 'sp-3-juice-missing-care',
    title: 'PureValley Mango Nectar (Missing Consumer Care & Generic Name Ambiguity)',
    category: 'Beverages',
    brand: 'PureValley Beverages',
    thumbnail: '',
    scenarioType: 'missing_consumer_care',
    expectedViolationsCount: 2,
    description: 'Contains high-risk violations: Completely missing consumer care contact telephone/email (Rule 6(1)(g)) and generic commodity name missing on front panel.',
    imageData: generateSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#022c22; font-family: 'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="juiceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="40%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>

  <rect width="800" height="1000" rx="16" fill="url(#juiceGrad)" stroke="#10b981" stroke-width="4"/>

  <!-- Brand -->
  <text x="400" y="90" font-size="46" font-weight="900" fill="#a7f3d0" text-anchor="middle">PUREVALLEY</text>
  <text x="400" y="140" font-size="34" font-weight="800" fill="#fef08a" text-anchor="middle">ALPHONSO MANGO BLISS</text>
  
  <!-- Notice: Generic commodity name like "Ready to Serve Fruit Beverage / Mango Nectar" is omitted from header -->

  <circle cx="400" cy="300" r="110" fill="#f59e0b" stroke="#fef3c7" stroke-width="6"/>
  <text x="400" y="308" font-size="30" font-weight="900" fill="#78350f" text-anchor="middle">100% PULP</text>

  <!-- Legal Metrology Declarations Panel -->
  <rect x="70" y="460" width="660" height="490" rx="12" fill="#FFFFFF" stroke="#333" stroke-width="2"/>
  <rect x="70" y="460" width="660" height="36" rx="12" fill="#134e4a"/>
  <text x="400" y="484" font-size="16" font-weight="bold" fill="#ccfbf1" text-anchor="middle">STATUTORY PACKAGING INFORMATION</text>

  <!-- Net Quantity -->
  <g transform="translate(100, 530)">
    <text x="0" y="0" font-size="16" font-weight="bold" fill="#0f172a">Net Quantity:</text>
    <text x="130" y="0" font-size="18" font-weight="bold" fill="#065f46">1 L (1000 ml)</text>
  </g>

  <!-- MRP -->
  <g transform="translate(100, 580)">
    <text x="0" y="0" font-size="16" font-weight="bold" fill="#0f172a">MRP (incl. of all taxes):</text>
    <text x="210" y="0" font-size="20" font-weight="900" fill="#0f172a">₹120.00</text>
    <text x="320" y="0" font-size="14" fill="#64748b">(Unit Sale Price: ₹0.12/ml)</text>
  </g>

  <!-- Mfg Date -->
  <g transform="translate(100, 630)">
    <text x="0" y="0" font-size="16" font-weight="bold" fill="#0f172a">Month &amp; Year of Pkg:</text>
    <text x="200" y="0" font-size="16" font-weight="bold" fill="#0284c7">JUNE 2026</text>
  </g>

  <!-- Manufacturer Details -->
  <g transform="translate(100, 690)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#0f172a">Manufactured &amp; Bottled By:</text>
    <text x="0" y="24" font-size="14" font-weight="600" fill="#1e293b">PureValley Agro Beverages LLP</text>
    <text x="0" y="44" font-size="13" fill="#475569">Gat No. 340, Pune-Nashik Highway, Sangamner, Ahmednagar, MH - 422605</text>
  </g>

  <line x1="100" y1="770" x2="670" y2="770" stroke="#f87171" stroke-width="2" stroke-dasharray="4"/>

  <!-- VIOLATION: Missing Consumer Care Phone / Email -->
  <g transform="translate(100, 810)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#dc2626">Customer Support / Feedback:</text>
    <text x="0" y="25" font-size="14" fill="#991b1b">"Write to us at our registered office address above."</text>
    <text x="0" y="50" font-size="12" font-weight="bold" fill="#b91c1c">[VIOLATION: Rule 6(1)(g) mandates specific Telephone number &amp; Email ID]</text>
  </g>
</svg>
    `)
  },
  {
    id: 'sp-4-imported-chocolate',
    title: 'ChocoDelice Hazelnut Spread (Imported - Missing Importer Full Address & Date of Import)',
    category: 'Imported Goods',
    brand: 'ChocoDelice Europe',
    thumbnail: '',
    scenarioType: 'imported_goods_violation',
    expectedViolationsCount: 2,
    description: 'Imported product label missing Indian importer complete address and month/year of import as mandated under Rule 6(1)(b) and Rule 6(1)(d).',
    imageData: generateSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#2b1408; font-family: 'Segoe UI', Arial, sans-serif;">
  <rect width="800" height="1000" rx="16" fill="#3d1e0d" stroke="#854d0e" stroke-width="4"/>

  <!-- Brand -->
  <text x="400" y="100" font-size="48" font-weight="900" fill="#fde047" text-anchor="middle">CHOCO DÉLICE</text>
  <text x="400" y="150" font-size="28" font-weight="700" fill="#fed7aa" text-anchor="middle">HAZELNUT COCOA SPREAD</text>
  
  <rect x="250" y="180" width="300" height="34" rx="6" fill="#1c0d05"/>
  <text x="400" y="203" font-size="15" font-weight="600" fill="#fde047" text-anchor="middle">Generic Name: Hazelnut Spread</text>

  <!-- Graphic -->
  <rect x="150" y="250" width="500" height="160" rx="16" fill="#2b1408" stroke="#a16207" stroke-width="2"/>
  <text x="400" y="320" font-size="28" font-weight="bold" fill="#fef08a" text-anchor="middle">IMPORTED FROM BELGIUM</text>
  <text x="400" y="360" font-size="16" fill="#fed7aa" text-anchor="middle">Rich Roasted Hazelnuts &amp; Pure Cocoa</text>

  <!-- Overprinted Indian Importer Sticker (Simulated) -->
  <rect x="60" y="470" width="680" height="480" rx="10" fill="#fffbeb" stroke="#b45309" stroke-width="3"/>
  <rect x="60" y="470" width="680" height="36" rx="10" fill="#78350f"/>
  <text x="400" y="495" font-size="16" font-weight="bold" fill="#fef3c7" text-anchor="middle">IMPORT DECLARATION STICKER (LEGAL METROLOGY)</text>

  <!-- Net Qty & MRP -->
  <g transform="translate(90, 545)">
    <text x="0" y="0" font-size="16" font-weight="bold" fill="#0f172a">Net Weight:</text>
    <text x="120" y="0" font-size="18" font-weight="900" fill="#047857">350 g</text>

    <text x="320" y="0" font-size="16" font-weight="bold" fill="#0f172a">MRP (incl. of all taxes):</text>
    <text x="510" y="0" font-size="18" font-weight="900" fill="#b91c1c">₹499.00</text>
  </g>

  <!-- Foreign Mfg -->
  <g transform="translate(90, 605)">
    <text x="0" y="0" font-size="14" font-weight="bold" fill="#0f172a">Manufactured in Belgium by:</text>
    <text x="0" y="20" font-size="13" fill="#334155">ChocoDelice S.A., Rue de Chocolat 88, 1000 Brussels, Belgium</text>
    <text x="0" y="40" font-size="13" font-weight="600" fill="#0284c7">Country of Origin: Belgium</text>
  </g>

  <!-- VIOLATION 1: Incomplete Importer Name/Address -->
  <g transform="translate(90, 690)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#dc2626">Imported &amp; Marketed by:</text>
    <!-- Incomplete address without PIN code, city details under Rule 6(1)(b) -->
    <text x="0" y="24" font-size="14" font-weight="600" fill="#b91c1c">Global Treats India, Mumbai</text>
    <text x="0" y="44" font-size="12" fill="#991b1b">[VIOLATION: Incomplete address lacking street, plot, and 6-digit PIN code]</text>
  </g>

  <!-- VIOLATION 2: Date of Import Missing (Only best before given) -->
  <g transform="translate(90, 780)">
    <text x="0" y="0" font-size="15" font-weight="bold" fill="#dc2626">Date of Import:</text>
    <text x="140" y="0" font-size="14" fill="#991b1b">NOT PRINTED (Only shows "Best Before: 18 Months")</text>
    <text x="0" y="26" font-size="12" fill="#991b1b">[VIOLATION: Rule 6(1)(d) strictly mandates month &amp; year of import on imported packages]</text>
  </g>

  <!-- Consumer care -->
  <g transform="translate(90, 855)">
    <text x="0" y="0" font-size="14" font-weight="bold" fill="#0f172a">Consumer Care Contact:</text>
    <text x="0" y="22" font-size="13" fill="#334155">Customer Support: +91 22 6600 8800 | care@globaltreats.in</text>
  </g>
</svg>
    `)
  },
  {
    id: 'sp-5-hair-oil-font-disparity',
    title: 'KeshKanti Herbal Hair Oil (Microscopic Statutory Font Disparity)',
    category: 'Personal Care & Cosmetics',
    brand: 'KeshKanti Naturals',
    thumbnail: '',
    scenarioType: 'micro_font_disparity',
    expectedViolationsCount: 1,
    description: 'Front brand is massive (50pt) while statutory MRP and net quantity font size is disproportionately microscopic (<1mm relative size) requiring inspector review under Rule 9.',
    imageData: generateSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#0f172a; font-family: 'Segoe UI', Arial, sans-serif;">
  <defs>
    <linearGradient id="oilBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="60%" stop-color="#166534"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
  </defs>

  <rect width="800" height="1000" rx="20" fill="url(#oilBg)" stroke="#4ade80" stroke-width="4"/>

  <!-- Huge Brand Typography -->
  <text x="400" y="140" font-size="62" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="3">KESHKANTI</text>
  <text x="400" y="200" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle">100% AYURVEDIC HAIR OIL</text>
  <text x="400" y="240" font-size="18" fill="#86efac" text-anchor="middle">With Bhringraj, Brahmi, Amla &amp; Coconut</text>

  <!-- Large Artwork Banner -->
  <rect x="100" y="270" width="600" height="280" rx="16" fill="#052e16" stroke="#22c55e" stroke-width="2"/>
  <text x="400" y="370" font-size="36" font-weight="900" fill="#facc15" text-anchor="middle">GROWTH &amp; STRENGTH</text>
  <text x="400" y="420" font-size="20" fill="#bbf7d0" text-anchor="middle">Clinically tested 2X hair fall reduction formula</text>

  <!-- Microscopic statutory panel at bottom right (Disproportionate font size) -->
  <rect x="80" y="600" width="640" height="340" rx="10" fill="#f8fafc" stroke="#333" stroke-width="2"/>
  <text x="400" y="630" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">MANDATORY DECLARATIONS PANEL</text>

  <g transform="translate(100, 670)">
    <!-- Generic Name -->
    <text x="0" y="0" font-size="12" font-weight="bold" fill="#0f172a">Generic Commodity Name:</text>
    <text x="180" y="0" font-size="12" fill="#334155">Ayurvedic Hair Oil</text>
    
    <!-- Net Qty in tiny text -->
    <text x="0" y="30" font-size="10" fill="#64748b">Net Vol: 200 ml (Unit Sale Price: ₹1.45/ml)</text>

    <!-- MRP in tiny text -->
    <text x="0" y="55" font-size="10" fill="#64748b">MRP Rs 290.00 (incl. of all taxes) | Mfd: 05/2026 | Batch: KK-26-09</text>
    
    <text x="0" y="80" font-size="9" fill="#94a3b8">Mfd by: KeshKanti Herbals Pvt Ltd, Kinfra Park, Koratty, Thrissur, Kerala - 680308</text>
    <text x="0" y="105" font-size="9" fill="#94a3b8">Customer Care: 0487-2889900, support@keshkanti.com, Address: Same as Mfg</text>

    <rect x="-10" y="130" width="600" height="40" fill="#fef2f2" stroke="#f87171" rx="6"/>
    <text x="290" y="155" font-size="11" font-weight="bold" fill="#b91c1c" text-anchor="middle">
      [REVIEW NOTE: Rule 9 requires statutory font height proportional to package area (min 2mm to 4mm)]
    </text>
  </g>
</svg>
    `)
  }
];

export const LEGAL_METROLOGY_RULES_HANDBOOK: LegalMetrologyRuleInfo[] = [
  {
    ruleId: 'rule-6-1-a-b',
    title: 'Manufacturer / Packer / Importer Name & Complete Address',
    section: 'PC Rules 2011, Rule 6(1)(a) & 6(1)(b)',
    description: 'Every package shall bear the name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and packer, and in case of imported packages, the name and complete address of the importer with Country of Origin.',
    mandatoryRequirements: [
      'Must contain complete physical address (premises/plot, street, town/city, state, PIN code).',
      'Clear indication of relationship: "Manufactured by", "Packed by", "Marketed by", or "Imported & Marketed by".',
      'For imported commodities, Country of Origin is mandatory.'
    ],
    commonViolations: [
      'Listing only brand name without manufacturer corporate entity.',
      'Incomplete address (e.g. omitting PIN code or mentioning only city name).',
      'Imported goods missing Indian importer legal entity name and complete address.'
    ],
    penaltyDetails: 'Section 36(1) of Legal Metrology Act, 2009: Fine up to ₹25,000 for first offence, ₹50,000 for second offence, and up to ₹1,00,000 or imprisonment for subsequent offences.'
  },
  {
    ruleId: 'rule-6-1-c',
    title: 'Common or Generic Name of the Commodity',
    section: 'PC Rules 2011, Rule 6(1)(c)',
    description: 'The common or generic names of the commodity contained in the package and in case of packages with more than one product, the name and number or quantity of each product shall be mentioned.',
    mandatoryRequirements: [
      'Generic descriptor must clearly describe what the product actually is (e.g., "Potato Chips", "Instant Noodles", "Edible Vegetable Oil", "Toothpaste").',
      'Cannot be substituted purely with fancy trademark or invented marketing slogan.'
    ],
    commonViolations: [
      'Omitting the generic name entirely from the principal display panel.',
      'Only printing brand name in huge font without clarifying commodity type.'
    ],
    penaltyDetails: 'Compounding under Section 48 or prosecution under Section 36.'
  },
  {
    ruleId: 'rule-6-1-e',
    title: 'Net Quantity in Standard SI Units',
    section: 'PC Rules 2011, Rule 6(1)(e) read with Rules 11, 12, 13 & Schedule II',
    description: 'The net quantity, in terms of the standard unit of weight or measure, of the commodity contained in the package shall be declared.',
    mandatoryRequirements: [
      'Must use statutory SI symbols: "g" (gram), "kg" (kilogram), "ml" or "mL" (millilitre), "l" or "L" (litre), "m" (metre), "cm" (centimetre), "N" or "U" (number).',
      'Unit Sale Price (USP) must be declared on packages exceeding 1 kg / 1 L or multi-packs as per recent LMPC amendments.',
      'Font height of numeral must comply with the minimum size prescribed in Table under Rule 7 based on principal display panel area.'
    ],
    commonViolations: [
      'Using illegal symbols like "gms", "gm", "grm", "kilos", "ltr", "ml.", "pkts".',
      'Stating non-standard expressions like "when packed 100g" or approximate weights.',
      'Missing Unit Sale Price on qualifying retail packs.'
    ],
    penaltyDetails: 'Seizure of non-standard packages under Section 15 and penalty under Section 36.'
  },
  {
    ruleId: 'rule-6-1-d',
    title: 'Month & Year of Manufacture / Packing / Import',
    section: 'PC Rules 2011, Rule 6(1)(d)',
    description: 'The month and year in which the commodity is manufactured or pre-packed or imported shall be declared on the package.',
    mandatoryRequirements: [
      'Clear representation of Month and Year (e.g. "08/2026", "AUG 2026", "MFD: 08/26").',
      'For imported goods, the month and year of import must be declared on the sticker or packaging.'
    ],
    commonViolations: [
      'Declaring only "Best Before 12 months" without declaring the initial Month and Year of Manufacture/Packing.',
      'Illegible inkjet stamping or missing month/year on imported goods.'
    ],
    penaltyDetails: 'Statutory violation triggering notice from District Legal Metrology Inspector.'
  },
  {
    ruleId: 'rule-6-1-f',
    title: 'Maximum Retail Price (MRP) Inclusive of All Taxes',
    section: 'PC Rules 2011, Rule 6(1)(f)',
    description: 'The retail sale price of the package shall be declared clearly stating Maximum Retail Price (MRP) Rs. / ₹ ... inclusive of all taxes.',
    mandatoryRequirements: [
      'Format: "MRP ₹ ... (incl. of all taxes)" or "Maximum Retail Price ₹ ... inclusive of all taxes".',
      'Cannot charge above the declared MRP under any circumstances.',
      'Rounding off rules apply to nearest 50 paise / 1 rupee.'
    ],
    commonViolations: [
      'Stating "MRP Rs. 100" without adding "(inclusive of all taxes)".',
      'Dual pricing stickers or altered/scratched MRP markings.',
      'Writing "local taxes extra" which is strictly prohibited.'
    ],
    penaltyDetails: 'Penalty up to ₹50,000 for overcharging or improper tax declaration; repeated offences attract heavier court fines.'
  },
  {
    ruleId: 'rule-6-1-g',
    title: 'Consumer Care / Grievance Contact Details',
    section: 'PC Rules 2011, Rule 6(1)(g)',
    description: 'Every package shall bear the name, address, telephone number, and e-mail address of the person or office which may be contacted in case of the consumer complaints.',
    mandatoryRequirements: [
      'Designation or name of the official/office (e.g. "Consumer Care Manager" or "Customer Grievance Cell").',
      'Complete postal address.',
      'Working Telephone / Toll-free Number.',
      'Valid Email Address.'
    ],
    commonViolations: [
      'Omitting the telephone number or omitting email ID.',
      'Vague statement like "Write to manufacturer" without explicit contact channel details.'
    ],
    penaltyDetails: 'Penalty under Section 36 of Legal Metrology Act.'
  }
];
