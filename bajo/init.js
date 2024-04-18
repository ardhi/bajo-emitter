import EventEmitter2 from 'eventemitter2'
import collectEvents from '../lib/collect-events.js'

async function handler ({ item }) {
  const { addressVerify } = this.bajoEmitter.helper
  const { error } = this.bajo.helper
  const { isString } = this.bajo.helper._
  for (const f of ['from', 'to']) {
    if (!item[f]) continue
    if (isString(item[f])) item[f] = [item[f]]
    for (const a of item[f]) {
      addressVerify(a, { skipConnectionCheck: item.skipConnectionCheck })
    }
  }
  if (!item.from || item.from.length === 0) throw error('A pool must have a \'from\' address')
}

async function init () {
  const { getConfig, buildCollections } = this.bajo.helper
  const { pick } = this.bajo.helper._
  const opts = pick(getConfig('bajoEmitter'), ['maxListeners', 'verboseMemoryLeak', 'ignoreErrors'])
  opts.wildcard = true
  opts.delimiter = '.'
  this.bajoEmitter.instance = new EventEmitter2(opts)
  this.bajoEmitter.broadcastPools = await buildCollections({ handler, container: 'broadcastPools', dupChecks: ['name'] })
  await collectEvents.call(this)
}

export default init
