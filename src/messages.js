module.exports = {
  ERROR: 'Something unexpected happened.',
  OFFLINE: 'You are offline.',
  OFFLINE_PROBABLY: 'You seem to be offline.',
  ONLINE: 'You are back online.',
  SLOW_INTERNET: 'You seem to have a slow internet connection.',
  SLOW_SERVER: 'Server is not replying.',
  RETRYING_STILL: 'Still trying...',
  RETRYING_WHEN_ONLINE: 'Connect to the internet to proceed.',
  RETRYING_NOW: 'Retrying...',
  RETRYING_IN: (seconds) => 'Retrying in ' + seconds + ' second' + (seconds === 1 ? '' : 's') + '.',
}
