
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';



import Inscription from './pages/auth/Inscription';
import CartePage from './pages/CartePage';
import ManagerDashboard from './pages/Dashboard';
import PublicHome from './pages/PublicHome';
import AddSignalement from './pages/signalement/AddSignalement';
import EditSignalement from './pages/signalement/EditSignalement';
import SignalementList from './pages/signalement/SignalementList';
import CreateUser from './pages/user/CreateUser';
import EditUser from './pages/user/EditUser';
import UserList from './pages/user/UserList';

import LoginPage from './pages/auth/Login';
import EditManagerProfile from './pages/manager/EditManagerProfile';
import ManagerProfile from './pages/manager/ManagerProfile';
import ValidationQueue from './pages/manager/ValidationQueue';
import './styles/login.css';

import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/carte" element={<CartePage />} />
        <Route path="/utilisateurs" element={<RequireRole allowed={["MANAGER"]}><UserList /></RequireRole>} />
        <Route path="/utilisateurs/creer" element={<RequireRole allowed={["MANAGER"]}><CreateUser /></RequireRole>} />
        <Route path="/utilisateurs/modifier/:id" element={<RequireRole allowed={["MANAGER"]}><EditUser /></RequireRole>} />
        <Route path="/tableau" element={<RequireRole allowed={["MANAGER"]}><ManagerDashboard /></RequireRole>} />
        <Route path="/signalements" element={<RequireAuth><SignalementList /></RequireAuth>} />
        <Route path="/signalements/ajouter" element={<RequireAuth><AddSignalement /></RequireAuth>} />
        <Route path="/signalements/modifier/:id" element={<RequireAuth><EditSignalement /></RequireAuth>} />
        <Route path="/manager" element={<RequireRole allowed={["MANAGER"]}><ManagerProfile /></RequireRole>} />
        <Route path="/manager/edit" element={<RequireRole allowed={["MANAGER"]}><EditManagerProfile /></RequireRole>} />
        <Route path="/manager/validations" element={<RequireRole allowed={["MANAGER"]}><ValidationQueue /></RequireRole>} />
      </Routes>
    </Router>
  );
}

export default App;