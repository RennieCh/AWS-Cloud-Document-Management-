import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "aws-amplify";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const user = await Auth.signIn(username, password);
      const userId = user.username;
      localStorage.setItem("userId", userId);
      navigate(`/Account/${userId}/Documents`);
    } catch (err) {
      setError("Invalid login: " + (err instanceof Error ? err.message : "An unknown error occurred"));
    }
  };   

  return (
    <div id="wd-signin-screen" className="mb-5 container py-4 px-4">
      <h3>Sign in</h3>
      <div className="mb-3 row">
        <label htmlFor="signin-username" className="col-sm-2 col-form-label">Username</label>
        <div className="col-sm-10">
          <input id="signin-username" className="form-control" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      </div>
      <div className="mb-3 row">
        <label htmlFor="signin-password" className="col-sm-2 col-form-label">Password</label>
        <div className="col-sm-10">
          <input id="signin-password" className="form-control" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-2">
        <button onClick={handleSignIn} className="btn btn-success me-3">Sign in</button>
        <Link to="Signup">Sign up</Link>
      </div>
    </div>
  );
}