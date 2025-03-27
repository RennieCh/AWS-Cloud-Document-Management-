import React from "react";
import WebApp from "./WebApp";
import { Route, Routes} from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/*" element={<WebApp />} />
      </Routes>
    </div>
  );
}

export default App;
