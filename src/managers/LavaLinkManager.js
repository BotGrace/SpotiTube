const Util = require("../util");
const Lavalink = require("../structures/LavaLink");

/**
 * The Manager that will manage Lavalink.
 * @class LavaLinkManager
*/

class LavaLinkManager {
  /**
   * @description The Manager that will manage Lavalink.
   * 
   * @param {Object[]} nodes Array of Lavalink nodes to initially connect to
   * @param {String} nodes.url Lavalink node url with prefix like, ex: http://
   * @param {String} nodes.password Lavalink node password
   * @param {String} nodes.name Lavalink node name
  */
  constructor(options = []) {
    /**
     * The list of lavalinks to be used
     * @type {Map<string, LavaLink>}
     */
    this.nodes = new Map();
    if (options.length > 0) options.forEach((item) => this.addNode(item));
  }

  /**
   * @description Add a node to use.
   * @memberof LavaLinkManager
   * 
   * @param {Object} nodes The Object Lavalink nodes to initially connect to
   * @param {String} nodes.url Lavalink node url with prefix like, ex: http://
   * @param {String} nodes.password Lavalink node password
   * @param {String} [nodes.name] Lavalink node name
   * @returns {Lavalink[]}
   * 
   * @example
   * lavalinks.addNode({
   *    url: 'http://localhost:2869',
   *    password: 'password'
   * });
   */

  addNode(node = {}) {
    node = new Lavalink(Util.mergeDefault({
      url: node.url,
      password: node.password,
      name: node.name
    }, node))
    this.nodes.set(node.name, node)
    return this.nodes
  }

  /**
   * @description Removes a node.
   * @memberof LavaLinkManager
   * 
   * @param {String} Name The name of the node
   * @returns {Boolean} If the node was deleted or not
   * 
   * @example
   * lavalinks.delNode("name");
   */

   delName(name) {
    if (!name) throw new Error("No Name Given");
    const node = this.nodes.get(name);
    if (!node) return false;
    this.nodes.delete(key);
    return !this.nodes.has(name)
  }

  /**
   * Gets the total load being put on the LavaLinks
   * @type {Number}
   * @memberof LavaLinkManager
   */

  get load () {
    return [...this.nodes.values()].map(g => g.load || 0).reduce((a, b) => a + b, 0)
  }

   /**
   * @description Search for the best lavalink node to search on based of load & if it errored or not.
   * @memberof LavaLinkManager
   * 
   * @returns {Lavalink}
   * 
   * @example
   * (async () => {
   *    const node = await lavalinks.getBestNode();
   *    console.log(node);
   * })();
   */

  async getBestNode() {
    if (!this.nodes.size) throw new Error('No nodes existing');
    const node = [...this.nodes.values()].filter(g => !g.error).sort((a, b) => a.load - b.load)
    .shift();
    if (!node) throw new Error('No nodes existing');
    return node
  }


}

module.exports = LavaLinkManager