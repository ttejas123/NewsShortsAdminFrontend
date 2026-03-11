import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { apiClient } from "../services/api";

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      if (!token) {
        console.error("No token found in URL");
        navigate("/login", { replace: true });
        return;
      }

      // 1. Store the token
      localStorage.setItem("token", token);

      try {
        // 2. Fetch the user details using the token
        const user = await apiClient.getMe();

        // 3. Store user in localstorage
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Redirect to home page
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error fetching user info:", error);
        // Clear token if fetching user fails
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
};
