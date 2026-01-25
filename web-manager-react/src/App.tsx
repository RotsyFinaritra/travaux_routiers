
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
import './styles/login.css';

import { type ReactElement } from 'react';

function RequireManager({ children }: { children: ReactElement }) {
  // Vérification temporairement commentée pour le développement
  // const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem("travaux.auth.user");
  //     if (!raw) {
  //       setIsAllowed(false);
  //       return;
  //     }
  //     const parsed = JSON.parse(raw) as { role?: string } | null;
  //     if (!parsed || !parsed.role || parsed.role.toUpperCase() !== "MANAGER") {
  //       setIsAllowed(false);
  //       return;
  //     }
  //     setIsAllowed(true);
  //   } catch {
  //     setIsAllowed(false);
  //   }
  // }, []);

  // if (isAllowed === null) {
  //   return null;
  // }

  // if (!isAllowed) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/carte" element={<CartePage />} />
        <Route path="/utilisateurs" element={<RequireManager><UserList /></RequireManager>} />
        <Route path="/utilisateurs/creer" element={<RequireManager><CreateUser /></RequireManager>} />
        <Route path="/utilisateurs/modifier/:id" element={<RequireManager><EditUser /></RequireManager>} />
        <Route path="/tableau" element={<RequireManager><ManagerDashboard /></RequireManager>} />
        <Route path="/signalements" element={<RequireManager><SignalementList /></RequireManager>} />
        <Route path="/signalements/ajouter" element={<RequireManager><AddSignalement /></RequireManager>} />
        <Route path="/signalements/modifier/:id" element={<RequireManager><EditSignalement /></RequireManager>} />
        <Route path="/manager" element={<RequireManager><ManagerProfile /></RequireManager>} />
        <Route path="/manager/edit" element={<RequireManager><EditManagerProfile /></RequireManager>} />
      </Routes>
    </Router>
  );
}

export default App;