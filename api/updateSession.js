const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const sheets = google.sheets('v4');

async function authenticate() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

const handler = async (req, res) => {
  // Set common CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { index, session } = req.body;

  try {
    const authClient = await authenticate();
    const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;

    const range = `Sheet2!A${index + 2}:G${index + 2}`; // Adjust for 0-based index and header row
    const valueInputOption = 'RAW';
    const values = [session];

    const request = {
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: valueInputOption,
      resource: {
        values: values,
      },
      auth: authClient,
    };

    const response = await sheets.spreadsheets.values.update(request);
    console.log('Updated session:', response.data);

    res.status(200).json({ message: 'Session updated successfully', response: response.data });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = handler;
