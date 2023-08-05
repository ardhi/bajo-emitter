const broadcastPool = {
  level: 1,
  handler: async function onBroadcastPool ({ msg, from, to }) {
    const { callHelperOrHandler } = this.bajo.helper
    const { addressSplit } = this.bajoEmitter.helper
    const { importPkg } = this.bajo.helper
    const { get, isFunction, find } = await importPkg('lodash-es')
    const pool = find(this.bajoEmitter.broadcastPools, p => {
      return p.name === to.name && (p.from.includes(from) || !p.from)
    })
    if (!pool) return
    let result = msg
    if (to.transformer) result = await callHelperOrHandler(to.transformer, msg, from, to)
    if (!result) return
    for (const t of pool.to) {
      const { transport } = addressSplit(t)
      const key = `${transport}.helper.send`
      const handler = get(this, key)
      if (!isFunction(handler)) continue
      await handler({ msg, from, to: t })
    }
  }
}

export default broadcastPool
