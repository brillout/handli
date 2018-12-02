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

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
