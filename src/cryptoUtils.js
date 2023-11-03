import { wordlist } from "./bip39Wordlist";

export const generateECDHKeys = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"]
  );
};

export const deriveSharedSecret = async (privateKey, publicKey) => {
  const baseKey = await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return baseKey;
};

export const encryptMessage = async (key, message) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(message)
  );
  return { iv, encrypted };
};

export const decryptMessage = async (key, iv, encryptedData) => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData
  );
  return new TextDecoder().decode(decrypted);
};

export const generateSAS = async (sharedSecret) => {
  const exportedKey = await window.crypto.subtle.exportKey("raw", sharedSecret);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", exportedKey);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const bits = (hashArray[0] << 16) | (hashArray[1] << 8) | hashArray[2];

  // Extract two 11-bit indexes from the 24 bits
  const index1 = (bits >> 13) & 0x7ff; // The first 11 bits
  const index2 = bits & 0x7ff; // The next 11 bits

  // Use the indexes to get words from the full BIP39 list
  const word1 = wordlist[index1];
  const word2 = wordlist[index2];

  return `${word1} ${word2}`;
};
