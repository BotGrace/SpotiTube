
# SpotiTube
### A Converter That Will Convert Your Spotify To YT with LavaLink.
[![Discord](https://img.shields.io/discord/469387242767646730?style=flat-square&logo=discord&logoColor=white)](https://discordapp.com/invite/GuGcuwdYwg)
![Github Stars](https://img.shields.io/github/stars/BotGrace/SpotiTube?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/BotGrace/SpotiTube?style=flat-square)
[![npm](https://img.shields.io/npm/v/spotitube?style=flat-square&maxAge=3600)](https://www.npmjs.com/package/spotitube)
[![npm downloads](https://img.shields.io/npm/dt/spotitube?style=flat-square&maxAge=3600)](https://www.npmjs.com/package/spotitube)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/spotitube?style=flat-square&maxAge=3600) 
![NPM](https://img.shields.io/npm/l/spotitube?style=flat-square&maxAge=3600)

> Created with ❤️ by the Grace Bot Dev Team _aka Spooder/Gaeta_!

## **WARNING**
Master branch is on **[v1.0.4-dev (Dev)](https://github.com/BotGrace/SpotiTube/tree/master)**! This almost a full rewrite from **[v1.0.3 (Stable)](https://github.com/BotGrace/SpotiTube/tree/v1.0.3)** branch! Please check the readme and the stable docs to understand v1.0.3!

## Features

✅ Stable

✅ Straightforward

✅ Works with Lavalink

✅ Works with any Spotify Link

✅ Works with Huge Spotify Playlist

✅ Can set a limit on results

## Installation
 
> NPM (Stable) => `npm install spotitube --save`

> Github (Dev) => `npm install botGrace/SpotiTube#master`

> Npm (Dev) => `npm install spotitube@dev`

## Documentation Site

> Stable => https://SpotiTube.git.gracebot.net/

> Dev => `git clone https://github.com/BotGrace/SpotiTube#master && cd ./SpotiTube && yarn install && yarn run docs:dev`

## Getting Lavalink

Download the latest binaries from the [CI server (DEV BRANCH) (Recommended)](https://ci.fredboat.com/viewType.html?buildTypeId=Lavalink_Build&branch_Lavalink=refs%2Fheads%2Fdev&tab=buildTypeStatusDiv&guest=1) or [CI server (Stable)](https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1)

Put an [application.yml](https://github.com/freyacodes/Lavalink/blob/master/LavalinkServer/application.yml.example) file in your working directory.

Run with `java -jar Lavalink.jar`

Docker images are available on the [Docker](https://hub.docker.com/r/fredboat/lavalink/) hub.

## Getting Redis (Optional)

Download the latest version of Redis Stable [Here](https://redis.io/download) and  Read the **[Redis Quick Start (Recommended)](https://redis.io/topics/quickstart)** to get started!

## Example Usage

#### Create SpotiTube instance w/o Redis
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

#### Create SpotiTube instance w/ Redis
```js
const STYT = new SpotiTube({
  spotify: {
    clientID: 'CLIENTID',
    secretKey: 'SECRETKEY'
  },
  lavalink: {
    url: 'http://localhost:2869',
    password: 'password'
  },
  redis: {
    host: "127.0.0.1",
    post: 6379,
    db: 0 // This is optional
  }
})
```

#### Convert Spotify To YT
```js
(async () => {
  const result = await STYT.convert('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas', 15);
  console.log(result);
})();
```

## To Do List

 - [X] Redis Cache System

## 🤝 Support
Contributions, issues, and feature requests are welcome! 

Give a ⭐️ if you like this project!