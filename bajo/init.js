import EventEmitter2 from 'eventemitter2'
import collectEvents from '../lib/collect-events.js'

async function init () {
  const { importPkg, getConfig } = this.bajo.helper
  const { pick } = await importPkg('lodash-es')
  const opts = pick(getConfig('bajoEmitter'), ['maxListeners', 'verboseMemoryLeak', 'ignoreErrors'])
  opts.wildcard = true
  opts.delimiter = '.'
  this.bajoEmitter.instance = new EventEmitter2(opts)
  await collectEvents.call(this)
}

export default init
