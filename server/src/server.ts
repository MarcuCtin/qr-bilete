import express, { Request, Response } from "express";
import cors from "cors";
import { getGoogleSheetsClient } from "./index";

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = "1WOE4kPlmHHH0e_AdmHze9Flyxhff0xu6Oz7Vd7h7ohI";

// Endpoint pentru scanare QR
app.post("/api/scan", async (req: any, res: any) => {
  const { code } = req.body;

  try {
    const sheets = await getGoogleSheetsClient();
    const range = `Sheet1!A:D`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows: any[][] = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[1] === code);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Codul nu există." });
    }

    const allocated = rows[rowIndex][2] || "";
    const validated = rows[rowIndex][3] || "";

    if (validated === "V") {
      return res.status(400).json({ message: "Codul a fost deja validat." });
    }

    res.status(200).json({
      message: "Cod scanat cu succes.",
      code,
      allocated,
      validated,
    });
  } catch (error) {
    console.error("Eroare la scanare:", error);
    res.status(500).json({ error: "Eroare internă." });
  }
});

// Endpoint pentru alocare
app.post("/api/allocate", async (req: any, res: any) => {
  const { code, name, surname } = req.body;

  try {
    const sheets = await getGoogleSheetsClient();
    const range = `Sheet1!A:D`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows: any[][] = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[1] === code);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Codul nu există." });
    }

    if (rows[rowIndex][2] === "A") {
      return res.status(400).json({ error: "Codul este deja alocat." });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!C${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[`A (${name} ${surname})`]] },
    });

    res.status(200).json({ message: `Codul ${code} a fost alocat.` });
  } catch (error) {
    console.error("Eroare la alocare:", error);
    res.status(500).json({ error: "Eroare internă." });
  }
});

// Endpoint pentru validare
app.post("/api/validate", async (req: any, res: any) => {
  const { code } = req.body;

  try {
    const sheets = await getGoogleSheetsClient();
    const range = `Sheet1!A:D`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows: any[][] = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[1] === code);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Codul nu există." });
    }

    if (rows[rowIndex][3] === "V") {
      return res.status(400).json({ error: "Codul a fost deja validat." });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!D${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [["V"]] },
    });

    res.status(200).json({ message: `Codul ${code} a fost validat.` });
  } catch (error) {
    console.error("Eroare la validare:", error);
    res.status(500).json({ error: "Eroare internă." });
  }
});

const PORT = 4400;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
