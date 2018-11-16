const FetchErrorHandler = require('./FetchErrorHandler');
const displayError = require('./displayError');

module.exports = new FetchErrorHandler({
  displayError,
});

/*
function displayError(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
