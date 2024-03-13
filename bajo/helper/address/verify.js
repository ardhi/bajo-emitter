async function verify (address) {
  const { addressSplit } = this.bajoEmitter.helper
  const { importPkg, error, isSet } = this.bajo.helper
  const { isEmpty, find } = await importPkg('lodash-es')
  const { destination, connection, transport } = addressSplit(address)
  if (!isSet(destination) || isEmpty(connection) || isEmpty(transport)) throw error('Invalid address \'%s\'', address)
  if (!this[transport]) throw error('Unknown transport \'%s\' or transport isn\'t loaded yet', transport)
  if (!find(this[transport].connections, { name: connection })) throw error('Unknown connection \'%s@%s\'', connection, transport)
  return true
}

export default verify
