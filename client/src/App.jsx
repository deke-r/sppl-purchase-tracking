import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestMaterial from './pages/Employee/RequestMaterial';
import MainLayout from './MainLayout';
import PendingMaterialRequests from './pages/Manager/PendingMaterialRequests';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
 
        <Route path="/" element={<Login />} />
        

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/employee/request-for-material" element={<RequestMaterial />} />
          <Route path="/dashboard/manager/pending-material-requests" element={<PendingMaterialRequests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
