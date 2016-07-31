[![Build Status](https://travis-ci.org/lirantal/vault.svg?branch=master)](https://travis-ci.org/lirantal/vault)
[![Dependencies Status](https://david-dm.org/lirantal/vault.svg)](https://david-dm.org/lirantal/vault)

Vault is a Node.js API service that fetches files and checks for virus or malware, then pings back to a remote API with the scanned status.

## Prerequisites
The following are required to run vault.js:
* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).

## Quick Install
Installing global npm tools:
```bash
$ npm install -g bower gulp
```

Then proceed to install packages required to run the project:

```bash
$ npm install
```

## Running Vault
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
