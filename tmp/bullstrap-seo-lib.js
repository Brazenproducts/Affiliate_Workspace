const https = require('https');
const fs = require('fs');

const SHOP = 'bull-strap-78.myshopify.com';
const TOKEN = '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';
const API_VER = '2024-01';
const LOG_FILE = '/home/ubuntu/.openclaw/workspace/tmp/bullstrap-seo-log.json';
const BATCH_SIZE = 250;
const DELAY_MS = 550; // ~2 req/sec with margin

// Initialize log
let changeLog = [];
if (fs.existsSync(LOG_FILE)) {
  try { changeLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch(e) {}
}

function saveLog() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(changeLog, null, 2));
}

function shopifyRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SHOP,
      path: `/admin/api/${API_VER}${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 429) {
          resolve({ rateLimited: true, retryAfter: res.headers['retry-after'] || 2 });
          return;
        }
        try { resolve(JSON.parse(d)); } catch(e) { resolve({ raw: d, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extract fitment info from tags
function extractFitment(tags) {
  if (!tags) return [];
  const fitments = [];
  const fitTags = tags.split(', ').filter(t => t.startsWith('fits_'));
  
  for (const tag of fitTags) {
    // Format: fits_YEAR-YEAR`MAKE`MODEL`TRIM~YEAR-YEAR`MAKE`MODEL`TRIM
    const entries = tag.replace('fits_', '').split('~');
    for (const entry of entries) {
      const parts = entry.split('`');
      if (parts.length >= 3) {
        fitments.push({
          years: parts[0],
          make: parts[1],
          model: parts[2],
          trim: parts[3] || ''
        });
      }
    }
  }
  return fitments;
}

// Get unique makes/models from fitment
function summarizeFitment(fitments) {
  if (fitments.length === 0) return null;
  
  // Group by make+model, collect year ranges
  const vehicles = {};
  for (const f of fitments) {
    const key = `${f.make} ${f.model}`;
    if (!vehicles[key]) vehicles[key] = { make: f.make, model: f.model, years: [] };
    vehicles[key].years.push(f.years);
  }
  
  const entries = Object.values(vehicles);
  if (entries.length === 0) return null;
  
  // If only one vehicle, use full detail
  if (entries.length === 1) {
    const v = entries[0];
    const yearRange = getYearRange(v.years);
    return { text: `for ${yearRange} ${v.make} ${v.model}`, count: 1 };
  }
  
  // If 2-3 vehicles, list them
  if (entries.length <= 3) {
    const parts = entries.map(v => {
      const yr = getYearRange(v.years);
      return `${yr} ${v.make} ${v.model}`;
    });
    return { text: `for ${parts.join(', ')}`, count: entries.length };
  }
  
  // If many vehicles, use the first + count
  const first = entries[0];
  const yr = getYearRange(first.years);
  return { text: `for ${yr} ${first.make} ${first.model} & More`, count: entries.length };
}

function getYearRange(years) {
  let min = 9999, max = 0;
  for (const yr of years) {
    const parts = yr.split('-');
    const start = parseInt(parts[0]);
    const end = parts.length > 1 ? parseInt(parts[1]) : start;
    if (start < min) min = start;
    if (end > max) max = end;
  }
  if (min === max) return `${min}`;
  return `${min}-${max}`;
}

function normalizeWhitespace(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function stripVendorPrefix(title, vendor) {
  if (!title || !vendor) return title || '';
  const escapedVendor = vendor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return title.replace(new RegExp(`^${escapedVendor}[\s:-]+`, 'i'), '').trim();
}

function cleanProductTitle(title, vendor) {
  let clean = normalizeWhitespace(title);
  clean = stripVendorPrefix(clean, vendor);
  clean = clean.replace(/\s*\/\s*/g, '/');
  clean = clean.replace(/\s+,/g, ',');
  clean = clean.replace(/,([A-Za-z0-9])/g, ', $1');
  clean = clean.replace(/\s+-\s+/g, ' - ');
  clean = clean.replace(/\s{2,}/g, ' ');
  return clean.trim();
}

function truncateAtWord(text, maxLen) {
  const value = normalizeWhitespace(text);
  if (value.length <= maxLen) return value;
  const sliced = value.slice(0, maxLen + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > Math.max(20, maxLen - 20)) {
    return sliced.slice(0, lastSpace).trim();
  }
  return value.slice(0, maxLen).trim();
}

// Category-specific SEO keyword maps
const CATEGORY_KEYWORDS = {
  'Cold Air Intakes': { kw: 'cold air intake system', desc: 'Boost horsepower and throttle response' },
  'Floor Mats - Rubber': { kw: 'all-weather floor mats', desc: 'Custom-fit all-weather protection' },
  'Headlights': { kw: 'headlight assembly', desc: 'Upgrade your visibility and style' },
  'Lowering Springs': { kw: 'lowering springs kit', desc: 'Lower your ride for improved handling' },
  'Air Suspension Kits': { kw: 'air suspension kit', desc: 'Adjustable air ride suspension' },
  'Catback': { kw: 'cat-back exhaust system', desc: 'Performance exhaust for better flow and sound' },
  'Tail Lights': { kw: 'tail light assembly', desc: 'Upgrade your rear lighting' },
  'Gauges': { kw: 'performance gauge', desc: 'Monitor your vehicle vitals in real-time' },
  'Wind Deflectors': { kw: 'window deflectors', desc: 'Keep rain out while letting fresh air in' },
  'Clutch Kits - Single': { kw: 'performance clutch kit', desc: 'High-performance clutch for increased holding capacity' },
  'Bearings': { kw: 'engine bearings', desc: 'Precision-engineered for reliable performance' },
  'Air Filters - Universal Fit': { kw: 'universal air filter', desc: 'High-flow air filtration' },
  'Air Filters - Drop In': { kw: 'drop-in replacement air filter', desc: 'Direct replacement high-flow air filter' },
  'Air Filters - Direct Fit': { kw: 'direct-fit air filter', desc: 'OE-fit high-performance air filter' },
  'Gauge Pods': { kw: 'gauge pod mount', desc: 'Clean gauge mounting solution' },
  'Air Intake Components': { kw: 'air intake component', desc: 'Optimize your intake system' },
  'Fuel Pumps': { kw: 'fuel pump', desc: 'Reliable fuel delivery' },
  'Flywheels': { kw: 'performance flywheel', desc: 'Lightweight flywheel for faster revs' },
  'Throttle Body Spacers': { kw: 'throttle body spacer', desc: 'Increase airflow and torque' },
  'Running Boards': { kw: 'running boards', desc: 'Easy step-up access with rugged style' },
  'Intercoolers': { kw: 'intercooler', desc: 'Keep intake temps low for maximum power' },
  'Crankshaft Dampers': { kw: 'harmonic balancer', desc: 'Protect your crankshaft from harmful vibrations' },
  'Clutch Discs': { kw: 'clutch disc', desc: 'High-performance clutch disc' },
  'Fuel Filters': { kw: 'fuel filter', desc: 'Clean fuel delivery for peak performance' },
  'Diff Covers': { kw: 'differential cover', desc: 'Heavy-duty differential protection' },
  'Bumpers - Steel': { kw: 'steel bumper', desc: 'Heavy-duty off-road bumper protection' },
  'Coilovers': { kw: 'coilover suspension kit', desc: 'Adjustable coilover suspension' },
  'Shocks and Struts': { kw: 'shock absorber', desc: 'Smooth ride quality and control' },
  'Exhaust Cutouts': { kw: 'exhaust cutout', desc: 'Switch between quiet and loud exhaust' },
  'Bed Covers - Folding': { kw: 'folding tonneau cover', desc: 'Protect your truck bed cargo' },
  'Bed Covers - Roll Up': { kw: 'roll-up tonneau cover', desc: 'Easy access truck bed cover' },
  'Bull Bars': { kw: 'bull bar', desc: 'Front-end protection with style' },
  'Driving Lights': { kw: 'LED driving lights', desc: 'Powerful off-road illumination' },
  'Fog Lights': { kw: 'fog light kit', desc: 'Improved visibility in poor conditions' },
  'Roof Rack': { kw: 'roof rack system', desc: 'Expand your cargo capacity' },
  'Skid Plates': { kw: 'skid plate', desc: 'Underbody armor protection' },
  'Sway Bars': { kw: 'sway bar kit', desc: 'Reduce body roll for better handling' },
  'Headers & Manifolds': { kw: 'exhaust headers', desc: 'Free-flowing exhaust headers for more power' },
  'Downpipes': { kw: 'downpipe', desc: 'Reduce backpressure for turbo performance' },
  'Turbochargers': { kw: 'turbocharger', desc: 'Forced induction power upgrade' },
  'Radiators': { kw: 'performance radiator', desc: 'Enhanced cooling capacity' },
  'Brake Pads - Performance': { kw: 'performance brake pads', desc: 'Superior stopping power' },
  'Big Brake Kits': { kw: 'big brake kit', desc: 'Upgraded braking performance' },
  'Wheel Spacers & Adapters': { kw: 'wheel spacers', desc: 'Wider stance and better fitment' },
  'Batteries': { kw: 'lithium battery', desc: 'Lightweight, high-performance battery' },
  'Fridges': { kw: 'portable fridge', desc: 'Keep food and drinks cold on the trail' },
  'Awnings & Panels': { kw: 'vehicle awning', desc: 'Instant shade for outdoor adventures' },
  'Leaf Springs & Accessories': { kw: 'leaf spring kit', desc: 'Restore or upgrade your suspension' },
  'Air Springs': { kw: 'air spring kit', desc: 'Load-leveling air spring support' },
  'Spare Tire Carriers': { kw: 'spare tire carrier', desc: 'Secure spare tire mounting' },
};

// Generate SEO title (max ~70 chars for Google display)
function generateSeoTitle(product, fitment) {
  const vendor = normalizeWhitespace(product.vendor || '');
  const cleanTitle = cleanProductTitle(product.title || '', vendor);
  const fitSummary = fitment ? summarizeFitment(fitment) : null;
  const suffix = ' | Bull Strap';
  const maxTitleLen = 75;
  const available = maxTitleLen - suffix.length;

  let baseTitle = vendor && !cleanTitle.toLowerCase().startsWith(vendor.toLowerCase())
    ? `${vendor} ${cleanTitle}`
    : cleanTitle;
  baseTitle = normalizeWhitespace(baseTitle);

  if (fitSummary) {
    const candidate = `${baseTitle} ${fitSummary.text}`;
    if ((candidate + suffix).length <= maxTitleLen) {
      baseTitle = candidate;
    }
  }

  return `${truncateAtWord(baseTitle, available)}${suffix}`;
}

// Generate SEO description (max ~160 chars for Google snippet)
function generateSeoDescription(product, fitment) {
  const vendor = normalizeWhitespace(product.vendor || '');
  const cleanTitle = cleanProductTitle(product.title || '', vendor);
  const type = product.product_type || '';
  const catInfo = CATEGORY_KEYWORDS[type];
  const fitSummary = fitment ? summarizeFitment(fitment) : null;

  const productPhrase = (!cleanTitle || cleanTitle.toLowerCase().startsWith(vendor.toLowerCase()))
    ? cleanTitle
    : `${vendor} ${cleanTitle}`;
  const fitSentence = fitSummary ? ` Designed for ${fitSummary.text.replace(/^for\s+/i, '')}.` : '';

  let desc;
  if (catInfo) {
    desc = `${catInfo.desc} with the ${productPhrase}. Shop ${catInfo.kw} at Bull Strap.${fitSentence} Fast shipping available.`;
  } else {
    desc = `Shop the ${productPhrase} at Bull Strap.${fitSentence} Premium quality and fast shipping available.`;
  }

  return truncateAtWord(desc, 160);
}

module.exports = {
  SHOP, TOKEN, API_VER, LOG_FILE, BATCH_SIZE, DELAY_MS,
  shopifyRequest, sleep, extractFitment, summarizeFitment,
  generateSeoTitle, generateSeoDescription, saveLog, changeLog,
  CATEGORY_KEYWORDS, cleanProductTitle, truncateAtWord
};
