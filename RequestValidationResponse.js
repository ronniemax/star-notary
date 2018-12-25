/* ===== Request Validation Response Class ===============================
|  This is used to construct the view for /requestValidation API response.|
|  ======================================================================*/


//Constants 
const VALIDATION_WINDOW_SECONDS = 300

const MESSAGE_FIELD_SUFFIX = "starRegistry"


class RequestValidationResponse {
	
	constructor(walletAddress){
		
		this.walletAddress = walletAddress,
	 
		this.requestTimeStamp = (new Date().getTime().toString().slice(0,-3)),
	 
		this.message = this.walletAddress+":"+this.requestTimeStamp+":"+MESSAGE_FIELD_SUFFIX
	 
		this.validationWindow = VALIDATION_WINDOW_SECONDS
	
	}
}

module.exports.RequestValidationResponse = RequestValidationResponse;