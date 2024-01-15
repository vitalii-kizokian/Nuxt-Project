export function encodeToHex(originalNumber) {
    let combinedString = 'secretKey' + originalNumber;
    let hexRepresentation = Buffer.from(combinedString).toString('hex');
    return hexRepresentation;
  }
  
 export function decodeFromHex(hexRepresentation) {
    let decodedString = Buffer.from(hexRepresentation, 'hex').toString();
    let retrievedNumber = parseInt(decodedString.slice('secretKey'.length));
    return retrievedNumber;
  }