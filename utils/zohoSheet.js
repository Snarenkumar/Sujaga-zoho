const axios = require('axios');

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }
  const response = await axios.post(
    `${process.env.ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`,
    null,
    {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    }
  );
  cachedAccessToken = response.data.access_token;
  // refresh a bit before actual expiry
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedAccessToken;
}

async function pushFirToZohoSheet(firData) {
  try {
    if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_SHEET_ID) {
      console.log('[Zoho Sheet] Environment variables not configured, skipping sync.');
      return { success: false, error: 'Environment variables missing' };
    }
    const accessToken = await getAccessToken();
    const url = `${process.env.ZOHO_SHEET_API_DOMAIN}/api/v2/${process.env.ZOHO_SHEET_ID}`;

    const records = [
      {
        FIR_No: firData.firNo || firData.fir_no || '',
        District: firData.district || '',
        Police_Station: firData.policeStation || firData.police_station || '',
        Crime_Type: firData.crimeType || firData.crime_type || '',
        IPC_Sections: firData.ipcSections || firData.ipc_sections || '',
        Date_Time: firData.dateTime || firData.date_time || '',
        Location: firData.location || firData.location_text || '',
        MO_Description: firData.moDescription || firData.mo_description || '',
        Accused_Name: firData.accusedName || firData.accused_names || '',
        Victim_Name: firData.victimName || firData.victim_names || ''
      }
    ];

    const params = new URLSearchParams();
    params.append('method', 'worksheet.records.add');
    params.append('worksheet_name', process.env.ZOHO_WORKSHEET_NAME);
    params.append('json_data', JSON.stringify(records));

    const response = await axios.post(url, params.toString(), {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('[Zoho Sheet] Row pushed successfully:', response.data);
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[Zoho Sheet] Push failed:', err.response?.data || err.message);
    // IMPORTANT: never throw — this must not break the existing FIR submission flow
    return { success: false, error: err.response?.data || err.message };
  }
}

async function fetchFirsFromZohoSheet() {
  try {
    if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_SHEET_ID) {
      return null;
    }
    const accessToken = await getAccessToken();
    const url = `${process.env.ZOHO_SHEET_API_DOMAIN}/api/v2/${process.env.ZOHO_SHEET_ID}`;
    
    const params = new URLSearchParams();
    params.append('method', 'worksheet.records.fetch');
    params.append('worksheet_name', process.env.ZOHO_WORKSHEET_NAME);

    const response = await axios.post(url, params.toString(), {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.records) {
      return response.data.records.map((r, idx) => ({
        id: `FIR-2025-${String(idx + 1).padStart(3, '0')}`,
        fir_no: r.FIR_No || `FIR-2025-${idx + 1}`,
        date_time: r.Date_Time || '2025-07-15T12:00:00',
        district: r.District || 'Bengaluru Urban',
        police_station: r.Police_Station || 'Central PS',
        ipc_sections: r.IPC_Sections || '379',
        crime_type: r.Crime_Type || 'Chain Snatching',
        location_text: r.Location || 'City Center',
        lat: 12.9716,
        lng: 77.5946,
        mo_description: r.MO_Description || '',
        accused_ids: r.Accused_Name ? r.Accused_Name.split(', ') : [],
        victim_ids: r.Victim_Name ? r.Victim_Name.split(', ') : [],
        status: 'open'
      }));
    }
    return null;
  } catch (err) {
    console.warn('[Zoho Sheet] Fetch failed, falling back to local dataset:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { pushFirToZohoSheet, fetchFirsFromZohoSheet };
