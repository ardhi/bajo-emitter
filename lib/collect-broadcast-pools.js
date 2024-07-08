async function collectBroadcastPoolsHandler ({ item }) {
  const { addressVerify } = this.helper
  const { error } = this.app.bajo.helper
  const { isString } = this.app.bajo.helper._
  for (const f of ['from', 'to']) {
    if (!item[f]) continue
    if (isString(item[f])) item[f] = [item[f]]
    for (const a of item[f]) {
      addressVerify(a, { skipConnectionCheck: item.skipConnectionCheck })
    }
  }
  if (!item.from || item.from.length === 0) throw error('A pool must have a \'from\' address')
}

export default collectBroadcastPoolsHandler
