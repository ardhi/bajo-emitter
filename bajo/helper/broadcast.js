async function broadcast ({ msg, from, to, subject }) {
  this.instance.emit('bajoEmitter.broadcastPool', { msg, from, to, subject })
}

export default broadcast
