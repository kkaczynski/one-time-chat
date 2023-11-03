import React, { useState, useEffect } from "react";
import { encryptMessage, decryptMessage, generateSAS } from "./cryptoUtils";
import "./Chat.css";

const Chat = ({ connection, aesKey, peer }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sas, setSas] = useState("");

  useEffect(() => {
    // Define a function that handles incoming data
    const handleData = async (data) => {
      if (aesKey) {
        const decryptedMessage = await decryptMessage(
          aesKey,
          data.iv,
          data.encrypted
        );
        setMessages((prev) => [
          ...prev,
          { text: decryptedMessage, sender: "peer" },
        ]);
      }
    };

    const fetchSas = async () => {
      const generatedSas = await generateSAS(aesKey);
      setSas(generatedSas);
    };

    if (aesKey) {
      fetchSas();
    }

    // Set up the event listener
    connection.on("data", handleData);

    // Return a cleanup function that removes the event listener
    return () => {
      connection.off("data", handleData);
    };
  }, [aesKey, connection]);

  const sendMessage = async () => {
    const { iv, encrypted } = await encryptMessage(aesKey, input);
    connection.send({ iv, encrypted });
    setMessages((prev) => [...prev, { text: input, sender: "self" }]);
    setInput("");
  };

  return (
    <div className="chatContainer">
      <div className="sasContainer">
        <div>
          <p>Please confirm the following code matches on both devices:</p>
          <p>
            <strong>{sas}</strong>
          </p>
        </div>
      </div>
      <div>
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`message ${msg.sender === "self" ? "peer" : "self"}`}>
            {msg.text}
          </p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
