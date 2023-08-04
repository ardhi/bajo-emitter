const methods = ['on', 'off', 'once']

async function collectEvents () {
  const { importPkg, eachPlugins, log, getConfig, runHook, importModule, getHelper } = this.bajo.helper
  const { map, camelCase, merge, filter, groupBy, orderBy, isEmpty, isString, isFunction, isPlainObject } = await importPkg('lodash-es')
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
            if (!this.bajoDb || !isPlainObject(args[0])) continue
            if (!mod.persist) continue
            const exists = await this.bajoDb.helper.repoExists(mod.persist)
            if (!exists) continue
            const idx = mod.msgIndex || 0
            let msg = args[idx]
            if (isString(mod.transformer)) {
              const helper = getHelper(mod.transformer, false)
              if (isFunction(helper)) msg = await helper(msg)
            } else if (isFunction(mod.transformer)) {
              msg = await mod.transformer.call(this, msg)
            }
            if (!isEmpty(msg)) continue
            try {
              await this.bajoDb.helper.recordCreate(mod.persist, msg)
            } catch (err) {}
          }
        })
      }
    }
  })
  await runHook('bajoEmitter:afterCollectEvents')
}

export default collectEvents
