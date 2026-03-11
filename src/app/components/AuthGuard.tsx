import React from "react";
import { Navigate, Outlet } from "react-router";

export function AuthGuard() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a token exists, decode user and check role
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Allow 'manager' or 'admin' only, or simply 'admin' per user request - Let's enforce just 'admin' and 'manager'
    // User requested: "if my role isn't admin don't let me in because it's admin panel not client panel."
    // Given the role definitions earlier (admin, manager, client), we will strictly check for "admin" here.
    if (!user || user.role !== "admin") {
         return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
               <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                 <p className="text-gray-600 mb-6">You do not have the required administrative privileges to access this control panel.</p>
                 <button 
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                 >
                   Return to Login
                 </button>
               </div>
             </div>
         );
    }

  } catch (error) {
    // Failsafe in case JSON parse fails
    console.error("AuthGuard user parse error:", error);
    return <Navigate to="/login" replace />;
  }

  // Authenticated and admin
  return <Outlet />;
}
