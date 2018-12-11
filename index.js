const assert = require('reassert');
const Handli = require('./Handli');
const showMessage = require('./showMessage');
const messages = require('./messages');
const checkInternetConnection = require('./checkInternetConnection');

const handli = new Handli();

Object.assign(handli, {
  showMessage,
  checkInternetConnection,
  messages,
});

module.exports = handli;

if( typeof window !== "undefined" ) {
  if( 'handli' in window ) {
    assert.warning(
      false,
      "We didn't `window.handli = new Handli()` because `window.handli` is already defined"
    );
  } else {
    window.handli = handli;
  }
}

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
