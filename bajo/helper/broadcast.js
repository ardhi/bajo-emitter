/**
 * Emit an event. Shortcut to ```this.bajo.event.emit()``` function
 *
 * @memberof module:helper
 * @instance
 * @async
 * @param {string} name - Event name
 * @param {Object} params - Event parameters/arguments
 */

function broadcast (msg, meta) {
  this.bajoEmitter.instance.emit('bajoEmitter.broadcastPool', msg, meta)
}

export default broadcast
