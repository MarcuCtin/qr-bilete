import { Box, Button, Stack, TextField } from '@mui/material'
import saveAs from 'file-saver'
import React, { useState } from 'react'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import axios from 'axios'

const GeneratePage = () => {
	const [spreadSheet, setSpreadSheet] = useState<string>('')
	const [qrCodes, setQrCodes] = useState<string[]>([])
	const [qrNr, setQrNr] = useState<number>(0)
	const [qrCodesLinks, setQrCodesLinks] = useState<string[]>([])
	const [zipAvailable, setZipAvailable] = useState<boolean>(false)
	const [message, setMessage] = useState<string>('')
	const generateAndDownloadQrCodes = async (codes: string[]) => {
		const zip = new JSZip()
		const qrCodesLinksTemp: string[] = []

		for (const code of codes) {
			const canvas = document.createElement('canvas')
			await QRCode.toCanvas(canvas, code, { errorCorrectionLevel: 'H' })
			const blob = await new Promise<Blob | null>((resolve) => {
				canvas.toBlob((blob) => resolve(blob))
			})

			if (blob) {
				const url = URL.createObjectURL(blob)
				qrCodesLinksTemp.push(url)
				zip.file(`${code}.png`, blob)
			}
		}

		setQrCodesLinks(qrCodesLinksTemp)

		const zipBlob = await zip.generateAsync({ type: 'blob' })
		const zipBlobUrl = URL.createObjectURL(zipBlob)
		localStorage.setItem('qrCodesZip', zipBlobUrl)
		const zipBlobUrl2 = localStorage.getItem('qrCodesZip')
		if (zipBlobUrl2) {
			setZipAvailable(true)
		}
	}
	function handleDownloadZip() {
		const zipBlobUrl = localStorage.getItem('qrCodesZip')
		if (zipBlobUrl) {
			saveAs(zipBlobUrl, 'qrCodes.zip')
		}
	}
	const deleteQrCodes = () => {
		localStorage.removeItem('qrCodes')
		setQrCodes([])
		setQrCodesLinks([])
		setZipAvailable(false)
		localStorage.removeItem('qrCodesZip')
	}

	const generateQrCodes = async (number: number) => {
		const newQrCodes = []
		for (let i = 0; i < number; i++) {
			const id = Math.random().toString(36).substr(2, 9)
			newQrCodes.push(id)
		}
		setQrCodes(newQrCodes)
		localStorage.setItem('qrCodes', JSON.stringify(newQrCodes))
		await generateAndDownloadQrCodes(newQrCodes)
	}
	function downloadCSV() {
		const qrCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]')

		const csv = qrCodes?.join('\n')
		if (csv) {
			const blob = new Blob([csv], { type: 'text/csv' })
			saveAs(blob, 'codes.csv')
		}
	}
	function handleExport() {
		const qrCodes = localStorage.getItem('qrCodes')
		const upload = async () => {
			try {
				const response = await axios.post(
					'http://localhost:4400/api/export',
					{
						qrCodes,
						spreadSheet,
						headers: {
							'Content-Type': 'application/json',
						},
					}
				)
				console.log(response.data)
				if (response.status === 200) {
					setMessage('Export reusit')
					console.log('Export reușit:', response.data)
				}
			} catch (error) {
				console.error('Eroare la export:', error)
			}
		}
		upload()
	}
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '90%',
				width: '90%',

				alignItems: 'center',
			}}
		>
			<Stack
				sx={{
					flexDirection: 'row',
					width: '100%',
					height: '80%',
					justifyContent: 'space-around',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						justifySelf: 'flex-start',
						height: '80%',
						width: '50%',
						border: '1px solid red',
						overflowY: 'scroll',
						position: 'relative',
					}}
				>
					{qrCodesLinks.map((link, index) => (
						<img key={index} src={link} alt={`QR Code ${index}`} />
					))}
				</Box>

				<Stack
					sx={{
						width: '10%',
					}}
				>
					<TextField
						sx={{
							color: 'white',
							fill: 'white',
							mb: 2,
						}}
						label='Nr Coduri'
						variant='outlined'
						onChange={(e) => setQrNr(Number(e.target.value))}
					/>
					<Button
						variant='contained'
						color='secondary'
						onClick={() => generateQrCodes(qrNr)}
					>
						Generate Qr Codes {qrNr}
					</Button>
					{qrCodes.length > 0 && (
						<Button
							variant='contained'
							color='secondary'
							sx={{
								mt: 2,
							}}
							onClick={deleteQrCodes}
						>
							Delete QrCodes
						</Button>
					)}
					{zipAvailable && (
						<Stack>
							<Button
								sx={{
									mt: 2,
								}}
								variant='contained'
								color='warning'
								onClick={handleDownloadZip}
							>
								Download Zip
							</Button>
							<Button onClick={downloadCSV}>Generate CSV</Button>
						</Stack>
					)}
				</Stack>
			</Stack>
			{zipAvailable && (
				<Stack
					sx={{
						flexDirection: 'row',
						width: '100%',
						justifyContent: 'center',
						mx: 'auto',
					}}
				>
					<TextField
						type='text'
						label='Spreadsheet link'
						name='spreadsheet link'
						onChange={(e) => setSpreadSheet(e.target.value)}
					/>
					<Button
						variant='contained'
						color='secondary'
						onClick={handleExport}
					>
						Export
					</Button>
				</Stack>
			)}
		</Box>
	)
}

export default GeneratePage
