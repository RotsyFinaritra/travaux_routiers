
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';



import Inscription from './pages/auth/Inscription';
import CartePage from './pages/CartePage';
import ManagerDashboard from './pages/Dashboard';
import AddSignalement from './pages/signalement/AddSignalement';
import EditSignalement from './pages/signalement/EditSignalement';
import SignalementList from './pages/signalement/SignalementList';
import ManagerCreateUser from './pages/user/ManagerCreateUser';
import ManagerUnlockUsers from './pages/user/ManagerUnlockUsers';

import LoginPage from './pages/auth/Login';
import EditManagerProfile from './pages/manager/EditManagerProfile';
import ManagerProfile from './pages/manager/ManagerProfile';
import './styles/login.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/carte" element={<CartePage />} />
        <Route path="/creation-utilisateur" element={<ManagerCreateUser />} />
        <Route path="/debloquer" element={<ManagerUnlockUsers />} />
        <Route path="/tableau" element={<ManagerDashboard />} />
        <Route path="/signalements" element={<SignalementList />} />
        <Route path="/signalements/ajouter" element={<AddSignalement />} />
        <Route path="/signalements/modifier/:id" element={<EditSignalement />} />
        <Route path="/manager" element={<ManagerProfile />} />
        <Route path="/manager/edit" element={<EditManagerProfile />} />
      </Routes>
    </Router>
  );
}

export default App;