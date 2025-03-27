import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import { Auth } from "aws-amplify";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((userData) => {
        setUser(userData);
        setFirstName(userData.attributes?.given_name || "");
        setLastName(userData.attributes?.family_name || "");
        setBirthdate(userData.attributes?.birthdate || "");
      })
      .catch(() => navigate("/Dashboard/Account/Signin"));
  }, [navigate]);

  const handleSignOut = async () => {
    await Auth.signOut();
    navigate("/Dashboard/Account/Signin");
  };

  const handleUpdate = async () => {
    try {
      const result = await Auth.updateUserAttributes(user, {
        given_name: firstName,
        family_name: lastName,
        birthdate: birthdate,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Failed to update profile attributes.");
    }
  };

  return user ? (
    <div id="wd-profile-screen" className="mb-5 container py-4 px-4">
      <h3>Profile</h3>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">Username</label>
        <div className="col-sm-10">
          <input className="form-control" value={user.username} disabled />
          <small className="text-muted">Username cannot be changed.</small>
        </div>
      </div>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">Email</label>
        <div className="col-sm-10">
          <input className="form-control" value={user.attributes?.email || ""} disabled />
          <small className="text-muted">Email cannot be changed.</small>
        </div>
      </div>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">First Name</label>
        <div className="col-sm-10">
          <input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
      </div>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">Last Name</label>
        <div className="col-sm-10">
          <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div className="mb-3 row">
        <label className="col-sm-2 col-form-label">Birthdate</label>
        <div className="col-sm-10">
          <input className="form-control" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="mb-2">
        <button onClick={handleUpdate} className="btn btn-primary me-2">Update Profile</button>
        <button onClick={handleSignOut} className="btn btn-danger">Sign out</button>
      </div>
    </div>
  ) : (
    <div>Loading profile...</div>
  );
}
