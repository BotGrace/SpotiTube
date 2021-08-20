
const Util = new require('./util');
const fetch = require("node-fetch");
const SpotifyWebApi = require('spotify-web-api-node');

/**
 * Converts Spotify To YT with the help of LavaLink
 */

class SpotiTube {
  /**
   * @description The options that SpotiTube will use to convert and link with lavalink.
   * 
   * @param {Object} options The Options Object
   * @param {Boolean} [options.debug=false] If to show console log debugs. (Gets spammy!)
   * @param {Object} options.spotify The Object for Spotify
   * @param {String} options.spotify.clientID Client ID of Spotify App
   * @param {String} options.spotify.secretKey Client ID of Spotify App
   * @param {String} [options.spotify.clientAccessToken=null] Client Access Token. This will automaticlly generate
   * @param {Number} [options.spotify.clientAccessExpire=null] Client Access Token Expire Time. This will automaticlly generate
   * @param {RegExp} [options.spotify.regex=/(https?:\/\/open\.spotify\.com\/(playlist|track)\/[a-zA-Z0-9]+|spotify:(playlist|track):[a-zA-Z0-9])/g] The regex to vaildate spotify Strings
   * @param {Object} options.lavalink The Object for LavaLink
   * @param {String} options.lavalink.url The lavalink url w/ http:// or https://
   * @param {String} options.lavalink.password Lavalink password 
   * @returns {Object}
   * 
   * @example
   * const STYT = new SpotiTube({
   *    debug: true,
   *    spotify: {
   *      clientID: 'CLIENTID',
   *      secretKey: 'SECRETKEY'
   *    },
   *    lavalink: {
   *      url: 'http://localhost:2869',
   *      password: 'password'
   *    }
   * })
   */
  constructor(options = {}) {
    this.options = Util.mergeDefault({
      debug: false,
      spotify: {
        clientID: null,
        secretKey: null,
        clientAccessToken: null,
        clientAccessExpire: null,
        regex: /(https?:\/\/open\.spotify\.com\/(playlist|track)\/[a-zA-Z0-9]+|spotify:(playlist|track):[a-zA-Z0-9])/g
      },
      lavalink: {
        url: null,
        password: null
      }
    }, options)

    this.supportedTypes = ['playlist', 'track'];

    // Check for correct strings
    if (!this.options.spotify.clientID || !this.options.spotify.secretKey) throw new Error('Missing Spotify Client ID Or Spotify Secrect Key');
    if (!this.options.lavalink.url || !this.options.lavalink.password) throw new Error('Missing Lava Link URL Or Lava Link Password');
    
    // Update URL to have URL refs
    this.options.lavalink.url = new URL(this.options.lavalink.url);

    // Load Creds
    this.spotifySearch = new SpotifyWebApi({
      clientId: this.options.spotify.clientID,
      clientSecret: this.options.spotify.secretKey
    });

    // Retrieve an access token.
    if (this.options.spotify.clientAccessToken && this.options.spotify.clientAccessExpire) this.initCreds({force: true, access_token: this.options.spotify.clientAccessToken, expires_in: this.options.spotify.clientAccessExpire})
    // else this.spotifySearch.clientCredentialsGrant().then(res => this.initCreds(res.body)).catch(e => console.log(e))

  }

  /**
   * @description Loads/Creates/Checks the auth token to the Spotify Web API.
   * 
   * @param {Object} settings The object of the data.
   * @param {String} settings.access_token The access token to use.
   * @param {String} [settings.token_type=Bearer] The token type.
   * @param {Number} settings.expires_in The time of when it will expire in seconds.
   * @returns {Object}
   */

  initCreds (settings = {}) {
    settings = Util.mergeDefault({
      access_token: null,
      token_type: "Bearer",
      expires_in: null,
      force: false
    }, settings)
    if ((!this.options.spotify.clientAccessExpire || !this.options.spotify.clientAccessExpire) && (!settings.access_token || !settings.expires_in) && !settings.force) {
      if (this.options.debug) console.log("There is no login detect and none were sent with function. Creating login and restarting function")
      return this.spotifySearch.clientCredentialsGrant().then(res => this.initCreds(res.body)).catch(e => console.log(e));
    } else if ((new Date(new Date().getTime() + (1000 * 120)) >= this.options.spotify.clientAccessExpire) && (!settings.access_token || !settings.expires_in) && !settings.force) {
      if (this.options.debug) console.log("Current access token is expires or is within the 2 min mark. Creating new login and restarting function");
      return this.spotifySearch.clientCredentialsGrant().then(res => this.initCreds(res.body)).catch(e => console.log(e));
    } else if (settings.access_token || settings.expires_in) {
      this.spotifySearch.setAccessToken(settings.access_token)
      this.options.spotify.clientAccessToken = settings.access_token;
      this.options.spotify.clientAccessExpire = new Date(new Date().getTime() + (1000 * settings.expires_in));
      if (this.options.debug) console.log(`Added Access token & Expire Time (${this.options.spotify.clientAccessExpire.getTime()})`);
      return this.spotifySearch
    } else {
      return this.spotifySearch
    }
  }
  
  /**
   * @description Validate that the URL is a Spotify URL
   * 
   * @param {Url} url The URL of the Spotify Track Or Playlist
   * @returns {Boolean}
   * 
   * @example
   * (async () => {
   *    const result = await STYT.validateURL('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   *    console.log(result)
   * })();
   * 
   * @example
   * (async () => {
   *    const result = await STYT.validateURL('https://open.spotify.com/playlist/5B30UzmQQ6exwcZPwA8tbF?si=9df28e96ebf34267');
   *    console.log(result)
   * })();
   * 
   * @example
   * (async () => {
   *    const result = await STYT.validateURL('spotify:track:4aDSp2TuP7OSPvN9wrwcs5');
   *    console.log(result)
   * })();
   * 
   * @example
   * (async () => {
   *    const result = await STYT.validateURL('spotify:playlist:5B30UzmQQ6exwcZPwA8tbF');
   *    console.log(result);
   * })();
   */
  async validateURL (url) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (typeof url !== 'string') return false;
    if (this.options.spotify.regex.test(url)) {
      let parsedURL = {}
      try {
        parsedURL = require('spotify-uri').parse(url);
        if (!this.supportedTypes.includes(parsedURL.type)) return false;
        if (!parsedURL) return false;
        return true;
      } catch (e) {
        return false;
      }
    } else return false;
  }

  /**
   * @description Get info like type, name, and authors on the given url.
   * 
   * @param {URL} url The url you want to check.
   * @returns {Object}
   * 
   * @example
   * (async () => {
   *    const result = await STYT.getInfo('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   *    console.log(result);
   * })();
   */
  async getInfo(url) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!') ;
    let data = await require('spotify-url-info').getData(url);
    if (this.options.debug) console.log(`${url} = ${data.type} from getInfo`)
    return data;
  }

  /**
   * @description Gets the data off a playlist.
   * 
   * @param {String} id The url you want to check.
   * @param {Object} options Addtional options to add
   * @param {Number} [options.offset=0] How many tracks to skip
   * @param {Number} [options.limit=100] How many tracks to skip (100 Max with 0 Min)
   * @returns {Object}
   * @private
   */

   async getPlaylist (id, options = {}) {
    if (!id) throw new Error("Missing playlist ID")
    options = Util.mergeDefault({
      offset: 0,
      limit: 100
    }, options)
    await this.initCreds(); // Make sure creds are correct
    let data = await this.spotifySearch.getPlaylistTracks(id, {offset: options.offset, limit: options.limit}) || null;
    return data?.body || null
  }


  /**
   * @description Converts the spotify url(s) to a youtube result.
   * The Longer the playlist on spotify the longer it will take
   * 
   * @param {URL} url The url you want to convert.
   * @param {Number} [limit=Infinity] Limit how many songs we should convert. Use Infinity to allow the entire playlist, but the bigger the playlist the longer it will take to convert
   * @param {Boolean} [failedLimit=true] Let failed song searches include in the overall limit checks.
   * @returns {Object}
   * 
   * @example
   * (async () => {
   *     const result = await STYT.convert('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas', 200, true);
   *     console.log(result);
   * })();
   * 
   * @example
   * (async () => {
   *     const result = await STYT.convert('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas', Infinity, true); // Infinity will allow you to get all results
   *     console.log(result);
   * })();
   * 
   * @example
   * (async () => {
   *     const result = await STYT.convert('spotify:playlist:5SRG4654V94q7ao2X1hUU1', Infinity, true); // Infinity will allow you to get all results
   *     console.log(result);
   * })();
   * 
   * @example
   * (async () => {
   *     const result = await STYT.convert('spotify:track:4aDSp2TuP7OSPvN9wrwcs5', Infinity, true); // Infinity will allow you to get all results
   *     console.log(result);
   * })();
   */

  async convert(url, limit = 10, failedLimit = true) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!');
    await this.initCreds() // Make sure creds are correct
    if (!limit || limit < 1) limit = 10
    if (failedLimit !== false && failedLimit !== true) failedLimit = false    
    if (this.options.debug) console.log(`Getting ${url} with limit of ${limit} with ${failedLimit ? 'failed searches being included with limit' : 'failed searches not being included with limit'}`)

    let getInfo = await this.getInfo(url);

    if (this.options.debug) console.log(`${url} = ${getInfo.type} in convert`)

    if (!this.supportedTypes.includes(getInfo.type)) throw new Error(`${getInfo.type} is not a support format only ${this.supportedTypes.join()}`);

    if (getInfo.type === "track") {
      // track
      if (this.options.debug) console.log(`${url} is an ${getInfo.type} so limits will not work on this`)
      let result;
      try {
        result = await this.searchLavaLink(`${getInfo.name} ${getInfo.artists.map(x => x.name).join(' ')}`)
        if (this.options.debug) console.log(`${url} => ${result.uri}`)
      } catch (error) {
        result = null;
        if (this.options.debug) console.log(`${url} was not found`)
        console.log(error)
      }
      return {
        songs: {
          failed: !result ? [`${getInfo?.external_urls?.spotify || getInfo.uri}`] : [],
          completed: result ? [{
            url: result.uri,
            info: result
          }] : []
        },
        info: getInfo,
        limit: limit,
        converted: {
          failed: !result ? 1 : 0,
          completed: result ? 1 : 0,
          total: 1
        }
      }
    } else if (getInfo.type === "playlist") {
      // playlist
      let data = await this.getPlaylist(getInfo.id);
      let tracks = [];
      for (const song of data.items) {
        if (tracks.length >= limit) break;
        else tracks.push(song)
      }
      let next = data?.next ? true : false;
      while (next === true && (tracks.length < limit)) {
        let data2 = await this.getPlaylist(getInfo.id, {offset: tracks.length, limit: (data.total - tracks.length) >= 100 ? 100 : data.total - tracks.length })
        for (const song of data2.items) {
          if (tracks.length >= limit) break;
          tracks.push(song)
        }
        if (tracks.length >= limit) next = false;
        else next = data2?.next ? true : false        
      }
      if (this.options.debug) console.log(`Gathered a total of ${tracks.length} with a limitter set to ${limit}`)
      var songs = [];
      var failed = [];
      for (let song of tracks) {
        song = song.track
        if ((failedLimit ? failed.length + songs.length : songs.length) >= limit) break;
        if (this.options.debug) console.log(`${url} Current searches: ${(failedLimit ? failed.length + songs.length : songs.length)} w/ limit of ${limit}.`)
        let result;
        try {
          result = await this.searchLavaLink(`${song.name} ${song.artists.map(x => x.name).join(' ')}`)
          if (this.options.debug) console.log(`${song?.external_urls?.spotify || song.uri} => ${result.uri}`)
        } catch (error) {
          result = null;
          if (this.options.debug) console.log(`${song?.external_urls?.spotify || song.uri} was not found`)
          console.log(error)
        }
        if (!result) failed.push(song?.external_urls?.spotify || song.uri)
        else songs.push({
          url: result.uri,
          info: result
        })
      }
      if (this.options.debug) console.log(`${getInfo?.external_urls?.spotify || getInfo.uri} was converted to ${songs.length} with ${failed?.length} with limit ${limit}`)
      return {
        songs: {
          failed: failed,
          completed: songs
        },
        info: {...getInfo, tracks: tracks.map(g => g.track.id) || []},
        limit: limit,
        converted: {
          failed: failed?.length || 0,
          completed: songs?.length || 0,
          total: (failed?.length + songs?.length) || 0
        }
      }
    } else throw new Error(`${getInfo.type} is not a support format only ${this.supportedTypes.join()}`)
  }

  /**
   * @description Search on lavalink.
   * 
   * @param {String} query The search query to send to lavalink.
   * @returns {Object}
   * 
   * @example
   * (async () => {
   *    const result = await STYT.search('say something');
   *    console.log(result);
   * })();
   */

  searchLavaLink (query) {
    if (!query) throw new Error("Missing Search")
    if (!this.options.lavalink.url || !this.options.lavalink.password) throw new Error('Missing Lava Link URL Or Lava Link Password');

    let searchRequest = new URL(this.options.lavalink.url.href + 'loadtracks');
    searchRequest.searchParams.append("identifier", 'ytsearch:' + query)
    return fetch(searchRequest.toString(), { headers: { Authorization: this.options.lavalink.password } })
      .then(res => res.json())
      .then(data => {
        if (data?.error) throw new Error(data?.error || "Probs 404");
        if (!data?.tracks || data?.tracks?.length <= 0) return null;
        else return data.tracks[0]?.info || null
      })
      .catch(err => {
        console.error(err);
        return null;
      });
  }

}

module.exports = SpotiTube
