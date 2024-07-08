import EventEmitter2 from 'eventemitter2'
import collectEvents from '../lib/collect-events.js'
import handler from '../lib/collect-broadcast-pools.js'

async function init () {
  const { pick } = this.app.bajo.helper._
  const { buildCollections } = this.app.bajo.helper
  this.broadcastPools = await buildCollections({ ns: this.name, handler, container: 'broadcastPools', dupChecks: ['name'] })
  const opts = pick(this.config, ['maxListeners', 'verboseMemoryLeak', 'ignoreErrors'])
  opts.wildcard = true
  opts.delimiter = '.'
  this.instance = new EventEmitter2(opts)
  await collectEvents.call(this)
}

export default init
