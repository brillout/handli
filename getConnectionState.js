let connectionState;
let checkDate;

module.exports = {
  deprecateState,
  getConnectionState,
  checkNowIfMissing,
  stateIsAvailable
};
  function assert_connectionState() {
    const no_server_timeout = noServerTimeout();
    const no_internet_timeout = noInternetTimeout();
    assert.internal(
      (
        no_server_timeout && no_internet_timeout
      ) || (
        connectionState &&
        [true, false].includes(connectionState.noInternet) &&
        [true, false].includes(connectionState.slowInternet)
      ),
      Object.entries(handli),
      {no_server_timeout, no_internet_timeout, connectionState},
    );
  }
  function removeConnectionState() {
    connectionState = null;
  }
