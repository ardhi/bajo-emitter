/**
 * Emit an event. Shortcut to ```this.bajo.event.emit()``` function
 *
 * @memberof module:helper
 * @instance
 * @async
 * @param {string} name - Event name
 * @param {Object} params - Event parameters/arguments
 */

async function broadcast ({ msg, from, to, subject }) {
  this.bajoEmitter.instance.emit('bajoEmitter.broadcastPool', { msg, from, to, subject })
}

export default broadcast
