import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import ExecutionFinance from './pages/ExecutionFinance';
import Investors from './pages/Investors';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/execution" element={<ExecutionFinance />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/:id" element={<ModulePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

