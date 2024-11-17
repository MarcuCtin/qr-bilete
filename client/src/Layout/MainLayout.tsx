import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				width: '100vw',
				alignItems: 'center',
			}}
		>
			<Navbar />
			<Outlet />
		</Box>
	)
}

export default MainLayout
