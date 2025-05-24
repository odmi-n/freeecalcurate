import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import WorkTimeCalculator from './pages/WorkTimeCalculator';
import AttendanceTracker from './pages/AttendanceTracker';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkTimeCalculator />} />
        <Route path="/attendance" element={<AttendanceTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
