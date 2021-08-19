
const Util = new require('./util')
const spotifySearch = require('@ksolo/spotify-search');
const { getTracks, getData } = require('spotify-url-info');
const spotifyURI = require('spotify-uri');
const fetch = require("node-fetch");

/**
 * Converts Spotify To YT with the help of LavaLink
 */

class SpotifyToYT {
  /**
   * @description The options that SpotifyToYT will use to convert and link with lavalink.
   * 
   * @param {Object} options The Options Object
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
   * const STYT = new SpotifyToYT({
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
    
    //Update URL to have URL refs
    this.options.lavalink.url = new URL(this.options.lavalink.url);

    // Load Creds
    spotifySearch.setCredentials(this.options.spotify.clientID, this.options.spotify.secretKey);

  }
  
  /**
   * @description Validate that the URL is an Spotify URL
   * 
   * @param {Url} url The URL of the Spotify Track Or Playlist
   * @returns {Boolean}
   * 
   * @example
   * 
   * const type = await STYT.validateURL('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   * console.log(type)
   * 
   * @example
   * 
   * const type = await STYT.validateURL('https://open.spotify.com/playlist/5B30UzmQQ6exwcZPwA8tbF?si=9df28e96ebf34267');
   * console.log(type)
   * 
   * @example
   * 
   * const type = await STYT.validateURL('spotify:track:4aDSp2TuP7OSPvN9wrwcs5');
   * console.log(type)
   * 
   * @example
   * 
   * const type = await STYT.validateURL('spotify:playlist:5B30UzmQQ6exwcZPwA8tbF');
   * console.log(type)
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
   * @description Checks wether the url is a track or playlist.
   * 
   * @param {any} url
   * @returns {String}
   * 
   * @example
   * 
   * const type = await STYT.isisTrackOrPlaylist('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   * console.log(type)
   */
  async isTrackOrPlaylist(url) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!') ;
    let data = await getData(url);
    return data.type;
  }

  /**
   * @description Converts the spotify url to youtube either.
   * 
   * @param {any} url
   * @returns {Object}
   * 
   * @example
   * 
   * const type = await STYT.convert('https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas');
   * console.log(type)
   */

  async convert(url) {
    if (!url) throw new Error('You did not specify the URL of Spotify!');
    if (!this.validateURL(url)) throw new Error('Url is not a match to the regex!');
    let getSpotifyData = await getData(url);

    if (!this.supportedTypes.includes(getSpotifyData.type)) throw new Error(`${getSpotifyData.type} is not a support format only ${this.supportedTypes.join()}`);

    if (getSpotifyData.type === "track") {
        let result;
        try {
          result = await this.search(`${getSpotifyData.name} ${getSpotifyData.artists.map(x => x.name).join(' ')}`)
        } catch (error) {
          result = null;
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
          info: getSpotifyData
        }
    } else {
      let tracks = await getTracks(url);
      var songs = [];
      var failed = [];
      for (const song of tracks) {
        let result;
        try {
          result = await this.search(`${song.name} ${song.artists.map(x => x.name).join(' ')}`)
        } catch (error) {
          result = null;
          console.log(error)
        }
        if (!result) failed.push(song?.external_urls?.spotify || song.uri)
        else songs.push({
          url: result.uri,
          info: result
        })
      }
      return {
        songs: {
          failed: failed,
          completed: songs
        },
        info: getSpotifyData
      }
    }

  }

  /**
   * @description Search on lavalink.
   * 
   * @param {String} search
   * @returns {Object}
   * 
   * @example
   * 
   * const result = await STYT.search('say something');
   * console.log(result)
   */

  search (search) {
    if (!search) throw new Error("Missing Search")
    if (!this.options.lavalink.url || !this.options.lavalink.password) throw new Error('Missing Lava Link URL Or Lava Link Password');

    let searchRequest = new URL(this.options.lavalink.url.href + 'loadtracks');
    searchRequest.searchParams.append("identifier", 'ytsearch:' + search)
    console.log(searchRequest.toString())
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

module.exports = SpotifyToYT