const { google } = require('googleapis');

const sheets = google.sheets('v4');

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return auth.getClient();
}

module.exports = async (req, res) => {
  console.log('fetchBookings endpoint hit');
  const authClient = await authenticate();
  const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;
  const userId = req.query.userId;
  console.log('User ID:', userId);

  const request = {
    spreadsheetId: sheetId,
    range: 'Sheet1!A:E',
    auth: authClient,
  };

  try {
    const response = await sheets.spreadsheets.values.get(request);
    const rows = response.data.values;
    console.log('Rows:', rows);

    if (rows.length) {
      const bookings = rows.filter(row => row[0] === userId);
      res.status(200).json(bookings);
    } else {
      res.status(404).json({ error: 'No bookings found' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
