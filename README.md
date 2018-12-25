# Build a Private Blockchain Notary Service (Project 4)

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__ in the root directory to kick start express web server on *http://localhost:8000*.This will also initiate the blockchain with Genesis block added.


### Project Dependencies

The project has been build using Node *v10.14.2*  
```
- crypto-js@3.1.9-1
- body-parser@1.18.3
- express@4.16.4
- level@4.0.0
- hex2ascii@0.0.3
- bitcoinjs-lib@4.0.2
- bitcoinjs-message@2.0.0

```

## REST API Details

### 1. POST /requestValidation

Web API POST endpoint to validate request and respond with JSON response.

An example would be:

##### Request
```
Method: POST

Endpoint : http://localhost:8000/requestValidation

Body: { "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }

Content-Type: application/json
```

##### Response
```
Status Code: 200

{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544451269",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry",
    "validationWindow": 300
}
```

### 2. POST /message-signature/validate

Web API POST endpoint validates message signature and responds with a JSON response.

An example would be:

##### Request
```
Method: POST

Endpoint : http://localhost:8000/message-signature/validate

Body: 
{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}

Content-Type: application/json
```

##### Response
```
Status Code: 200

{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1544454641",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544454641:starRegistry",
        "validationWindow": 193,
        "messageSignature": true
    }
}
```

### 3. POST /block

Web API POST endpoint with JSON response that submits the Star information to be saved in the Blockchain. 

##### Request
```
Method: POST

Endpoint: http://localhost:8000/block

Body: 
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}

Content-Type: application/json
```


##### Response
```
Status Code: 200

{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```

### 4. GET /block/{BlockHeight}

This API can be used to fetch a given Block information from the Blockchain by passing in its block height. 

An example would be:

##### Request
```
Method: GET

Endpoint : http://localhost:8000/block/1

```

##### Response
```
Status Code: 200

{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### 5. GET /stars/hash:[HASH]

This API can be used to fetch a given Block information from the Blockchain by passing in its block hash. 

An example would be:

##### Request
```
Method: GET

Endpoint : http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f

```

##### Response
```
Status Code: 200

{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### 6. GET /stars/address:[ADDRESS]

This API can be used to fetch all Blocks from the Blockchain which were involved with a given wallet address

An example would be:

##### Request
```
Method: GET

Endpoint : http://localhost:8000/stars/address:1FQ31QZriobgGozoKpGiWKY7n2u5o

```

##### Response
```
Status Code: 200

{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "1FQ31QZriobgGozoKpGiWKY7n2u5o",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```


