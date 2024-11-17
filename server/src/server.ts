import express, { Request, Response } from 'express'
import cors from 'cors'
import { getGoogleSheetsClient } from './index'

const app = express()
app.use(cors())
app.use(express.json())

const SPREADSHEET_ID = '1WOE4kPlmHHH0e_AdmHze9Flyxhff0xu6Oz7Vd7h7ohI'
const extractSpreadsheetId = (spreadsheetUrl: string): string => {
	const parts = spreadsheetUrl.split('/d/')
	if (parts.length > 1) {
		const idPart = parts[1].split('/')[0]
		return idPart
	}
	throw new Error('Invalid spreadsheet URL')
}
// Endpoint pentru scanare QR
app.post('/api/scan', async (req: any, res: any) => {
	const { code } = req.body
	try {
		const sheets = await getGoogleSheetsClient()
		const range = `Sheet1!A:E`

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range,
		})

		const rows: any[][] = response.data.values || []
		const rowIndex = rows.findIndex((row) => row[0] === code)

		if (rowIndex === -1) {
			return res.status(404).json({ error: 'Codul nu există.' })
		}

		if (rows[rowIndex][1] === 'A' && rows[rowIndex][2] === 'V') {
			return res
				.status(200)
				.json({ message: 'Biletul este valid.', isValid: true })
		} else {
			return res
				.status(200)
				.json({ error: 'Biletul nu este valid.', isValid: false })
		}
	} catch (error) {
		console.error('Eroare la verificare:', error)
		return res.status(500).json({ error: 'Eroare internă.' })
	}
})

// Endpoint pentru export
app.post('/api/export', async (req: Request, res: Response) => {
	const { qrCodes, spreadSheet } = req.body
	console.log(qrCodes)
	const qrs: string[] = JSON.parse(qrCodes)
	const spreadsheetId = extractSpreadsheetId(spreadSheet)
	console.log(spreadsheetId, 'srpeafkop[e')
	try {
		const sheets = await getGoogleSheetsClient()
		const range = `Sheet1!A:E`
		await sheets.spreadsheets.values.clear({
			spreadsheetId: SPREADSHEET_ID,
			range,
		})
		// Obține rândurile existente
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range,
		})

		const rows: any[][] = response.data.values || []
		const startRow = rows.length + 1

		// Pregătește datele pentru a fi adăugate în foaia de calcul
		const values = qrs.map((code: string) => [
			code, // Column A: QR Code
			'', // Column B: Allocated (initially empty)
			'', // Column C: Verified (initially empty)
			'', // Column D: Name (initially empty)
			'', // Column E: Surname (initially empty)
		])

		// Adaugă datele în foaia de calcul
		await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: `Sheet1!A${startRow}:E${startRow + values.length - 1}`,
			valueInputOption: 'RAW',
			requestBody: { values },
		})

		res.status(200).json({ message: 'Export reusit' })
	} catch (error) {
		console.error('Eroare la export:', error)
		res.status(500).json({ error: 'Eroare internă.' })
	}
})

// Endpoint pentru alocare
app.post('/api/allocate', async (req: any, res: any) => {
	const { code, name, surname } = req.body

	try {
		const sheets = await getGoogleSheetsClient()
		const range = `Sheet1!A:E`

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range,
		})

		const rows: any[][] = response.data.values || []
		const rowIndex = rows.findIndex((row) => row[0] === code)

		if (rowIndex === -1) {
			return res.status(404).json({ error: 'Codul nu există.' })
		}

		if (rows[rowIndex][1] === 'A') {
			return res.status(400).json({ error: 'Codul este deja alocat.' })
		}

		await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: `Sheet1!B${rowIndex + 1}:E${rowIndex + 1}`,
			valueInputOption: 'RAW',
			requestBody: { values: [['A', '', name, surname]] },
		})
		const csv = rows.map((row) => row.join(',')).join('\n')
		res.setHeader('Content-Type', 'text/csv')
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="qrcodes.csv"'
		)
		res.status(200).send(csv)
		res.status(200).json({ message: `Codul ${code} a fost alocat.` })
	} catch (error) {
		console.error('Eroare la alocare:', error)
		res.status(500).json({ error: 'Eroare internă.' })
	}
})

// Endpoint pentru validare
app.post('/api/validate', async (req: any, res: any) => {
	const { code } = req.body

	try {
		const sheets = await getGoogleSheetsClient()
		const range = `Sheet1!A:E`

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range,
		})

		const rows: any[][] = response.data.values || []
		const rowIndex = rows.findIndex((row) => row[0] === code)

		if (rowIndex === -1) {
			return res.status(404).json({ error: 'Codul nu există.' })
		}

		if (rows[rowIndex][2] === 'V') {
			return res.status(400).json({ error: 'Codul a fost deja validat.' })
		}

		await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: `Sheet1!C${rowIndex + 1}`,
			valueInputOption: 'RAW',
			requestBody: { values: [['V']] },
		})

		res.status(200).json({ message: `Codul ${code} a fost validat.` })
	} catch (error) {
		console.error('Eroare la validare:', error)
		res.status(500).json({ error: 'Eroare internă.' })
	}
})

const PORT = 4400
app.listen(PORT, () => {
	console.log(`Serverul rulează pe http://localhost:${PORT}`)
})
