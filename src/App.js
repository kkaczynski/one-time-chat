import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HostRoom from "./HostRoom";
import JoinRoom from "./JoinRoom";
import Chat from "./Chat";

const App = () => {
  const [connection, setConnection] = useState(null);
  const [peer, setPeer] = useState(null);
  const [aesKey, setAesKey] = useState(null);

  return (
    <Router>
      {connection ? (
        <Chat connection={connection} aesKey={aesKey} peer={peer} />
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <HostRoom
                setConnection={setConnection}
                setPeer={setPeer}
                setAesKey={setAesKey}
              />
            }
          />
          <Route
            path="/join"
            element={
              <JoinRoom
                setConnection={setConnection}
                setPeer={setPeer}
                setAesKey={setAesKey}
              />
            }
          />
        </Routes>
      )}
    </Router>
  );
};

export default App;