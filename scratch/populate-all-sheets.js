require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiry) return cachedAccessToken;
  const res = await axios.post(`${process.env.ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`, null, {
    params: {
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token'
    }
  });
  cachedAccessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedAccessToken;
}

const SHEET_URL = () => `${process.env.ZOHO_SHEET_API_DOMAIN}/api/v2/${process.env.ZOHO_SHEET_ID}`;

async function zohoPost(method, extraParams) {
  const token = await getAccessToken();
  const params = new URLSearchParams();
  params.append('method', method);
  for (const [k, v] of Object.entries(extraParams)) {
    params.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
  }
  const res = await axios.post(SHEET_URL(), params.toString(), {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res.data;
}

async function createWorksheet(name) {
  try {
    const res = await zohoPost('worksheet.create', { worksheet_name: name });
    console.log(`  [+] Created worksheet: ${name}`, res.status || '');
  } catch (err) {
    const msg = err.response?.data?.error_message || err.message;
    if (msg.includes('already exists') || msg.includes('Duplicate')) {
      console.log(`  [=] Worksheet "${name}" already exists, will add data.`);
    } else {
      console.warn(`  [!] Could not create "${name}": ${msg}`);
    }
  }
  await delay(300);
}

async function pushRows(worksheetName, rows) {
  if (!rows || rows.length === 0) return;

  // First ensure header row exists by setting range
  const headers = Object.keys(rows[0]);
  const headerData = {};
  headers.forEach((h, colIdx) => {
    headerData[`${String.fromCharCode(65 + colIdx)}1`] = h;
  });

  try {
    await zohoPost('cell.set', {
      worksheet_name: worksheetName,
      json_data: headerData
    });
    console.log(`    Initialized headers for ${worksheetName}`);
  } catch (err) {
    // header set warning
  }
  await delay(300);

  // Push in batches of 10 to avoid payload limits
  const batchSize = 10;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    try {
      const res = await zohoPost('worksheet.records.add', {
        worksheet_name: worksheetName,
        json_data: batch
      });
      console.log(`    Pushed rows ${i + 1}-${Math.min(i + batchSize, rows.length)}: ${res.status}`);
    } catch (err) {
      console.error(`    FAILED rows ${i + 1}-${Math.min(i + batchSize, rows.length)}: ${err.response?.data?.error_message || err.message}`);
    }
    await delay(300);
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? `${prefix}_${key}` : key;
    if (Array.isArray(val)) {
      result[k] = val.join(', ');
    } else if (typeof val === 'object' && val !== null) {
      Object.assign(result, flatten(val, k));
    } else {
      result[k] = val !== null && val !== undefined ? String(val) : '';
    }
  }
  return result;
}

// Dataset definitions — each maps JSON file to worksheet name + row flattener
const DATASETS = [
  {
    file: 'accused.json',
    worksheet: 'Accused',
    transform: (item) => flatten(item)
  },
  {
    file: 'victims.json',
    worksheet: 'Victims',
    transform: (item) => flatten(item)
  },
  {
    file: 'timeline.json',
    worksheet: 'Timeline',
    transform: (item) => {
      // Flatten nested entries array into individual rows
      return item.entries.map(e => ({
        FIR_ID: item.fir_id,
        Date: e.date,
        Note: e.note
      }));
    },
    isMultiRow: true
  },
  {
    file: 'mo_matches.json',
    worksheet: 'MO_Matches',
    transform: (item) => flatten(item)
  },
  {
    file: 'chat_qna.json',
    worksheet: 'Chat_QnA',
    transform: (item) => flatten(item)
  },
  {
    file: 'border_state_firs.json',
    worksheet: 'Border_State_FIRs',
    transform: (item) => flatten(item)
  },
  {
    file: 'socio_demographic.json',
    worksheet: 'Socio_Demographic',
    transform: (item) => flatten(item)
  },
  {
    file: 'audit_log.json',
    worksheet: 'Audit_Log',
    transform: (item) => flatten(item)
  }
];

async function main() {
  console.log('=== Sujaga: Populating ALL datasets to Zoho Sheet ===\n');
  console.log(`Sheet ID: ${process.env.ZOHO_SHEET_ID}`);
  console.log(`Total datasets to process: ${DATASETS.length}\n`);

  for (const ds of DATASETS) {
    console.log(`\n--- Processing: ${ds.file} -> Worksheet "${ds.worksheet}" ---`);

    const filePath = path.join(__dirname, '..', 'data', ds.file);
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Create worksheet
    await createWorksheet(ds.worksheet);

    // Transform data into flat rows
    let rows = [];
    for (const item of rawData) {
      const transformed = ds.transform(item);
      if (ds.isMultiRow && Array.isArray(transformed)) {
        rows.push(...transformed);
      } else {
        rows.push(transformed);
      }
    }

    console.log(`  Total rows to push: ${rows.length}`);
    await pushRows(ds.worksheet, rows);
  }

  console.log('\n=== ALL DATASETS POPULATED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
