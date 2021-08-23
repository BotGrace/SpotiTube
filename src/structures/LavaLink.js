const Util = require("../util");
const uuid = require('uuid').v4;
const fetch = require("node-fetch");

/**
 * The Lavalink node.
 * @class LavaLink
 */
class LavaLink {
  /**
   * @description The Lavalink node.
   * 
   * @param {Object} node Array of Lavalink nodes to initially connect to
   * @param {String} node.url Lavalink node url with prefix like, ex: http://
   * @param {String} node.password Lavalink node password
   * @param {String} [node.name] Lavalink node name
  */
  constructor(node) {
    node = Util.mergeDefault({
      url: node?.url,
      password: node?.password,
      name: node?.name
    }, node);

    /**
     * The load this node is taking (The higher the number the more songs are being converted with it)
     * @type {Number}
     */
    this.load = 0;

    /**
     * If the node errored. (Bad passwords etc)
     * @type {Boolean|String}
     */
    this.error = false

    /**
     * The The URL of the song
     * @type {URL}
     */
    this.url = node?.url ? new URL(node?.url) : null || null;

    /**
     * The password of the node
     * @type {String}
     */
    this.password = node.password;

    /**
     * The name of the node
     * @type {String|uuid}
     */
    this.name = node.name || uuid();

    if (!this.password || !this.url) {
      this.error = "No password or url";
      throw new Error("No password or url")
    }

  }

  /**
   * @description Search on the lavalink.
   * @memberof LavaLink
   * 
   * @param {String} query The search query to send to lavalink.
   * @returns {Object}
   * 
   * @example
   * (async () => {
   *    const result = await lavalink.search('say something');
   *    console.log(result);
   * })();
   */

   search (query) {
    if (!query) throw new Error("Missing Search")
    if (!this.url || !this.password) {
      this.error = "No password or url";
      throw new Error("No password or url")
    };

    this.load++;

    let searchRequest = new URL(this.url.href + 'loadtracks');
    searchRequest.searchParams.append("identifier", 'ytsearch:' + query)
    return fetch(searchRequest.toString(), { headers: { Authorization: this.password } })
      .then(res => res.json())
      .then(data => {
        this.load--;
        if (data?.error) throw new Error(data?.error || "Probs 404");
        if (!data?.tracks || data?.tracks?.length <= 0 || !data) return null;
        else return {...data.tracks[0]?.info, track: data.tracks[0]?.track} || null
      })
      .catch(err => {
        this.load--;
        this.error = err
        console.error(err);
        return null;
      });
  }


}

module.exports = LavaLink