const broadcastPool = {
  level: 1,
  handler: async function onBroadcastPool ({ msg, from, to, subject }) {
    const { callHelperOrHandler } = this.bajo.helper
    const { addressSplit } = this.bajoEmitter.helper
    const { get, isFunction, filter } = this.bajo.helper._
    const pools = filter(this.bajoEmitter.broadcastPools, p => {
      return p.from.includes(from)
    })
    for (const p of pools) {
      if (p.handler) {
        await callHelperOrHandler(p.handler, { from, to, subject, msg })
        continue
      }
      let ok = true
      if (p.filter) ok = await callHelperOrHandler(p.filter, { from, to, subject, msg })
      if (!ok) continue
      let item = msg
      if (p.transformer) item = await callHelperOrHandler(p.transformer, { from, to, subject, msg })
      for (const t of p.to) {
        const { transport } = addressSplit(t)
        const key = `${transport}.helper.send`
        const handler = get(this, key)
        if (!isFunction(handler)) continue
        await handler({ msg: item, from, to: t })
      }
    }
  }
}

export default broadcastPool
