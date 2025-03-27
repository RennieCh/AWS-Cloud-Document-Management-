import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => setLoading(false))
      .catch(() => navigate("/Dashboard/Account/Signin"));
  }, [navigate]);

  if (loading) return <div>Checking authentication...</div>;

  return children;
}
