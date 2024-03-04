import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export const crypto = require('crypto').webcrypto;

export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  // Define the algorithm details
  const algorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048, // The length of the modulus in bits
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537 in hex
    hash: "SHA-256", // The hash function to use
  };

  // Generate the key pair
  const keyPair = await crypto.subtle.generateKey(
    algorithm,
    true, // The keys are extractable
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"] // Key usages
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  // Export the key in 'spki' format
  const exportedKey = await crypto.subtle.exportKey("spki", key);
  
  // Convert the ArrayBuffer to a Buffer to use buffer methods
  const keyBuffer = Buffer.from(exportedKey);
  
  // Convert the Buffer to a base64 string
  const base64Key = keyBuffer.toString('base64');

  return base64Key;
}


// Export a crypto private key to a base64 string format

export async function exportPrvKey(key: webcrypto.CryptoKey | null): Promise<string | null> {
  if (!key) {
    return null;
  }

    try {
    const exportedKey = await crypto.subtle.exportKey("pkcs8", key);
    // Convert the ArrayBuffer to a Buffer
    const keyBuffer = Buffer.from(exportedKey);
  
    // Convert the Buffer to a base64 string
    const base64Key = keyBuffer.toString('base64');

  return base64Key;
  } catch (error) {
    console.error("Error exporting private key:", error);
    return "no key for U, lowkey sad...";
  }
}
export async function importPubKey(strKey: string): Promise<webcrypto.CryptoKey> {
  // Convert the base64 string back to an ArrayBuffer
  const binaryString = Buffer.from(strKey, 'base64');
  const keyBuffer = binaryString.buffer.slice(binaryString.byteOffset, binaryString.byteOffset + binaryString.byteLength);

  // Define the algorithm parameters for importing the key
  const algorithm = {
    name: "RSA-OAEP",
    hash: "SHA-256",
  };

  // Import the public key
  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    algorithm,
    true, // The key is extractable
    ["encrypt"] // Usage of the key
  );

  return publicKey;
}


export async function importPrvKey(strKey: string): Promise<webcrypto.CryptoKey> {
  // Convert the base64 string back to an ArrayBuffer
  const binaryString = Buffer.from(strKey, 'base64');
  const keyBuffer = binaryString.buffer.slice(binaryString.byteOffset, binaryString.byteOffset + binaryString.byteLength);

  // Define the algorithm parameters for importing the key
  const algorithm = {
    name: "RSA-OAEP",
    hash: "SHA-256",
  };

  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    algorithm,
    true, // The key is extractable
    ["decrypt"] // Usage of the key
  );

  return privateKey;
}

export async function rsaEncrypt(b64Data: string, strPublicKey: string): Promise<string> {
  // Import the public key
  const publicKey = await importPubKey(strPublicKey); // Using the importPubKey function defined earlier

  // Convert the base64 encoded data to an ArrayBuffer
  const dataBuffer = Buffer.from(b64Data, 'base64').buffer;

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    dataBuffer
  );

  // Convert the encrypted data to a base64 string
  const encryptedBuffer = new Buffer(encryptedData);
  const encryptedBase64 = encryptedBuffer.toString('base64');

  return encryptedBase64;
}



export async function rsaDecrypt(data: string, privateKey: webcrypto.CryptoKey): Promise<string> {
  // Convert the base64 encoded data to an ArrayBuffer
  const dataBuffer = Buffer.from(data, 'base64').buffer;

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    privateKey,
    dataBuffer
  );

  // Convert the decrypted data to a string
  const dec = new TextDecoder();
  const decryptedStr = dec.decode(decryptedData);

  return decryptedStr;
}


// ######################
// ### Symmetric keys ###
// ######################

export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  // Define the algorithm parameters for the symmetric key
  const algorithm = {
    name: "AES-CBC",
    length: 256, // Can be 128, 192, or 256 bits
  };

  // Generate the symmetric key
  const key = await crypto.subtle.generateKey(
    algorithm,
    true, // The key is extractable
    ["encrypt", "decrypt"] // Key usages
  );

  return key;
}


export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  // Export the key in 'raw' format
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  
  // Convert the ArrayBuffer to a Buffer
  const keyBuffer = Buffer.from(exportedKey);
  
  // Convert the Buffer to a base64 string
  const base64Key = keyBuffer.toString('base64');

  return base64Key;
}


export async function importSymKey(strKey: string): Promise<webcrypto.CryptoKey> {
  // Convert the base64 string back to an ArrayBuffer
  const binaryString = Buffer.from(strKey, 'base64');
  const keyBuffer = binaryString.buffer.slice(binaryString.byteOffset, binaryString.byteOffset + binaryString.byteLength);

  // Define the algorithm parameters for the symmetric key
  const algorithm = {
    name: "AES-CBC",
    length: 256, // The length should match the original key length
  };

  // Import the symmetric key
  const symKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    algorithm,
    true, // The key is extractable
    ["encrypt", "decrypt"] // Key usages
  );

  return symKey;
}




export async function symEncrypt(key: webcrypto.CryptoKey, data: string): Promise<string> {
  // Encode the data into a Uint8Array using TextEncoder
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Generate a random initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(16)); 

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv, // Initialization vector
    },
    key,
    encodedData
  );

  // Convert the encrypted data to a base64 string and prepend the IV for later use
  const encryptedArray = new Uint8Array(encryptedData);
  const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
  combinedArray.set(iv);
  combinedArray.set(encryptedArray, iv.length);

  const encryptedBase64 = Buffer.from(combinedArray).toString('base64');

  return encryptedBase64;
}

export async function symDecrypt(strKey: string, encryptedData: string): Promise<string> {
  // Import the symmetric key
  const symKey = await importSymKey(strKey); // Assuming importSymKey is implemented as shown previously

  // Convert the base64 encoded encrypted data back to an ArrayBuffer and extract the IV
  const encryptedArrayBuffer = Buffer.from(encryptedData, 'base64');
  const iv = encryptedArrayBuffer.slice(0, 16); // Extract the first 12 bytes as the IV
  const dataToDecrypt = encryptedArrayBuffer.slice(16); // The rest is the encrypted data

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv, // Initialization vector
    },
    symKey,
    dataToDecrypt
  );

  // Convert the decrypted data back to a string using TextDecoder
  const decoder = new TextDecoder();
  const decryptedStr = decoder.decode(decryptedData);

  return decryptedStr;
}