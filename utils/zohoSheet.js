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
    const url = `${process.env.ZOHO_SHEET_API_DOMAIN}/api/v2/${process.env.ZOHO_SHEET_ID}/${process.env.ZOHO_WORKSHEET_NAME}`;

    const payload = {
      method: 'worksheet.records.add',
      worksheet_name: process.env.ZOHO_WORKSHEET_NAME,
      data: {
        rows: [
          {
            FIR_No: firData.firNo || firData.fir_no || '',
            District: firData.district || '',
            Police_Station: firData.policeStation || firData.police_station || '',
            Crime_Type: firData.crimeType || firData.crime_type || '',
            IPC_Sections: firData.ipcSections || firData.ipc_sections || '',
            Date_Time: firData.dateTime || firData.date_time || '',
            Location: firData.location || firData.location_text || '',
            MO_Description: firData.moDescription || firData.mo_description || '',
            Accused_Name: firData.accusedName || firData.accused_name || '',
            Victim_Name: firData.victimName || firData.victim_name || ''
          }
        ]
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
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

module.exports = { pushFirToZohoSheet };
