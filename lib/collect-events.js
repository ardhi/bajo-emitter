const methods = ['on', 'off', 'once']

async function persistence (mod, args) {
  const { callMethodOrHandler } = this.app.bajo
  const { collExists, recordCreate } = this.app.bajoDb
  const { isPlainObject } = this.app.bajo.lib._
  const exists = await collExists(mod.persist.schema)
  if (!exists) return
  let result
  if (mod.persist.transformer) {
    result = await callMethodOrHandler(mod.persist.transformer, ...args)
    if (!result) return
  }
  if (!isPlainObject(result)) return
  try {
    await recordCreate(mod.persist.schema, result)
  } catch (err) {}
}

async function collectEvents () {
  const me = this
  const { eachPlugins, runHook, importModule } = me.app.bajo
  const { map, camelCase, merge, filter, groupBy, orderBy, isString } = me.app.bajo.lib._
  me.events = me.events ?? []
  await runHook('bajoEmitter:beforeCollectEvents')
  // collects
  me.log.trace('Collecting %s...', me.print.write('events'))
  await eachPlugins(async function ({ ns, dir, file }) {
    const parts = (file.slice(dir.length + 1) ?? '').split('/')
    parts.shift()
    const [method, evtName] = parts
    if (!methods.includes(method)) return undefined
    let [name, path] = map(evtName.replace('.js', '').split('@'), e => camelCase(e))
    if (!path) {
      path = name
      name = ns
    }
    const mod = await importModule(file, { asHandler: true })
    if (!mod) return undefined
    if (mod.persist) {
      if (isString(mod.persist)) mod.persist = { schema: mod.persist }
      mod.persist.msgIndex = mod.persist.msgIndex ?? 0
    }
    mod.level = mod.level ?? 100
    merge(mod, { method, ns: name, path, src: ns })
    me.events.push(mod)
  }, { glob: 'event/**/*.js', baseNs: this.name })
  // apply events
  await eachPlugins(async function ({ ns }) {
    for (const m of methods) {
      const events = filter(me.events, { ns, method: m })
      if (events.length === 0) return undefined
      const items = groupBy(events, 'path')
      for (const i in items) {
        const mods = orderBy(items[i], ['level'])
        me.log.trace('- Collect %s: %s:%s.%s (%d)', me.print.write('event'), m, ns, i, mods.length)
        me.instance[m](`${ns}.${i}`, async (...args) => {
          for (const mod of mods) {
            if (mod.handler) await mod.handler.call(this.app[mod.src], ...args)
            // persistence
            if (!me.bajoDb || !mod.persist) continue
            await persistence.call(me, mod, args)
          }
        })
      }
    }
  })
  me.log.debug('%s collected: %d', me.print.write('events'), me.events.length)
  await runHook('bajoEmitter:afterCollectEvents')
}

export default collectEvents
