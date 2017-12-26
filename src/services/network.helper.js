const XHR = require('xhr-promise');

export default class NetworkHelper  {
  constructor() {
    this.xhr = new XHR();
  }

  get(url) {
    return this.xhr.send({
      method: 'GET',
      url
    })
  }
}
