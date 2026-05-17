#!/usr/bin/env node
// seed-restaurants-expanded.js — Expanded seed: ~1800+ US cities, cuisine_type, reporting

const https = require('https');

const SUPABASE_URL = 'https://zqmepfdghljknyojfsmq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbWVwZmRnaGxqa255b2pmc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNjgyNCwiZXhwIjoyMDk0MTEyODI0fQ.jtzXSN0ze19VLmVzzx6Vb7-heEW15jPMHVxZ7RisiCc';

// SAFE chains only (confirmed no tip screen)
const CHAINS = [
  { name: "McDonald's",      slug_prefix: 'mcdonalds',       has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Burger King",     slug_prefix: 'burger-king',     has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Taco Bell",       slug_prefix: 'taco-bell',       has_drive_thru: true,  cuisine_type: 'Mexican'  },
  { name: "Wendy's",         slug_prefix: 'wendys',          has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Jack in the Box", slug_prefix: 'jack-in-the-box', has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Del Taco",        slug_prefix: 'del-taco',        has_drive_thru: true,  cuisine_type: 'Mexican'  },
  { name: "Carl's Jr",       slug_prefix: 'carls-jr',        has_drive_thru: true,  cuisine_type: 'American' },
  { name: "In-N-Out Burger", slug_prefix: 'in-n-out-burger', has_drive_thru: true,  cuisine_type: 'Burgers'  },
  { name: "Raising Cane's",  slug_prefix: 'raising-canes',   has_drive_thru: true,  cuisine_type: 'Chicken'  },
  { name: "Wienerschnitzel", slug_prefix: 'wienerschnitzel', has_drive_thru: true,  cuisine_type: 'Hot Dogs' },
  { name: "Chick-fil-A",     slug_prefix: 'chick-fil-a',     has_drive_thru: true,  cuisine_type: 'Chicken'  },
  { name: "Culver's",        slug_prefix: 'culvers',         has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Arby's",          slug_prefix: 'arbys',           has_drive_thru: true,  cuisine_type: 'Sandwiches'},
  { name: "Dairy Queen",     slug_prefix: 'dairy-queen',     has_drive_thru: true,  cuisine_type: 'Dessert'  },
  { name: "Whataburger",     slug_prefix: 'whataburger',     has_drive_thru: true,  cuisine_type: 'American' },
  { name: "Popeyes",         slug_prefix: 'popeyes',         has_drive_thru: true,  cuisine_type: 'Chicken'  },
];

