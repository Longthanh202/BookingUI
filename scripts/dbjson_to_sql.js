const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'db.json');
const outPath = path.resolve(__dirname, 'seed.sql');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const escape = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
};

const write = (s) => fs.appendFileSync(outPath, s + '\n', 'utf8');

if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

write('-- SQL seed generated from db.json');
write('BEGIN TRANSACTION;');

function insertRows(tableName, rows, columns) {
  if (!rows || !rows.length) return;
  write(`-- Insert ${rows.length} rows into ${tableName}`);
  rows.forEach((r) => {
    const row = { ...r };
    // For khachsan table, ensure NguoiTao is populated to avoid NOT NULL errors
    if (tableName.toLowerCase() === 'khachsan') {
      if (!('NguoiTao' in row) || row.NguoiTao === null || row.NguoiTao === undefined) {
        row.NguoiTao = 'seed';
      }
    }
    const cols = Object.keys(row);
    const vals = cols.map((c) => escape(r[c]));
    write(`INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${vals.join(', ')});`);
  });
  write('');
}

// Map db.json arrays to SQL table names (adjust if your DB uses different names)
insertRows('khachsan', db.khachsans || []);
insertRows('khachsanimages', db.khachsanimages || []);
insertRows('loaiphong', db.loaiphong || []);
insertRows('giaphong', db.giaphong || []);
insertRows('phong', db.phong || []);
insertRows('tienich', db.tienich || []);
insertRows('khachsan_tienich', db.khachsan_tienich || []);

write('COMMIT;');

console.log('Wrote SQL to', outPath);
