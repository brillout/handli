const assert = require('reassert');

module.exports = ConnectionStateManager;

function ConnectionStateManager(getCheckOptions) {
  let connectionState = null;
  let connectionStatePromise = null;

  return {
    deprecateState,
    getConnectionState,
    checkNowIfMissing,
  };

  function getConnectionState() {
    assert_connectionState();
    return connectionState;
  }
  function deprecateState() {
    connectionState = null;
    connectionStatePromise = null;
  }
  async function checkNowIfMissing() {
    if( ! connectionStatePromise ) {
      connectionStatePromise = checkConnection();
    }
    await connectionStatePromise;
  }

  async function checkConnection() {
    const {
      checkInternetConnection,
      thresholdNoInternet,
      thresholdSlowInternet,
    } = getCheckOptions();

    const conn = await checkInternetConnection(thresholdNoInternet);
    const {noInternet, fastestPing} = conn;
    assert.internal([true, false].includes(noInternet));
    assert.internal(noInternet===true || fastestPing>=0);

    assert.usage(
      thresholdSlowInternet>0,
      {thresholdSlowInternet},
      "`thresholdSlowInternet` is missing"
    );
    const slowInternet = !noInternet && fastestPing >= thresholdSlowInternet;

    connectionState = {
      slowInternet,
      ...conn,
    }
  }

  function assert_connectionState() {
    assert.internal(
      connectionState===null || (
        [true, false].includes(connectionState.noInternet) &&
        [true, false].includes(connectionState.noLanConnection) &&
        [true, false].includes(connectionState.slowInternet) &&
        connectionState.fastestPing>=0 &&
        connectionState.awaitInternetConnection.constructor===Function
      ),
      {connectionState}
    );
  }
}
