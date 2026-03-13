import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SimulateTransaction from './pages/SimulateTransaction'
import FraudAlerts from './pages/FraudAlerts'
import BankApproval from './pages/BankApproval'
import BlockchainVerification from './pages/BlockchainVerification'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="simulate" element={<SimulateTransaction />} />
          <Route path="alerts" element={<FraudAlerts />} />
          <Route path="approval" element={<BankApproval />} />
          <Route path="blockchain" element={<BlockchainVerification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
