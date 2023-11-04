import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import { Navigate } from "react-router-dom";
import { generateECDHKeys, deriveSharedSecret } from "./cryptoUtils";

const joinUrlPrefix =
  process.env.REACT_APP_JOIN_PREFIX || "http://localhost:3000/join?peerId=";

const HostRoom = ({ setConnection, setPeer, setAesKey }) => {
  const [peerId, setPeerId] = useState("");
  const [connection, setLocalConnection] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    generateECDHKeys().then(async (keys) => {
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "jwk",
        keys.publicKey
      );
      const jsonPublicKey = JSON.stringify(exportedPublicKey);
      const buffer = new TextEncoder().encode(jsonPublicKey);
      const hashBuffer = await window.crypto.subtle.digest(
        "SHA-256",
        buffer
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const newPeer = new Peer(hashHex);
      setPeer(newPeer);

      newPeer.on("open", (id) => {
        setPeerId(id);
      });

      newPeer.on("connection", (conn) => {
        console.log("Incoming connection from", conn.peer);

        conn.on("data", async (receivedData) => {
          console.log("receivedData", receivedData);
          if (receivedData.type === "publicKey") {
            // Import the received public key
            const importedPublicKey = await window.crypto.subtle.importKey(
              "jwk",
              receivedData.key,
              {
                name: "ECDH",
                namedCurve: "P-256",
              },
              false,
              []
            );

            // Send own public key if not sent already
            const exportedPublicKey = await window.crypto.subtle.exportKey(
              "jwk",
              keys.publicKey
            );
            conn.send({ type: "publicKey", key: exportedPublicKey });

            // Derive shared secret
            const sharedSecret = await deriveSharedSecret(
              keys.privateKey,
              importedPublicKey
            );
            setAesKey(sharedSecret);
            setReady(true);
          }
        });

        conn.on("open", () => {
          console.log("Data channel opened with", conn.peer);
        });

        conn.on("error", (err) => {
          console.error("PeerJS Connection Error:", err);
        });

        setLocalConnection(conn);
        setConnection(conn);
      });
    });
  }, [setConnection, setPeer, setAesKey]);

  if (connection && ready) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h2>Share your unique chat link to start chat:</h2>
      {peerId && <a href={joinUrlPrefix + peerId}>{joinUrlPrefix + peerId}</a>}
    </div>
  );
};

export default HostRoom;
