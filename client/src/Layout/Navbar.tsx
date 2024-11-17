import { Hidden, Stack } from '@mui/material'
import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
	return (
		<>
			<Stack
				sx={{
					flexDirection: 'row',
					height: '50px',
					width: '50%',
					justifyContent: 'space-around',
					fontSize: '30px',
				}}
			>
				<NavLink to='/'>Home</NavLink>
				<NavLink to='/generate'>Generate</NavLink>
				<NavLink to='/validate'>Validate</NavLink>
				<NavLink to='/allocate'>Allocate</NavLink>
			</Stack>
		</>
	)
}

export default Navbar
