import { NavLink } from "react-router-dom";
import { RiAccountCircleLine } from "react-icons/ri";
import { BsWindowDock } from "react-icons/bs";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import "./index.css";

export default function TOC({ userId }: { userId: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
<div className="container-fluid custom-bg">
      <ul className="nav nav-tabs">
        {isLoggedIn && (
          <li className="nav-item">
            <NavLink
              to="/Account"
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${isActive ? "active text-success fw-bold" : ""}`
              }
            >
              <RiAccountCircleLine className="me-2 text-success" />
              Account
            </NavLink>
          </li>
        )}
        {isLoggedIn && (
          <li className="nav-item">
            <NavLink
              to={`/Account/${localStorage.getItem("userId")}/Documents`}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${isActive ? "active text-success fw-bold" : ""}`
              }
            >
              <BsWindowDock className="me-2 text-success" />
              Document
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}
