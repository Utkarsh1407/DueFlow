import React from 'react'
import { Route,Routes, useLocation } from "react-router-dom"
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Reminders from './pages/Reminders'
import Activity from './pages/Activity'


const App = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/activity" element={<Activity />} />
      </Route>
    </Routes>
  )
}

export default App