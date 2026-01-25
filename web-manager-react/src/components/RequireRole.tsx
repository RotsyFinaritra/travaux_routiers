import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {
  allowed: string[]; // e.g. ['MANAGER']
  children: React.ReactElement;
};

const RequireRole: React.FC<Props> = ({ allowed, children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const normalized = (role ?? "").toUpperCase();
  const ok = allowed.map((a) => a.toUpperCase()).includes(normalized);
  if (!ok) return <Navigate to="/" replace />;
  return children;
};

export default RequireRole;
