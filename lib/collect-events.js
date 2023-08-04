const methods = ['on', 'off', 'once']

async function persistence (mod, args) {
  const { callHelperOrHandler, importPkg } = this.bajo.helper
  const { repoExists, recordCreate } = this.bajoDb.helper
  const { isPlainObject } = await importPkg('lodash-es')
  const exists = await repoExists(mod.persist.schema)
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
  const { importPkg, eachPlugins, log, getConfig, runHook, importModule } = this.bajo.helper
  const { map, camelCase, merge, filter, groupBy, orderBy, isString } = await importPkg('lodash-es')
  this.bajoEmitter.events = this.bajoEmitter.events || []
  log.debug('Collect events')
  await runHook('bajoEmitter:beforeCollectEvents')
  const config = getConfig()
  // collects
  await eachPlugins(async function ({ plugin, dir, file }) {
    const parts = (file.slice(dir.length + 1) || '').split('/')
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
      mod.persist.msgIndex = mod.persist.msgIndex || 0
    }
    merge(mod, { method, ns, path })
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
            const id = `bajoEmitter:${plugin}.${i}`
            if (config.log.report.includes(id)) {
              log.trace({ args }, 'Call listener \'%s\'', id)
            }
            if (mod.handler) await mod.handler.call(this, ...args)
            // persistence
            if (!this.bajoDb || !mod.persist) return
            await persistence.call(this, mod, args)
          }
        })
      }
    }
  })
  await runHook('bajoEmitter:afterCollectEvents')
}

export default collectEvents
