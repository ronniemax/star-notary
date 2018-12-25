/* ===== Signature Validation Response Class ===============================
|  This is used to construct the view for star lookup API responses.|
|  ======================================================================*/

class StarLookupResponse {
	
	constructor(hash,height,address,ra,dec,story,storyDecoded,time,previousBlockHash){
		
		this.hash = hash,
	 
            this.height = height,

            this.body = {

                  address : address,

                  star : {
                        ra : ra,

                        dec: dec,

                        story : story,

                        storyDecoded : storyDecoded
                  },


            },

            this.time = time,

            this.previousBlockHash = previousBlockHash

            };
      }

module.exports.StarLookupResponse = StarLookupResponse;