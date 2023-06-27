const methods = ['on', 'off', 'once']

export default async function () {
  const { _, walkBajos, log, getConfig, runHook, importModule } = this.bajo.helper
  this.bajoEmitter.events = this.bajoEmitter.events || []
  log.debug('Collect events')
  await runHook('bajoEmitter:beforeCollectEvents')
  const config = getConfig()
  // collects
  await walkBajos(async function ({ name, dir, file }) {
    let [$, method, evtName] = (file.slice(dir.length + 1) || '').split('/')
    if (!methods.includes(method)) return undefined
    let [ns, path] = _.map(evtName.replace('.js', '').split('@'), e => _.camelCase(e))
    if (!path) {
      path = ns
      ns = name
    }
    const mod = await importModule(file, { forCollector: true })
    if (!mod) return undefined
    _.merge(mod, { method, ns, path })
    this.bajoEmitter.events.push(mod)
  }, { glob: 'event/**/*.js' })
  // apply events
  await walkBajos(async function ({ name }) {
    for (const m of methods) {
      let events = _.filter(this.bajoEmitter.events, { ns: name, method: m })
      if (events.length === 0) return undefined
      const items = _.groupBy(events, 'path')
      for (const i in items) {
        const fns = _.orderBy(items[i], ['level'])
        log.trace('Collect event: %s:%s.%s (%d)', m, name, i, fns.length)
        this.bajoEmitter.instance[m](`${name}.${i}`, async (...args) => {
          for (const fn of fns) {
            const id = `bajoEmitter:${name}.${i}`
            if (config.log.report.includes(id)) {
              log.trace({ args }, `Call listener '%s'`, id)
            }
            await fn.handler.call(this, ...args)
          }
        })
      }
    }
  })
  await runHook('bajoEmitter:afterCollectEvents')
}