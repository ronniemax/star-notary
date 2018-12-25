/* ===== Signature Validation Response Class ===============================
|  This is used to construct the view for /message-signature/validate API response.|
|  ======================================================================*/

class SignatureValidationResponse {
	
	constructor(walletAddress, message, validationWindow){
		
		this.registerStar = true,
	 
		this.status = {
            
            address: walletAddress,
            
            requestTimeStamp: (new Date().getTime().toString().slice(0,-3)),
            
            message: message,
            
            validationWindow: validationWindow,
            
            messageSignature: true
         };
    
	}
}

module.exports.SignatureValidationResponse = SignatureValidationResponse;