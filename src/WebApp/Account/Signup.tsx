import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "aws-amplify";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          email,
          given_name: firstName,
          family_name: lastName,
          birthdate: dob,
          name: `${firstName} ${lastName}`,
        },
      });
      setShowConfirm(true);
      setError("");
    } catch (err: any) {
      if (err.code === "UsernameExistsException") {
        setError("Username already exists. Please choose a different one.");
      } else if (err.code === "InvalidPasswordException") {
        setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      } else {
        setError("Signup failed: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleConfirmSignup = async () => {
    try {
      await Auth.confirmSignUp(username, code);
      navigate("/");
    } catch (err) {
      setError("Confirmation failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div id="wd-signup-screen" className="mb-5 container py-4 px-4">
      <h3>Sign up</h3>

      {!showConfirm ? (
        <>
          <div className="mb-3">
            <input className="form-control mb-2" placeholder="Username (must be unique, alphanumeric only, no spaces)" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="form-control mb-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <small className="text-muted mb-1 d-block">Password must be at least 8 characters, including uppercase, lowercase, number, and special character.</small>
            <input className="form-control mb-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="form-control mb-2" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <input className="form-control mb-2" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="form-control mb-2" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input className="form-control mb-2" placeholder="Date of Birth (YYYY-MM-DD)" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-2">
            <button onClick={handleSignup} className="btn btn-success me-3">Sign up</button>
            <Link to="/">Sign in</Link>
          </div>
        </>
      ) : (
        <>
          <p>Enter the verification code sent to your email:</p>
          <input className="form-control mb-3" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} />
          {error && <div className="alert alert-danger">{error}</div>}
          <button onClick={handleConfirmSignup} className="btn btn-primary">Confirm Sign up</button>
        </>
      )}
    </div>
  );
}