const Handli = require('./Handli');
const showMessage = require('./showMessage');
const messages = require('./messages');
const checkInternetConnection = require('./checkInternetConnection');

module.exports = new Handli({
  showMessage,
  checkInternetConnection,
  messages,
});

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
