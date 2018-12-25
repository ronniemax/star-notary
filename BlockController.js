const SHA256 = require('crypto-js/sha256')

const bodyParser = require('body-parser')

const hex2ascii = require('hex2ascii')

let jsonParser = bodyParser.json()


const BlockChain = require('./BlockChain.js')

const Block = require('./Block.js')

const Utility = require('./Utility.js')

const RequestValidationResponse = require('./RequestValidationResponse.js')

const SignatureValidationResponse = require('./SignatureValidationResponse.js')

const StarLookupResponse = require('./StarLookupResponse.js')

let myBlockChain = new BlockChain.Blockchain();

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        
        this.app = app;
        
        this.blocks = [];
        
        this.getBlockByIndex();
        
        this.postNewBlock();

        this.requestValidation();

        this.messageSignatureValidation();

        this.getBlockByHash();

        this.getBlocksByAddress();
    }


    

    /**
     * POST Endpoint to request validation for a given wallet 
     * 
     * address, url: "/requestValidation"
     */
    requestValidation(){

        this.app.post("/requestValidation", (req, res) => { 

            //Get the value associated with "address" field in JSON request
            let ownerAddress = req.body.address

            //Return 400 if no address found in request
            if (!ownerAddress) return res.status(400).send('The address field canot be empty')

            //Check if a previous validation request is already in the chain's mempool
            let requestValidationObject = myBlockChain.mempool["rv"+ownerAddress]

            //If already in mempool then update validation window value and return the same object
            if (requestValidationObject) {
                
                //Calculate new validation window time
                let time = new Date().getTime().toString().slice(0, -3);
                
                let timeElapsed = time - requestValidationObject.requestTimeStamp;
                
                let newValidationWindow = 300 - timeElapsed;
                
                requestValidationObject.validationWindow = newValidationWindow;
                
                //Update mempool with new validation window
                myBlockChain.mempool["rv"+ownerAddress] = requestValidationObject;

                //Prepare response object for API
                let requestValidationResponse = new RequestValidationResponse.RequestValidationResponse(ownerAddress)

                requestValidationResponse = myBlockChain.mempool["rv"+ownerAddress]
        
                return res.status(200)
                          .send(requestValidationResponse);
        
            }
        
            //If not in mempool, create a new RequestValidationResponse with default values 
            let requestValidationResponse = new RequestValidationResponse.RequestValidationResponse(ownerAddress)

            //Add the request to the mempool against user's address
            myBlockChain.mempool["rv"+ownerAddress] = requestValidationResponse

            //Set time out to delete request from mempool
            setTimeout(() => {
               
                delete myBlockChain.mempool["rv"+ownerAddress];
           
            }, requestValidationResponse.validationWindow * 1000);
        
            return res.status(200)
                      .send(requestValidationResponse);
        });

    }


    /**
     * POST Endpoint to validates message signature with JSON response. 
     * 
     * url: "/message-signature/validate"
     */
    messageSignatureValidation(){

        this.app.post("/message-signature/validate", (req, res) => { 

            //Get the value associated with "address" field in JSON request
            let walletAddress = req.body.address

            //Return 400 if no address found in request
            if (!walletAddress) return res.status(400).send('The address field canot be empty')

            //Get the value associated with "signature" field in JSON request
            let messageSignature = req.body.signature

            //Return 400 if no signature found in request
            if (!messageSignature) return res.status(400).send('The signature field canot be empty')

            //Check if request validation object already in mempool
            let requestValidationObject = myBlockChain.mempool["rv"+walletAddress]

            //If requestValidation object not present return 403
            if (!requestValidationObject) return res.status(403).send('An active validation request cannot be found for given address. Please submit a /requestValidation request first and try again.')

            let isMessageSignatureValid = false

            try{
                
                isMessageSignatureValid = Utility.verifyMessageSignature(requestValidationObject.message, walletAddress, messageSignature)
            }
            catch(err){
                
                console.error(err)

                return res.status(500).send("An internal server error occured: "+err.message)
             }

            if(isMessageSignatureValid){

                //Calculate new validation window time
                let time = new Date().getTime().toString().slice(0, -3);
                
                let timeElapsed = time - requestValidationObject.requestTimeStamp;
                
                let newValidationWindow = 300 - timeElapsed;

                if(newValidationWindow < 0){

                    return res.status(403).send('Validation window already expired. Request a new validation.')
                }
                
                //Create a new draft block with input data
                let signatureValidationResponse = new SignatureValidationResponse.SignatureValidationResponse(walletAddress, requestValidationObject.message, newValidationWindow)
                
                myBlockChain.mempool["sv"+walletAddress] = signatureValidationResponse

                delete myBlockChain.mempool["rv"+walletAddress]

                return res.status(200).send(signatureValidationResponse)
            
            }
                
            else{

                return res.status(403).send('Message signature validation failed! You are unauthorized.')

            }

        });
    }

    /**
     * GET Endpoint to retrieve a block by hash, url: "/stars/hash::blockHash"
     */
    getBlockByHash() {
        
        this.app.get("/stars/hash::blockHash", (req, res) => {

            myBlockChain.getBlockByHash(req.params.blockHash.toString()).then((block) => {
                
                let requestValidationResponse = new StarLookupResponse.StarLookupResponse(block.hash,block.height,block.body.address,block.body.star.ra,block.body.star.dec,block.body.star.story,hex2ascii(block.body.star.story),block.time,block.previousBlockHash)

                //Return the response object if found
                res.send(requestValidationResponse)
            
            }).catch((err) => { 
                
                //Return 400 is no data found
                return res.status(400).send('Requested hash not found!')
            
            }); 
        });
    }

    /**
     * GET Endpoint to retrieve a block by hash, url: "/api/block/:index"
     */
    getBlockByIndex() {
        
        this.app.get("/block/:index", (req, res) => {

            myBlockChain.getBlock(req.params.index).then((block) => {
                
                let requestValidationResponse = new StarLookupResponse.StarLookupResponse(block.hash,block.height,block.body.address,block.body.star.ra,block.body.star.dec,block.body.star.story,hex2ascii(block.body.star.story),block.time,block.previousBlockHash)

                //Return the response object if found
                res.send(requestValidationResponse)
            
            }).catch((err) => { 
                
                console.error(err)
                //Return 400 is no data found
                return res.status(400).send('Requested index not found!')
            
            }); 
        });
    }


    /**
     * GET Endpoint to retrieve blocks by wallet address, url: "/stars/address:address"
     */
    getBlocksByAddress() {
        
        this.app.get("/stars/address::address", (req, res) => {

            myBlockChain.getBlockByAddress(req.params.address.toString()).then((blocks) => {

                if(blocks.length === 0){
    
                    return res.status(400).send('No results found!')
                }

                let starLookupResults = [];
                
                for (let block of blocks) {
                    
                    starLookupResults.push(new StarLookupResponse.StarLookupResponse(block.hash,block.height,block.body.address,block.body.star.ra,block.body.star.dec,block.body.star.story,hex2ascii(block.body.star.story),block.time,block.previousBlockHash))
                }

                //Return the response object if found
                res.send(starLookupResults)
            
            }).catch((err) => { 
                
                console.error(err)
                //Return 400 is no data found
                return res.status(400).send('Requested address not found!')
            
            }); 
        });
    }

    /**
     * POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        
        this.app.post("/block",jsonParser,(req, res) => {

            //Fetch address from request
            let inputAddress = req.body.address;

            //Return 400 if no address found in input
            if (!inputAddress) return res.status(400).send('The input address canot be empty')

            //Check if request validation object already in mempool
            let mempoolObject = myBlockChain.mempool["sv"+inputAddress]

            //If address not in mempool return 403
            if (!mempoolObject) return res.status(403).send('An active signature verification cannot be found for given address. Please use  /message-signature/validate to complete verifications.')

            //Get the value associated with "star" field in JSON request
            let inputStarObject = req.body.star

            //Return 400 if no value found in input
            if (!inputStarObject) return res.status(400).send('The input star details cannot be empty')

            let inputStarDec = req.body.star.dec

            //Return 400 if no value found in input
            if (!inputStarDec) return res.status(400).send('The input star Dec value cannot be empty')

            let inputStarRa = req.body.star.ra

            //Return 400 if no value found in input
            if (!inputStarRa) return res.status(400).send('The input star Ra value cannot be empty')

            let inputStarStory = req.body.star.story
            
            //Return 400 if no value found in input
            if (!inputStarStory) return res.status(400).send('The input star story cannot be empty')

            //Chheck if story is more than 250 words
            if (inputStarStory.split(" ").length > 250) return res.status(400).send('Story cannot be more than 250 words')

            let hexStory = Buffer(inputStarStory).toString('hex')

            req.body.star.story = hexStory;

            console.log(req.body)

            //Create a new draft block with input data
            var newBlockToBeAdded = new Block.Block(req.body)
        
            //Insert block into blockchain
            myBlockChain.addBlock(newBlockToBeAdded).then(() => {

                //Delete request validation object from the pool
                delete myBlockChain.mempool["sv"+inputAddress];
                
                //Return Block as JSON
                res.send(newBlockToBeAdded)
            
            }).catch((err) => {

                console.error(err)
               
                //Return 500 if internal exception occurs
                return res.status(500).send('An internal server error occurred')
            });

            
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}