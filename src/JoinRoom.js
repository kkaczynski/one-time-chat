import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Peer from "peerjs";
import Chat from "./Chat";
import { generateECDHKeys, deriveSharedSecret } from "./cryptoUtils";

const JoinRoom = ({ setConnection, setPeer, setAesKey }) => {
  const [ownKeys, setOwnKeys] = useState(null);
  const [peer, setLocalPeer] = useState(null);
  const [aesKey, setLocalAesKey] = useState(null);
  const [connection, setLocalConnection] = useState(null);
  const location = useLocation();
  const hostPeerId = new URLSearchParams(location.search).get("peerId");

  useEffect(() => {
    generateECDHKeys().then(setOwnKeys);

    const newPeer = new Peer();
    setLocalPeer(newPeer);
    setPeer(newPeer);
  }, [setPeer]);

  const setupConnectionEvents = useCallback(
    (conn) => {
      conn.on("open", async () => {
        const exportedPublicKey = await window.crypto.subtle.exportKey(
          "jwk",
          ownKeys.publicKey
        );
        conn.send({ type: "publicKey", key: exportedPublicKey });
      });

      conn.on("data", async (data) => {
        if (data.type === "publicKey") {
          const importedPublicKey = await window.crypto.subtle.importKey(
            "jwk",
            data.key,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
          );
          const jsonPublicKey = JSON.stringify(data.key);
          const buffer = new TextEncoder().encode(jsonPublicKey);
          const hashBuffer = await window.crypto.subtle.digest(
            "SHA-256",
            buffer
          );
          const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          if (hashHex === hostPeerId) {
            const sharedSecret = await deriveSharedSecret(
              ownKeys.privateKey,
              importedPublicKey
            );
            setLocalAesKey(sharedSecret);
            setAesKey(sharedSecret);
            setLocalConnection(conn);
            setConnection(conn);
          } else {
            alert("Invalid public key received. Connection can't be established.");
            conn.close();
          }
        }
      });

      conn.on("error", (err) => {
        console.error("PeerJS Connection Error:", err);
      });
    },
    [ownKeys, setAesKey, setConnection, hostPeerId]
  );

  useEffect(() => {
    if (ownKeys && hostPeerId && peer) {
      let conn;
      //Timeout is added, because connection was not always initiated by PeerJS
      setTimeout(() => {
        conn = peer.connect(hostPeerId);
        setupConnectionEvents(conn);
      }, 1000);
    }
  }, [ownKeys, hostPeerId, peer, setupConnectionEvents]);

  return connection ? (
    <Chat connection={connection} aesKey={aesKey} peer={peer} />
  ) : (
    <p>Connecting...</p>
  );
};

export default JoinRoom;
