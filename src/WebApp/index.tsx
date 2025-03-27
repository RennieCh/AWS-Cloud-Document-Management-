import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Signin from "./Account/Signin";
import Signup from "./Account/Signup";
import Profile from "./Account/Profile";
import TOC from "./TOC";
import "./index.css";
import RequireAuth from "./RequireAuth";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";

export default function WebApp() {
  const [userId, setUserId] = useState("");
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const id = user.username;
        setUserId(id);
        localStorage.setItem("userId", id);
      } catch {
        const id = localStorage.getItem("userId") || "";
        setUserId(id);
      }
    };
    getUser();
  }, []);

  // Don't show TOC/Header on Signup
  const hideTOCRoutes = ["/", "/Signup"];
  const shouldShowTOC = !hideTOCRoutes.includes(location.pathname);

  return (
    <div id="wd-webapp" className="container-fluid p-0">
      <div className="d-flex flex-column custom-bg text-success">
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="m-4">Cloud Document Dashboard</h4>
          <img src="images/RC_Logo.png" width="65px" alt="NEU Logo" />
        </div>
        {shouldShowTOC && <TOC userId={userId} />}
      </div>

      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="Signup" element={<Signup />} />
        <Route
          path="/Account"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/Account/:userId/Documents"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
