function emit (name, ...params) {
  this.instance.emit(name, ...params)
}

export default emit
