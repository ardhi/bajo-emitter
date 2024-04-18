const methods = ['on', 'off', 'once']

async function persistence (mod, args) {
  const { callHelperOrHandler } = this.bajo.helper
  const { collExists, recordCreate } = this.bajoDb.helper
  const { isPlainObject } = this.bajo.helper._
  const exists = await collExists(mod.persist.schema)
  if (!exists) return
  let result
  if (mod.persist.transformer) {
    result = await callHelperOrHandler(mod.persist.transformer, ...args)
    if (!result) return
  }
  if (!isPlainObject(result)) return
  try {
    await recordCreate(mod.persist.schema, result)
  } catch (err) {}
}

async function collectEvents () {
  const { eachPlugins, log, runHook, importModule } = this.bajo.helper
  const { map, camelCase, merge, filter, groupBy, orderBy, isString } = this.bajo.helper._
  this.bajoEmitter.events = this.bajoEmitter.events ?? []
  log.debug('Collect events')
  await runHook('bajoEmitter:beforeCollectEvents')
  // collects
  await eachPlugins(async function ({ plugin, dir, file }) {
    const parts = (file.slice(dir.length + 1) ?? '').split('/')
    parts.shift()
    const [method, evtName] = parts
    if (!methods.includes(method)) return undefined
    let [ns, path] = map(evtName.replace('.js', '').split('@'), e => camelCase(e))
    if (!path) {
      path = ns
      ns = plugin
    }
    const mod = await importModule(file, { asHandler: true })
    if (!mod) return undefined
    if (mod.persist) {
      if (isString(mod.persist)) mod.persist = { schema: mod.persist }
      mod.persist.msgIndex = mod.persist.msgIndex ?? 0
    }
    mod.level = mod.level ?? 100
    merge(mod, { method, ns, path, plugin })
    this.bajoEmitter.events.push(mod)
  }, { glob: 'event/**/*.js' })
  // apply events
  await eachPlugins(async function ({ plugin }) {
    for (const m of methods) {
      const events = filter(this.bajoEmitter.events, { ns: plugin, method: m })
      if (events.length === 0) return undefined
      const items = groupBy(events, 'path')
      for (const i in items) {
        const mods = orderBy(items[i], ['level'])
        log.trace('Collect event: %s:%s.%s (%d)', m, plugin, i, mods.length)
        this.bajoEmitter.instance[m](`${plugin}.${i}`, async (...args) => {
          for (const mod of mods) {
            if (mod.handler) await mod.handler.call(this, ...args)
            // persistence
            if (!this.bajoDb || !mod.persist) continue
            await persistence.call(this, mod, args)
          }
        })
      }
    }
  })
  await runHook('bajoEmitter:afterCollectEvents')
}

export default collectEvents
