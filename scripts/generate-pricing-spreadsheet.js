const XLSX = require('/usr/lib/node_modules/openclaw/node_modules/exceljs');
// Check if exceljs is available, if not we'll use csv
let hasExcel = false;
try { require.resolve('/usr/lib/node_modules/openclaw/node_modules/exceljs'); hasExcel = true; } catch(e) {}

console.log('ExcelJS available:', hasExcel);
