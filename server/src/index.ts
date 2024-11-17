import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// Tip pentru codurile QR
export interface QRCodeData {
  id: number;
  code: string;
}

// Configurații pentru Google Sheets
const SPREADSHEET_ID = '1WOE4kPlmHHH0e_AdmHze9Flyxhff0xu6Oz7Vd7h7ohI';
const RANGE = 'Sheet1!A1';

// Helper pentru autentificare Google Sheets
export const getGoogleSheetsClient = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient(); // Obține clientul
  return google.sheets({ version: 'v4', auth: client as any }); // Adaugă `as any` pentru a forța compatibilitatea tipurilor
};


// Salvare coduri în Google Sheets
export const uploadToGoogleSheets = async (codes: QRCodeData[]) => {
  const sheets = await getGoogleSheetsClient();

  const values = codes.map(({ id, code }) => [id, code, '', '']); // Coloanele pentru Alocat și Validat
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log('Codurile au fost încărcate în Google Sheets.');
};

// Generare coduri unice
export const generateUniqueCodes = (count: number): QRCodeData[] => {
  const codes = new Set<string>();
  while (codes.size < count) {
    const uniqueCode = `QR-${Math.random().toString(36).substr(2, 9)}`;
    codes.add(uniqueCode);
  }
  return Array.from(codes).map((code, index) => ({
    id: index + 1,
    code,
  }));
};

// Generare fișiere QR
export const generateQRCodeFiles = async (codes: QRCodeData[]) => {
  const outputDir = path.resolve(__dirname, '../qrcodes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const { id, code } of codes) {
    const filePath = path.join(outputDir, `qr_${id}.png`);
    await QRCode.toFile(filePath, code, {
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    console.log(`QR generat: ${filePath}`);
  }

  fs.writeFileSync(
    path.join(outputDir, 'codes.csv'),
    codes.map(({ id, code }) => `${id},${code}`).join('\n'),
    'utf8'
  );
  console.log('Codurile au fost salvate în codes.csv');
};
