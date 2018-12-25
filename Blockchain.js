/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');

const LevelSandbox = require('./LevelSandbox.js');

const Block = require('./Block.js');

class Blockchain {

    constructor() {
       
        console.log("Initializng Blockchain...")
        
        this.db = new LevelSandbox.LevelSandbox();

        console.log("Local LevelDB warmed up...")

        //If no blocks already exist then create Genesis Block
        this.getBlockHeight().then( (blockHeight) => {
            
            if(blockHeight < 0){
                
                console.log("No existing blocks found in local DB. Creating genesis block.")

                this.addBlock(this.generateGenesisBlock()).then(() => {console.log("Genesis Block Created Successfully")})
   
            }
        }).catch((err) => { 
            
            console.error("An error occured in getBlockHeight(): "+err);
        });

        // This is a mempool that will store validation requests for a certain time period
        this.mempool = {};
        
        console.log("Mempool has been initialized");
    }


    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        
        let body = {
            address: "0",
            star: {
                  ra: "0",
                  dec: "0",
                  mag: "0",
                  cen: "0",
                  story: ""
                  }
    };

        return new Block.Block(body);
    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    async getBlockHeight() {
        
        return await this.db.getBlocksCount();
    }

    // Add new block
    async addBlock(newBlock) {
        
        console.log("Adding new block");

        // Block height
        let previousBlockHeight = parseInt(await this.getBlockHeight())

        newBlock.height = previousBlockHeight + 1;

        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);

        console.log("New Block Timestamp: "+newBlock.time);
    
        // previous block hash
        if(newBlock.height > 0){
            
            console.log("Need to add previous hash")
            
            let previousBlock = await this.getBlock(previousBlockHeight);

            console.log(previousBlock);

            newBlock.previousBlockHash = previousBlock.hash;

            console.log("New Block PreviousBlockHash: "+newBlock.previousBlockHash);
        }
    
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        console.log("New Block Hash: "+newBlock.hash);
    
        // Adding block object to chain
        await this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
    }

    // Get Block By Height
    async getBlock(blockHeight) {
        
        return JSON.parse(await this.db.getLevelDBData(blockHeight))
    }

    // Get Block By hash
    async getBlockByHash(hash) {

        return await this.db.getBlockByHash(hash)
    }

    // Get Block By address
    async getBlockByAddress(address) {
        
        return await this.db.getBlockByAddress(address)
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(blockHeight) {
        
        // get block object
        let block = await this.getBlock(blockHeight);
    
        // get block hash
        let blockHash = block.hash;
    
        // remove block hash to test block integrity
        block.hash = '';
    
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
    
        // Compare
        if (blockHash===validBlockHash) {
            
            return true;
        } 
        else {
    
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
    
            return false;
        }
    }

    // Validate Blockchain
    async validateChain() {
        
        let errorLog = [];
        
        let currentBlockHeight = await this.getBlockHeight();
        
        for (var i = 0; i <= currentBlockHeight; i++) {
        
            // validate block

            let isBlockValid = await this.validateBlock(i);

            if (!isBlockValid)errorLog.push(i);
        
            // compare blocks hash link
           
            let blockHash = await this.getBlock(i).hash;
          
            let previousHash = await this.getBlock(i+1).previousBlockHash;
          
            if (blockHash!==previousHash) {
          
                errorLog.push(i);
          }
        }
        
        if (errorLog.length>0) {
        
            console.log('Block errors = ' + errorLog.length);
        
            console.log('Blocks: '+errorLog);
        } else {
          
            console.log('No errors detected');
        }
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        
        let self = this;
        
        return new Promise( (resolve, reject) => {
        
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        
                resolve(blockModified);
        
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
