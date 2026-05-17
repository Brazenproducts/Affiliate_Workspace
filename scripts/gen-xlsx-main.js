const ExcelJS = require('exceljs');
const { COGS, SHIP } = require('./gen-xlsx-part1');
const { FB, FK } = require('./gen-xlsx-part2');

function getCaseQty(d) {
  if (d <= 2) return 12;
  if (d === 4) return 6;
  if (d === 5) return 5;
  return 12;
}

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Factor Filter';
  wb.created = new Date();

  const ws = wb.addWorksheet('Pricing Analysis', {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }]
  });

  // Row 1: Title
  ws.mergeCells('A1:T1');
  ws.getCell('A1').value = 'Factor Filter — Complete Pricing Analysis (Updated 5/4/2026)';
  ws.getCell('A1').font = { bold: true, size: 14 };

  // Row 2: Target margin cell (editable!)
  ws.getCell('A2').value = 'Target Margin %:';
  ws.getCell('A2').font = { bold: true };
  ws.getCell('B2').value = 0.15;
  ws.getCell('B2').numFmt = '0%';
  ws.getCell('B2').font = { bold: true, color: { argb: 'FF0000FF' } };
  ws.getCell('C2').value = '<-- Change this to recalculate all prices';
  ws.getCell('C2').font = { italic: true, color: { argb: 'FF666666' } };

  // Row 3: Headers
  const headers = [
    'Size', 'MERV', 'Case Qty',
    'COGS/filter', 'Ship/case', 'Ship/filter', 'Total Cost/filter', 'Total Cost/case',
    'Our Price/case', 'Our Price/filter', 'Profit/case', 'Profit/filter', 'Margin %',
    'FB 1-pk', 'FB 4-pk', 'FB 6-pk', 'FB 12+',
    'FK 4-pk', 'FK 6-pk', 'FK 12+',
    'Min Price/filter (formula)'
  ];

  const headerRow = ws.getRow(3);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = { bottom: { style: 'thin' } };
  });

  // Set column widths
  ws.columns = [
    { width: 12 }, { width: 7 }, { width: 8 },
    { width: 12 }, { width: 11 }, { width: 11 }, { width: 14 }, { width: 14 },
    { width: 13 }, { width: 13 }, { width: 11 }, { width: 11 }, { width: 10 },
    { width: 9 }, { width: 9 }, { width: 9 }, { width: 9 },
    { width: 9 }, { width: 9 }, { width: 9 },
    { width: 18 },
  ];

  // Data rows
  const sizes = Object.keys(COGS).sort((a, b) => {
    const da = parseInt(a.split('x')[2]);
    const db = parseInt(b.split('x')[2]);
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });

  let row = 4;
  for (const size of sizes) {
    const d = parseInt(size.split('x')[2]);
    const caseQty = getCaseQty(d);
    const shipCase = SHIP[size] || 0;

    for (const merv of [8, 10, 13]) {
      const cogs = COGS[size]?.[merv];
      if (cogs === undefined) continue;

      const r = row;
      const marginCell = '$B$2'; // reference to the editable margin cell

      // A: Size
      ws.getCell(r, 1).value = size;
      // B: MERV
      ws.getCell(r, 2).value = merv;
      // C: Case Qty
      ws.getCell(r, 3).value = caseQty;
      // D: COGS/filter
      ws.getCell(r, 4).value = cogs;
      ws.getCell(r, 4).numFmt = '$#,##0.00';
      // E: Ship/case
      ws.getCell(r, 5).value = shipCase;
      ws.getCell(r, 5).numFmt = '$#,##0.00';
      // F: Ship/filter = E/C
      ws.getCell(r, 6).value = { formula: `E${r}/C${r}` };
      ws.getCell(r, 6).numFmt = '$#,##0.00';
      // G: Total Cost/filter = D + F
      ws.getCell(r, 7).value = { formula: `D${r}+F${r}` };
      ws.getCell(r, 7).numFmt = '$#,##0.00';
      // H: Total Cost/case = G * C
      ws.getCell(r, 8).value = { formula: `G${r}*C${r}` };
      ws.getCell(r, 8).numFmt = '$#,##0.00';
      // I: Our Price/case = Total Cost/case / (1 - margin)
      ws.getCell(r, 9).value = { formula: `H${r}/(1-${marginCell})` };
      ws.getCell(r, 9).numFmt = '$#,##0.00';
      // J: Our Price/filter = I / C
      ws.getCell(r, 10).value = { formula: `I${r}/C${r}` };
      ws.getCell(r, 10).numFmt = '$#,##0.00';
      // K: Profit/case = I - H
      ws.getCell(r, 11).value = { formula: `I${r}-H${r}` };
      ws.getCell(r, 11).numFmt = '$#,##0.00';
      // L: Profit/filter = K / C
      ws.getCell(r, 12).value = { formula: `K${r}/C${r}` };
      ws.getCell(r, 12).numFmt = '$#,##0.00';
      // M: Margin % = K / I
      ws.getCell(r, 13).value = { formula: `K${r}/I${r}` };
      ws.getCell(r, 13).numFmt = '0.0%';

      // N-Q: FilterBuy prices
      const fb = FB[size]?.[merv] || FB[size]?.[merv === 10 ? 11 : null] || {};
      ws.getCell(r, 14).value = fb.p1 || null;
      ws.getCell(r, 14).numFmt = '$#,##0.00';
      ws.getCell(r, 15).value = fb.p4 || null;
      ws.getCell(r, 15).numFmt = '$#,##0.00';
      ws.getCell(r, 16).value = fb.p6 || null;
      ws.getCell(r, 16).numFmt = '$#,##0.00';
      ws.getCell(r, 17).value = fb.p12 || null;
      ws.getCell(r, 17).numFmt = '$#,##0.00';

      // R-T: Filter King prices
      const fk = FK[size]?.[merv] || FK[size]?.[merv === 10 ? 11 : null] || {};
      ws.getCell(r, 18).value = fk.p4 || null;
      ws.getCell(r, 18).numFmt = '$#,##0.00';
      ws.getCell(r, 19).value = fk.p6 || null;
      ws.getCell(r, 19).numFmt = '$#,##0.00';
      ws.getCell(r, 20).value = fk.p12 || null;
      ws.getCell(r, 20).numFmt = '$#,##0.00';

      // U: Min Price/filter at target margin (formula)
      ws.getCell(r, 21).value = { formula: `G${r}/(1-${marginCell})` };
      ws.getCell(r, 21).numFmt = '$#,##0.00';

      // Conditional coloring for margin
      const totalCost = cogs + shipCase / caseQty;
      const ourPrice = totalCost / (1 - 0.15);

      // Alternate row shading by depth
      if (row % 2 === 0) {
        for (let c = 1; c <= 21; c++) {
          ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        }
      }

      row++;
    }
  }

  // Save
  const outPath = '/home/ubuntu/.openclaw/workspace/reference/Factor-Filter-Pricing-Analysis.xlsx';
  await wb.xlsx.writeFile(outPath);
  console.log('Saved to: ' + outPath);
  console.log('Total data rows: ' + (row - 4));
  console.log('');
  console.log('Features:');
  console.log('- Cell B2 = Target Margin % (change it to recalculate all prices)');
  console.log('- Columns I-M use formulas referencing B2');
  console.log('- Column U = minimum price per filter at target margin');
  console.log('- FilterBuy prices at 1/4/6/12+ quantities');
  console.log('- Filter King prices at 4/6/12+ quantities');
  console.log('- Frozen panes (first 3 rows + first 3 columns)');
})();
