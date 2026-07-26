require('dotenv').config();
const fs = require('fs');
const { pushFirToZohoSheet } = require('../utils/zohoSheet');

const firs = JSON.parse(fs.readFileSync('./data/firs.json', 'utf8'));

async function populateAll() {
  console.log(`Starting population of ${firs.length} mock FIR records to Zoho Sheet...`);
  for (let i = 0; i < firs.length; i++) {
    const f = firs[i];
    const res = await pushFirToZohoSheet({
      firNo: f.fir_no,
      district: f.district,
      policeStation: f.police_station,
      crimeType: f.crime_type,
      ipcSections: f.ipc_sections,
      dateTime: f.date_time,
      location: f.location_text,
      moDescription: f.mo_description,
      accusedName: f.accused_ids ? f.accused_ids.join(', ') : '',
      victimName: f.victim_ids ? f.victim_ids.join(', ') : ''
    });
    console.log(`[${i + 1}/${firs.length}] ${f.fir_no}: ${res.success ? 'SUCCESS' : 'FAILED'}`);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Finished populating Zoho Sheet!');
}

populateAll();
