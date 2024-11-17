import React, { useState } from 'react'
import { Button, TextField, Box, FormControl } from '@mui/material'
import axios from 'axios'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import QRCode from 'qrcode'
import { saveAs } from 'file-saver'
import { set } from 'mongoose'

function App() {
	const [scannedCode, setScannedCode] = useState<IDetectedBarcode[] | null>(
		null
	)
	const [qrNr, setQrNr] = useState<number>(0)
	const [pausedScanner, setPausedScanner] = useState<boolean>(false)
	const [user, setUser] = useState<{
		name: string
		surname: string
	}>({
		name: '',
		surname: '',
	})
	const [qrCodes, setQrCodes] = useState<string[]>([])
	const [message, setMessage] = useState<string>('')
	const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false)
	const generateAndDownloadQrCodes = async (codes: string[]) => {
		console.log(codes, 'codes')
		for (const code of codes) {
			console.log(codes)
			const canvas = document.createElement('canvas')
			const encodedCode = btoa(code)
			await QRCode.toCanvas(canvas, encodedCode, {
				errorCorrectionLevel: 'H',
			})
			canvas.toBlob((blob) => {
				if (blob) {
					const codeData = JSON.parse(code)
					saveAs(blob, `${codeData.id}.png`)
				}
			})
		}
	}
	//console.log(qrNr, 'qrNr qrnr ')
	const generateQrCodes = async (number: number) => {
		const newQrCodes = []
		console.log(number, 'number')
		for (let i = 0; i < number; i++) {
			const id = Math.random().toString(36).substr(2, 9)
			const codeData = {
				id: id,
				name: user?.name,
				surname: user?.surname,
			}
			const code = JSON.stringify(codeData)
			newQrCodes.push(code)
		}
		setQrCodes(newQrCodes)
		localStorage.setItem('qrCodes', JSON.stringify(newQrCodes))
		await generateAndDownloadQrCodes(newQrCodes)
	}
	function deleteQrCodes() {
		localStorage.removeItem('qrCodes')
		setQrCodes([])
	}
	const handleScan = async (data: IDetectedBarcode[] | null) => {
		console.log('scafdwadw')
		const qrCode = data?.[0]?.rawValue
		console.log(data)
		if (data) {
			try {
				const response = await axios.post(
					'http://localhost:4400/api/scan',
					{ code: qrCode }
				)
				setScannedCode(data)
				setPausedScanner(true)
				setMessage(response.data.message)
			} catch (error: any) {
				setMessage(
					error.response?.data?.message || 'Eroare la scanare.'
				)
			} finally {
				setPausedScanner(false)
			}
		}
	}

	const allocateCode = async (name: string, surname: string) => {
		if (!scannedCode) return setMessage('Scanează un cod mai întâi.')
		try {
			const response = await axios.post(
				'http://localhost:4400/api/allocate',
				{
					code: scannedCode,
					name,
					surname,
				}
			)
			setMessage(response.data.message)
		} catch (error: any) {
			setMessage(error.response?.data?.error || 'Eroare la alocare.')
		}
	}

	const validateCode = async () => {
		if (!scannedCode) return setMessage('Scanează un cod mai întâi.')
		try {
			const response = await axios.post(
				'http://localhost:4400/api/validate',
				{ code: scannedCode }
			)
			setMessage(response.data.message)
		} catch (error: any) {
			setMessage(error.response?.data?.error || 'Eroare la validare.')
		}
	}

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			gap={10}
			sx={{
				width: '100vw',
				height: '100vh',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			}}
		>
			<Button onClick={() => setIsCameraOpen(!isCameraOpen)}>
				{isCameraOpen ? 'Închide' : 'Deschide'} scanner
			</Button>
			{isCameraOpen && (
				<Scanner
					allowMultiple={true}
					styles={{
						container: {
							width: 300,
							height: 300,
						},
					}}
					scanDelay={2000}
					paused={pausedScanner}
					onScan={(data) => {
						setScannedCode([])
						handleScan(data)
					}}
				/>
			)}

			<FormControl>
				<TextField
					label='Nume'
					variant='outlined'
					type='text'
					name='name'
					onChange={(e) =>
						setUser((prev) => ({
							...prev,
							name: e.target.value,
						}))
					}
				/>
				<TextField
					type='text'
					name='surname'
					label='Prenume'
					variant='outlined'
					onChange={(e) =>
						setUser((prev) => ({
							...prev,
							surname: e.target.value,
						}))
					}
				/>

				<Button
					variant='contained'
					onClick={() => allocateCode('Nume', 'Prenume')}
				>
					Alocare
				</Button>
				<Button
					variant='contained'
					color='secondary'
					onClick={validateCode}
				>
					Validare
				</Button>
				{/* <p>{message}</p> */}
				<TextField
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
			</FormControl>
			<Box>
				{qrCodes.map((code, index) => (
					<div key={index}>
						<p>{code} code</p>
						<canvas id={`canvas-${index}`} />
					</div>
				))}
			</Box>
			<Button
				variant='contained'
				color='secondary'
				onClick={deleteQrCodes}
			>
				Delete QrCodes
			</Button>
		</Box>
	)
}

export default App
