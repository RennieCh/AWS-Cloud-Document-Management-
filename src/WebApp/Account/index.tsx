import React from "react";
import Signin from "./Signin";
import Profile from "./Profile";
import Signup from "./Signup";

export default function Account() {
  return (
    <div id="wd-account" className="container py-4 px-4">
      <h2 className="mb-3">Welcome</h2>
      <Signin />
      <hr className="my-5" />
      <Signup />
      <hr className="my-5" />
      <Profile />
    </div>
  );
}
