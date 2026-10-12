const encoder = new TextEncoder();
const decoder = new TextDecoder();

const KEY_NAME = "sosEncryptionKey";

// ----------------------------------
// Uint8Array → Base64
// ----------------------------------
const uint8ToBase64 = (bytes) => {
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
};

// ----------------------------------
// Base64 → Uint8Array
// ----------------------------------
const base64ToUint8 = (base64) => {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

// ----------------------------------
// Generate AES-256 key
// ----------------------------------
export const generateEncryptionKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// ----------------------------------
// Export CryptoKey
// ----------------------------------
const exportKey = async (key) => {
  const rawKey = await crypto.subtle.exportKey(
    "raw",
    key
  );

  return uint8ToBase64(
    new Uint8Array(rawKey)
  );
};

// ----------------------------------
// Import CryptoKey
// ----------------------------------
const importKey = async (base64Key) => {
  const rawKey = base64ToUint8(base64Key);

  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM"
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// ----------------------------------
// Get or create encryption key
// ----------------------------------
export const getEncryptionKey = async () => {

  let storedKey = localStorage.getItem(KEY_NAME);

  if (!storedKey) {

    const key = await generateEncryptionKey();

    storedKey = await exportKey(key);

    localStorage.setItem(
      KEY_NAME,
      storedKey
    );
  }

  return await importKey(storedKey);
};

// ----------------------------------
// Encrypt SOS
// ----------------------------------
export const encryptSOSData = async (data) => {

  const key = await getEncryptionKey();

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const encodedData = encoder.encode(
    JSON.stringify(data)
  );

  const encryptedBuffer =
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      encodedData
    );

  const encryptedBytes =
    new Uint8Array(encryptedBuffer);

  return {
    encryptedData: uint8ToBase64(
      encryptedBytes
    ),

    iv: uint8ToBase64(iv)
  };
};

// ----------------------------------
// Decrypt SOS
// ----------------------------------
export const decryptSOSData = async ({
  encryptedData,
  iv
}) => {

  if (!encryptedData || !iv) {
    throw new Error(
      "Encrypted SOS data or IV is missing."
    );
  }

  const encryptedBytes =
    base64ToUint8(encryptedData);

  const ivBytes =
    base64ToUint8(iv);

  const key =
    await getEncryptionKey();

  const decryptedBuffer =
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes
      },
      key,
      encryptedBytes
    );

  const decryptedText =
    decoder.decode(decryptedBuffer);

  return JSON.parse(decryptedText);
};