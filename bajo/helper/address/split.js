function split (address) {
  if (!address.includes(':')) address = ':' + address
  const [destination = '', cinfo = ''] = address.split(':')
  const [connection = '', transport = ''] = cinfo.split('@')
  return { destination, connection, transport }
}

export default split
