const Handli = require('./Handli');
const displayError = require('./displayError');

module.exports = new Handli({
  displayError,
});

/*
function displayError(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
