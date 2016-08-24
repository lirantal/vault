[![Build Status](https://travis-ci.org/lirantal/vault.svg?branch=master)](https://travis-ci.org/lirantal/vault)
[![Dependencies Status](https://david-dm.org/lirantal/vault.svg)](https://david-dm.org/lirantal/vault)

Vault is a Node.js API service that fetches files and checks for virus or malware, then pings back to a remote API with the scanned status.

High level flow diagram of how vault works:
![image](https://cloud.githubusercontent.com/assets/316371/17279958/f6f006d8-578b-11e6-8a4d-279d96206169.png)


## Prerequisites
The following are required to run vault.js:
* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).

Docker is not required but nice to have to quickly spin up a working version of Vault.


# Vault's Docker Architecture

The docker containers that vault spins up with are:
1. Vault - vault itself, spinning up as a REST API platform
2. MongoDB - the database to queue, and generally manage all vault entries
3. ClamAV - a ClamAV instance which has a TCP daemon for communication
4. Volume storage - the volume storage is a shared `/malware` directory
between the *Vault* container and the *ClamAV* container so that they can
easily share files for scanning without requiring any additional layer of
communication.


## Quick Install
Installing global npm tools:
```bash
$ npm install -g bower gulp
```
Then proceed to install packages required to run the project:

```bash
$ npm install
```

# Running and Using Vault

1. Clone the git repository
2. In the project's directory spin up the containers using docker-compose:

```bash
docker-compose up -d
```

3. Queue sample files for vault to scan using REST API calls:

```bash
curl --request POST \
  http://localhost:3000/api/vaultQueue \
  --header 'Content-Type: application/json' \
  --data '{ "url": "http://schemastore.org/img/api.png", "api": "http://localhost:3000/api/pingBack", "id": "1234" }'
```

The curl API instructs vault to:
* queue a virus scan for the file specified in the url file
`http://schemastore.org/img/api.png`
* vault downloads the `api.png` image file from the specified `url` field and
saves it to `/malware` directory
* clamav is triggered to scan this in the `/malware` directory
* once the scan has completed the file is removed and vault pings back the URL specified in the `api` field with the scan result

A JSON response will be sent back on queuing the data:
```json
{
  "__v":0,
  "_id":"57aef394ded12c2c00877fa9",
  "updated":"2016-08-13T10:16:52.829Z",
  "created":"2016-08-13T10:16:52.829Z",
  "scanStatus":false,
  "status":"",
  "id":"1234",
  "api":"http://localhost:3000/api/pingBack",
  "url":"http://schemastore.org/img/api.png"
}
```

Also, inspecting vault's internal debugging will reveal a lot of useful information:

```bash
info: POST /api/vaultQueue 201 102.015 ms - 245

Sat, 13 Aug 2016 10:16:53 GMT vault vault: 2016-08-13T10:16:53.633Z - processing document: 57aef394ded12c2c00877fa9
Sat, 13 Aug 2016 10:16:53 GMT vault downloader: initialized
Sat, 13 Aug 2016 10:16:53 GMT vault downloader: temporary directory set to: /malware/
Sat, 13 Aug 2016 10:16:53 GMT vault downloader: starting to download: http://schemastore.org/img/api.png
Sat, 13 Aug 2016 10:16:54 GMT vault downloader: successfully downloaded file: http://schemastore.org/img/api.png
Sat, 13 Aug 2016 10:16:54 GMT vault scanner: initialized
Sat, 13 Aug 2016 10:16:55 GMT vault scanner: scanning file: /malware/d8d8fcb227362b9da1da85c610bf3bbe50756cd2d58589a0a1fd343573e15aa03934e3d2bbda8cd3b21e7422073f0432
Sat, 13 Aug 2016 10:16:55 GMT vault scanner: safe file
Sat, 13 Aug 2016 10:16:55 GMT vault removeFile: attempting to remove file: /malware/d8d8fcb227362b9da1da85c610bf3bbe50756cd2d58589a0a1fd343573e15aa03934e3d2bbda8cd3b21e7422073f0432
info: POST /api/pingBack 404 3.308 ms - 26
Sat, 13 Aug 2016 10:16:55 GMT vault vault: successfully pinged api server http://localhost:3000/api/pingBack and processed 57aef394ded12c2c00877fa9
```

When the scan will finish the queued data will be updated in the MongoDB
database, and also JSON response will be sent back to the URL specified in the
`api` field.

An example response back payload with an infected file:

```json
{
	"url": "http://www.eicar.org/download/eicarcom2.zip",
  "api": "http://localhost:3000/api/test",
  "status": "alert",
  "msg": "Eicar-Test-Signature"
}
```

## Running Vault App

Running just the vault app is quite easy, but remember that it needs to connect to a MongoDB database, and a ClamAV server.
If you still wish to just try and run the Vault app continue as explained.

Execute the `gulp` command to run Vault's server

```
$ gulp
```

Vault should run on port 3000 with the *development* environment configuration, so in your browser just go to [http://localhost:3000](http://localhost:3000)


## Vault's framework
Vault is heavily built on-top of the popular and well-tested [MEAN.JS](https://github.com/meanjs/mean.git) framework.

For any tooling, development, or general project questions about the framework, structure and available commands refer to [MEAN.JS](https://github.com/meanjs/mean.git) main project's page. The README is a good start.


## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
