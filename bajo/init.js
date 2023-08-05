import EventEmitter2 from 'eventemitter2'
import collectEvents from '../lib/collect-events.js'

async function handler ({ item }) {
  const { addressVerify } = this.bajoEmitter.helper
  const { importPkg, error } = this.bajo.helper
  const { has, isString } = await importPkg('lodash-es')
  if (!has(item, 'name')) throw error('A pool must have a name')
  for (const f of ['from', 'to']) {
    if (!has(item, f)) throw error('A pool must have an %s address', f)
    if (isString(item[f])) item[f] = [item[f]]
    for (const a of item[f]) {
      await addressVerify(a)
    }
  }
}

async function init () {
  const { importPkg, getConfig, buildCollections } = this.bajo.helper
  const { pick } = await importPkg('lodash-es')
  const opts = pick(getConfig('bajoEmitter'), ['maxListeners', 'verboseMemoryLeak', 'ignoreErrors'])
  opts.wildcard = true
  opts.delimiter = '.'
  this.bajoEmitter.instance = new EventEmitter2(opts)
  this.bajoEmitter.broadcastPools = await buildCollections({ handler, container: 'broadcastPools', dupChecks: ['name', 'transport'] })
  await collectEvents.call(this)
}

export default init
