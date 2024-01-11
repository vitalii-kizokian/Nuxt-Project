// import CryptoJS from 'crypto-js';
// import { ShortCrypt } from "short-crypt";
import '~/static/short-crypt.min.js'

// Key for encryption, make sure to keep it secure
// const encryptionKey = 'your-secret-key';
const key = 'your-secret-key';

const sc = new ShortCrypt(key);
/*export function md5HashFunction(data) {
  return CryptoJS.MD5(data).toString();
}*/
export function encryptFunction(id) {
  return sc.encryptToQRCodeAlphanumeric(id);
}

export function decryptFunction(encryptedId) {
  return sc.decryptQRCodeAlphanumeric(encryptedId);
}

/*export function encryptFunction(id) {
  const encrypted = CryptoJS.AES.encrypt(id.toString(), encryptionKey).toString();
  // Replace slashes with another character or remove them
  const sanitizedEncrypted = encrypted.replace(/\//g, '-');
  return sanitizedEncrypted;
}
 
export function decryptFunction(encryptedId) {
  // If you modified the encryptFunction, make sure to reverse that change here
  const sanitizedEncrypted = encryptedId.replace(/-/g, '/');
  const bytes = CryptoJS.AES.decrypt(sanitizedEncrypted, encryptionKey);
  const originalId = bytes.toString(CryptoJS.enc.Utf8);
  return originalId;
}*/

/*export function encryptFunction(id) {
  const hashedId = md5HashFunction(id);
  const encrypted = CryptoJS.AES.encrypt(hashedId, 'your-secret-key').toString();
  return encrypted;
}
 
export function decryptFunction(encryptedId) {
  const bytes = CryptoJS.AES.decrypt(encryptedId, 'your-secret-key');
  const hashedId = bytes.toString(CryptoJS.enc.Utf8);
  return hashedId;
}*/

/*export function encryptFunction(id) {
    var b64 = CryptoJS.AES.encrypt(id, 'your-secret-key').toString();
    var e64 = CryptoJS.enc.Base64.parse(b64);
    var eHex = e64.toString(CryptoJS.enc.Hex);
    return eHex;
}

export function decryptFunction(encryptedId) {
   var reb64 = CryptoJS.enc.Hex.parse(encryptedId);
   var bytes = reb64.toString(CryptoJS.enc.Base64);
   var decrypt = CryptoJS.AES.decrypt(bytes, 'your-secret-key');
   var plain = decrypt.toString(CryptoJS.enc.Utf8);
   return plain;
}*/

/*export function encryptFunction(id) {
  // Use SHA-256 to generate a hash
  const hash = CryptoJS.SHA256(id.toString()).toString(CryptoJS.enc.Hex);
  // Truncate the hash to 16 characters (adjust the length as needed)
  const truncatedHash = hash.substring(0, 16);
  // Replace slashes with underscores to sanitize for URLs
  const sanitizedHash = truncatedHash.replace(/\//g, '_');
  // Use the sanitized hash in your encryption process
  const encrypted = CryptoJS.AES.encrypt(sanitizedHash, encryptionKey).toString();
  return encrypted;
}
 
export function decryptFunction(encryptedId) {
  // Decrypt the ID using your decryption process
  const bytes = CryptoJS.AES.decrypt(encryptedId, encryptionKey);
  const sanitizedHash = bytes.toString(CryptoJS.enc.Utf8);
  // Replace underscores with slashes to restore the original sanitized hash
  const truncatedHash = sanitizedHash.replace(/_/g, '/');
  // You might need to convert the truncated hash back to the original ID format
  return truncatedHash;
}*/