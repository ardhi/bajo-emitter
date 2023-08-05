const broadcastPool = {
  level: 1,
  handler: async function onBroadcastPool ({ msg, from, to }) {
    const { addressSplit } = this.bajoEmitter.helper
    const { importPkg } = this.bajo.helper
    const { get, isFunction, find } = await importPkg('lodash-es')
    const pool = find(this.bajoEmitter.broadcastPools, { name: to })
    if (!(pool.from.includes(from) || !pool.from)) return
    for (const t of pool.to) {
      const { transport } = addressSplit(t)
      const handler = get(this, `${transport}.helper.send`)
      if (!isFunction(handler)) continue
      await handler(msg, { from, to: t })
    }
  }
}

export default broadcastPool
