import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'
import Home from './pages/home/Home'
import ValidatePage from './pages/validate/ValidatePage'
import AllocateQrPage from './pages/allocate/AllocateQrPage'
import GeneratePage from './pages/generate/GeneratePage'

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<MainLayout children={undefined} />}>
					<Route path='/' element={<Home />} />
					<Route path='/generate' element={<GeneratePage />} />
					<Route path='/validate' element={<ValidatePage />} />
					<Route path='/allocate' element={<AllocateQrPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
