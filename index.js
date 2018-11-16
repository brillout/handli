const FetchErrorHandler = require('./FetchErrorHandler');
const displayError = require('./displayError');

module.exports = new FetchErrorHandler({
  displayError,
});
