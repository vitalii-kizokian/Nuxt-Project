export default ({ app }, inject) => {
  // Inject $hello(msg) in Vue, context and store.
  inject('encodeToHex', (originalNumber) => {
    let combinedString = "abc123" + originalNumber.toString();
    let hexRepresentation = Buffer.from(combinedString).toString('hex');
    return hexRepresentation;
  });
  inject('decodeFromHex', (hexRepresentation) => {
    try {
      let decodedString = Buffer.from(hexRepresentation, 'hex').toString();
      let retrievedNumber = parseInt(decodedString.slice("abc123".length));
      return retrievedNumber;
    } catch(error) {
      app.router.push("/mytasks")
    }
  })
}

