
const Util = new require('./util')
const spotifySearch = require('@ksolo/spotify-search');
const { getTracks, getData } = require('spotify-url-info');
const spotifyURI = require('spotify-uri');
const fetch = require("node-fetch");

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
    spotifySearch.setCredentials(this.options.spotify.clientID, this.options.spotify.secretKey);

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
        parsedURL = spotifyURI.parse(url);
        if (!supportedTypes.includes(parsedURL.type)) return false;
        if (!parsedURL) return false;
        return true;
      } catch (e) {
        return false;
      }
    } else return false;
  }

  /**
   * @description Checks whether the url is a track or playlist.
   * 
   * @param {URL} url The url you want to check.
   * @returns {String}
   * 
   * @example
   * (async () => {
   *    const result = await STYT.isisTrackOrPlaylist('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   *    console.log(result); // Either "track" or "playlist"
   * })();
   */
  async isTrackOrPlaylist(url) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!') ;
    let data = await getData(url);
    if (this.options.debug) console.log(`${url} = ${data.type}`)
    return data.type;
  }

  /**
   * @description Converts the spotify url(s) to a youtube result.
   * 
   * @param {URL} url The url you want to convert.
   * @param {Number} [limit=Infinity] Limit how many songs we should convert. The bigger the number the longer the process might take.
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
   */

  async convert(url, limit = Infinity, failedLimit = true) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!');
    if (!limit || limit < 1) limit = Infinity
    if (failedLimit !== false && failedLimit !== true) failedLimit = false

    if (this.options.debug) console.log(`Getting ${url} with limit of ${limit} with ${failedLimit ? 'failed searches being included with limit' : 'failed searches not being included with limit'}`)

    let getSpotifyData = await getData(url);
    if (this.options.debug) console.log(`${url} = ${getSpotifyData.type}`)

    if (!this.supportedTypes.includes(getSpotifyData.type)) throw new Error(`${getSpotifyData.type} is not a support format only ${this.supportedTypes.join()}`);

    if (getSpotifyData.type === "track") {
        if (this.options.debug) console.log(`${url} is an ${getSpotifyData.type} so limits will not work on this`)
        let result;
        try {
          result = await this.search(`${getSpotifyData.name} ${getSpotifyData.artists.map(x => x.name).join(' ')}`)
          if (this.options.debug) console.log(`${url} => ${result.uri}`)
        } catch (error) {
          result = null;
          if (this.options.debug) console.log(`${url} was not found`)
          console.log(error)
        }
        return {
          songs: {
            failed: !result ? [`${getSpotifyData?.external_urls?.spotify || getSpotifyData.uri}`] : [],
            completed: result ? [{
              url: result.uri,
              info: result
            }] : []
          },
          info: getSpotifyData,
          limit: limit,
          converted: !result ? 0 : 1
        }
    } else {
      let tracks = await getTracks(url);
      var songs = [];
      var failed = [];
      for (const song of tracks) {
        if ((failedLimit ? failed.length + songs.length : songs.length) >= limit) break;
        if (this.options.debug) console.log(`${url} Current searches: ${(failedLimit ? failed.length + songs.length : songs.length)} w/ limit of ${limit}.`)

        let result;
        try {
          result = await this.search(`${song.name} ${song.artists.map(x => x.name).join(' ')}`)
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
      if (this.options.debug) console.log(`${getSpotifyData?.external_urls?.spotify || getSpotifyData.uri} was converted to ${songs.length} with ${failed.songs} with limit ${limit}`)
      return {
        songs: {
          failed: failed,
          completed: songs
        },
        info: getSpotifyData,
        limit: limit,
        converted: {
          failed: failed?.length || 0,
          completed: songs?.length || 0,
          total: (failed?.length + songs?.length) || 0
        }
      }
    }

  }

  /**
   * @description Search on lavalink.
   * 
   * @param {String} search The search query to send to lavalink.
   * @returns {Object}
   * 
   * @example
   * (async () => {
   *    const result = await STYT.search('say something');
   *    console.log(result);
   * })();
   */

  search (search) {
    if (!search) throw new Error("Missing Search")
    if (!this.options.lavalink.url || !this.options.lavalink.password) throw new Error('Missing Lava Link URL Or Lava Link Password');

    let searchRequest = new URL(this.options.lavalink.url.href + 'loadtracks');
    searchRequest.searchParams.append("identifier", 'ytsearch:' + search)
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
