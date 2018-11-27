const Handli = require('./Handli');
const showMessage = require('./showMessage');
const errorMessages = require('./errorMessages');

module.exports = new Handli({
  showMessage,
  errorMessages,
});

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
