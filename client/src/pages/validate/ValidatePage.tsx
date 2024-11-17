import {
	Box,
	Button,
	FormControl,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import axios from 'axios'
import React, { useState } from 'react'

const ValidatePage = () => {
	const [scannedCode, setScannedCode] = useState<IDetectedBarcode[] | null>(
		null
	)

	const [pausedScanner, setPausedScanner] = useState<boolean>(false)
	const [user, setUser] = useState<{
		name: string
		surname: string
	}>({
		name: '',
		surname: '',
	})
	const [isCurrentQrCodeValid, setIsCurrentQrCodeValid] =
		useState<boolean>(false)
	const [message, setMessage] = useState<string>('')
	const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false)
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
				console.log(response.data)
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
			sx={{
				display: 'flex',

				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				height: '90vh',
			}}
		>
			<Box
				display='flex'
				flexDirection='column'
				alignItems='center'
				gap={10}
				sx={{
					height: '80%',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'row',
				}}
			>
				<Button
					variant='contained'
					color='primary'
					onClick={() => setIsCameraOpen(!isCameraOpen)}
				>
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
				</FormControl>
			</Box>
			{scannedCode && (
				<Stack
					sx={{
						width: '200px',
						height: '50px',
						textAlign: 'center',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: isCurrentQrCodeValid ? 'green' : 'red',
					}}
				>
					{isCurrentQrCodeValid ? 'Cod valid' : 'Cod invalid'}
					<Typography
						sx={{
							position: 'relative',
							top: '30px',
						}}
					>
						{scannedCode[0].rawValue}
					</Typography>
				</Stack>
			)}
		</Box>
	)
}

export default ValidatePage
