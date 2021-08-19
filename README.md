
## SpotiTube
### A Converter That Will Convert Your Spotify To YT with LavaLink.
[![Discord](https://img.shields.io/discord/469387242767646730?style=flat-square&logo=discord&logoColor=white)](https://discordapp.com/invite/GuGcuwdYwg)
![Github Stars](https://img.shields.io/github/stars/BotGrace/SpotiTube?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/BotGrace/SpotiTube?style=flat-square)
[![npm](https://img.shields.io/npm/v/spotitube?style=flat-square)](https://www.npmjs.com/package/spotitube)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/spotitube?style=flat-square) 
![NPM](https://img.shields.io/npm/l/spotitube?style=flat-square)

> Created by the Grace Bot Dev Team


### Features

✅ Stable

✅ Straightforward

✅ Works with Lavalink

✅ Works with any Spotify Link


### Installation
 
> NPM (Stable) => npm install SpotiTube --save

> Github (Dev) => npm install botGrace/SpotiTube#master

> Npm (Dev) => npm install SpotiTube@dev

### Documentation Site

> https://SpotiTube.git.gracebot.net/

### Getting Lavalink

Download the latest binaries from the [CI server (DEV BRANCH) (Recommended)](https://ci.fredboat.com/viewType.html?buildTypeId=Lavalink_Build&branch_Lavalink=refs%2Fheads%2Fdev&tab=buildTypeStatusDiv&guest=1) or [CI server Normal](https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1)

Put an [application.yml](https://github.com/freyacodes/Lavalink/blob/master/LavalinkServer/application.yml.example) file in your working directory.

Run with `java -jar Lavalink.jar`

Docker images are available on the [Docker](https://hub.docker.com/r/fredboat/lavalink/) hub.

### Example Usage

Create SpotiTube instance 
```js
const STYT = new SpotiTube({
  spotify: {
    clientID: 'CLIENTID',
    secretKey: 'SECRETKEY'
  },
  lavalink: {
    url: 'http://localhost:2869',
    password: 'password'
  }
})
```

Convert Spotify To YT
```js
(async () => {
  const result = await STYT.convert('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
  console.log(result);
})();
```