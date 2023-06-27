import EventEmitter2 from 'eventemitter2'
import collectEvents from '../lib/collect-events.js'

async function init () {
  const { _, getConfig } = this.bajo.helper
  const opts = _.pick(getConfig('bajoEmitter'), ['maxListeners', 'verboseMemoryLeak', 'ignoreErrors'])
  opts.wildcard = true
  opts.delimiter = '.'
  this.bajoEmitter.instance = new EventEmitter2(opts)
  await collectEvents.call(this)
}

export default init
