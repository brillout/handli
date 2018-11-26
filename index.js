const Handli = require('./Handli');
const showMessage = require('./showMessage');

module.exports = new Handli({
  showMessage,
});

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
