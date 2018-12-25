const bitcoinMessage = require('bitcoinjs-message');

/* Utility method to validate if a given signature is valid and 
* owned by the given address */
exports.verifyMessageSignature = function(message, address, signature) {

    let isValid = bitcoinMessage.verify(message, address, signature);

    console.log("Signature " + signature + " created by "+ address + " is " + isValid)

    return isValid;
};