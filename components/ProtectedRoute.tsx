import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#260f06] flex flex-col items-center justify-center text-[#f9edd2]">
            <Loader2 className="animate-spin text-[#e1af4d] mb-4" size={32} />
            <p className="text-xs uppercase tracking-widest opacity-70">Authenticating...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // If authenticated but not admin, redirect to user dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};