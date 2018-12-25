/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

// Importing the module 'level'
const level = require('level');

// Declaring the folder path that store the data
const chainDB = './chaindata';

// Declaring a class
class LevelSandbox {

    // Declaring the class constructor
    constructor() {

        this.db = level(chainDB);

    }
  
  	// Get data from levelDB with key (Promise)
  	getLevelDBData(key){

        let self = this; // because we are returning a promise we will need this to be able to reference 'this' inside the Promise constructor

        return new Promise(function(resolve, reject) {

            self.db.get(key, (err, value) => {

                if(err){

                    if (err.type == 'NotFoundError') {

                        resolve(undefined);

                    }else {

                        console.log('Block ' + key + ' get failed', err);

                        reject(err);
                    }

                }else {

                    console.log(value)

                    resolve(value);
                }
            });
        });
    }
  
  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        
        let self = this;
        
        return new Promise(function(resolve, reject) {
        
            self.db.put(key, value, function(err) {
        
                if (err) {
        
                    console.log('Block ' + key + ' submission failed', err);
        
                    reject(err);
                }

                console.log("Inserted Bock# "+key+" into DB.")
        
                resolve(value);
            });
        });
    }
  
  	/**
     * DB utility method that calculates the total number records in the blockchain 
     */
    getBlocksCount() {
        
        let self = this;

        return new Promise(function(resolve, reject) {

            let count = -1;
            
            self.db.createReadStream()
            
            .on('data', function(data) {
                
                count++;
            })
            
            .on('error', function (err) {
            
                console.error("Error occured while calculating block count "+err)

                reject(err)
            })
            
            .on('close', function () {
            
                resolve(count);
            });
        });

        
      }

    /*
    * DB utility method that looksup blocks that match a given hash */    
    getBlockByHash(hash) {
    
        let self = this;
    
        let block = null;
    
        return new Promise(function(resolve, reject){
    
            self.db.createReadStream()
    
            .on('data', function (data) {

                let blockObject = JSON.parse(data.value);
                
                if (blockObject.hash === hash) {
    
                    block = blockObject
                }
            })
    
            .on('error', function (err) {
               
                reject(err)
            })
            .on('close', function () {
               
                resolve(block);
            });
        });
    }

    /*
    * DB utility method that looksup blocks that match a given address */
    getBlockByAddress(address) {
    
        let self = this;
    
        let stars = [];
    
        return new Promise(function(resolve, reject){
    
            self.db.createReadStream()
    
            .on('data', function (data) {

                let block = JSON.parse(data.value);

                if(block.body.address === address){
            
                    stars.push(block);
                }
            })
    
            .on('error', function (err) {
               
                reject(err)
            })
            .on('close', function () {

                resolve(stars);
            });
        });
    }
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;