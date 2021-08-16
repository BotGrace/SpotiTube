/**
 * Converts Spotify To YT with the help of LavaLink
 * @author Gaeta 
 */

const Util = require("./util")
const supportedTypes = ["playlist", "track"];
const spotifySearch = require("@ksolo/spotify-search");
const { getTracks, getData } = require("spotify-url-info");
const spotifyURI = require("spotify-uri");
const request = require("request");

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
   * @param {String} options.lavalink.url Client ID of Spotify App
   * @returns {Object}
   * 
   * @example
   * const STYT = SpotifyToYT({
   *  spotify: {
   *    clientID: "CLIENTID",
   *    secretKey: "SECRETKEY"
   *  },
   *  lavalink: {
   *    url: "http://localhost:2869"
   *  }
   * })
   */
  constructor(options = {}) {
    super();
    this.options = Util.mergeDefault({
      spotify: {
        clientID: null,
        secretKey: null,
        regex: /(https?:\/\/open\.spotify\.com\/(playlist|track)\/[a-zA-Z0-9]+|spotify:(playlist|track):[a-zA-Z0-9])/g
      },
      lavalink: {
        url: null
      }
    }, options)
  }
  
  /**
   * @description Validate that the URL is an Spotify URL or Playlist  
   * 
   * @param {Url} url The URL of the Spotify Track Or Playlist
   * @returns {Boolean}
   * 
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
}

module.exports = SpotifyToYT