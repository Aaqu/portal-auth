/*
  basic config form
  https://dashboard.flowfuse.com/contributing/plugins/

  Auth socket.io more on
  https://socket.io/docs/v4/middlewares/#sending-credentials
  https://socket.io/docs/v4/server-socket-instance/#sockethandshake
*/

module.exports = function(RED) {
  RED.plugins.registerPlugin("node-red-dashboard-2-portal-auth", {

    // Tells Node-RED this is a Node-RED Dashboard 2.0 plugin
    type: "node-red-dashboard-2",

    // hooks - a collection of functions that will inject into Dashboard 2.0
    hooks: {
      /**
       * onSetup - called when the Dashboard 2.0 is instantiated
       * @param {object} RED - Node-RED runtime
       * @param {object} config - UI Base Node Configuration
       * @param {object} req - ExpressJS request object
       * @param {object} res - ExpressJS response object
       * @returns {object} - Setup object passed to the Client
       */
      onSetup: (RED, config, req, res) => {
        console.log(req.portal)
        return {
          // must ALWAYS return socketio.path if using this hook
          socketio: {
            path: `${config.path}/socket.io`,
            portal: req.portal
          },
        }
      },
      /**
       * onInput - called when a node receives a message
       * @param {object} msg - Node-RED msg object
       * @returns {object} - Returns Node-RED msg object
       */
      // onInput: (msg) => {
      //   // modify msg in anyway you like
      //   return msg
      // },
      /**
       * onAction - called when a D2.0 widget emits the `widget-action` event via SocketIO
       * @param {object} conn - SocketIO connection object
       * @param {object} id - Unique Node/Widget ID
       * @param {object} msg - Node-RED msg object
       * @returns {object} - Returns Node-RED msg object
       */
      // onAction: (conn, id, msg) => {
      //   // modify msg in anyway you like
      //   msg.myField = "Hello World"
      //   return msg
      // },
      /**
       * onChange - called when a D2.0 widget emits the `widget-change` event via SocketIO
       * @param {object} conn - SocketIO connection object
       * @param {object} id - Unique Node/Widget ID
       * @param {object} msg - Node-RED msg object
       * @returns {object} - Returns Node-RED msg object
       */
      // onChange: (conn, id, msg) => {
      //   // modify msg in anyway you like
      //   msg.myField = "Hello World"
      //   return msg
      // },
      /**
       * onLoad - called when a D2.0 widget emits the `widget-load` event via SocketIO
       * @param {object} conn - SocketIO connection object
       * @param {object} id - Unique Node/Widget ID
       * @param {object} msg - Node-RED msg object
       * @returns {object} - Returns Node-RED msg object
       */
      // onLoad: (conn, id, msg) => {
      //   // modify msg in anyway you like
      //   msg.myField = "Hello World"
      //   return msg
      // },
      /**
       * onAddConnectionCredentials - called when a D2.0 is about to send a message in Node-RED
       * @param {object} conn - SocketIO connection object
       * @param {object} msg - Node-RED msg object
       * @returns {object} - Returns Node-RED msg object
       */
      onAddConnectionCredentials: (conn, msg) => {
        msg._client = { portal: conn.handshake.portal || null}
        return msg
      },
      /**
       * onIsValidConnection - Checks whether, given a msg structure and Socket connection,
       * any _client data specified allows for this message to be sent, e.g.
       * if the msg._client.socketid is the same as the connection's ID
       * @param {object} conn - SocketIO connection object
       * @param {object} msg - Node-RED msg object
       * @returns {boolean} - Is a valid connection or not
       */
      onIsValidConnection: (conn, msg) => {
        if (msg._client?.portal.username) {
          // if socketId is specified, check that it matches the connection's ID
          return msg._client.portal.username === conn.handshake.portal.username
        }
        // if no specifics provided, then allow the message to be sent
        return true
      },
      /**
       * onCanSaveInStore - Checks whether, given a msg structure, the msg can be saved in the store
       * Saving into a store is generally a bad idea if we're dealing with messages only intended for
       * particular clients (e.g. a msg._client.socketId is specified)
       * @param {object} msg - Node-RED msg object
       * @returns {boolean} - Is okay to store this, or not
       */
      onCanSaveInStore: (msg) => {
        if (msg._client?.portal.username) {
          // if socketId is specified, then don't save in store
          return false
        }
        return true
      },

    }
  })
}