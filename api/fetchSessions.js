const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const sheets = google.sheets('v4');

async function authenticate() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return auth.getClient();
}

module.exports = async (req, res) => {
  console.log('fetchSessions endpoint hit');

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const authClient = await authenticate();
    const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;

    const request = {
      spreadsheetId: sheetId,
      range: 'Sheet2!A:G',
      auth: authClient,
    };

    const response = await sheets.spreadsheets.values.get(request);
    const rows = response.data.values;
    console.log('Rows:', rows);

    if (rows && rows.length) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ error: 'No sessions found' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
