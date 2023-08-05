/**
 * Emit an event. Shortcut to ```this.bajo.event.emit()``` function
 *
 * @memberof module:helper
 * @instance
 * @async
 * @param {string} name - Event name
 * @param {Object} params - Event parameters/arguments
 */

async function broadcast ({ msg, from, to }) {
  const { importPkg, log } = this.bajo.helper
  const { find } = await importPkg('lodash-es')
  if (!find(this.bajoEmitter.broadcastPools, { name: to.name })) log.error('Unknown broadcast pool \'%s\'', to.name)
  else this.bajoEmitter.instance.emit('bajoEmitter.broadcastPool', { msg, from, to })
}

export default broadcast
