import { assert, assertUsage } from './utils/assert'

export default ConnectionStateManager

function ConnectionStateManager(getCheckOptions) {
  let connectionState = null
  let connectionStatePromise = null

  return {
    deprecateState,
    getConnectionState,
    checkNowIfMissing,
  }

  function getConnectionState() {
    assert_connectionState()
    return connectionState
  }
  function deprecateState() {
    connectionState = null
    connectionStatePromise = null
  }
  async function checkNowIfMissing() {
    if (!connectionStatePromise) {
      connectionStatePromise = checkConnection()
    }
    await connectionStatePromise
  }

  async function checkConnection() {
    const { checkInternetConnection, thresholdNoInternet, thresholdSlowInternet } = getCheckOptions()

    const conn = await checkInternetConnection(thresholdNoInternet)
    const { noInternet, fastestPing } = conn
    assert([true, false].includes(noInternet))
    assert(noInternet === true || fastestPing >= 0)

    assertUsage(thresholdSlowInternet > 0, '`thresholdSlowInternet` is missing')
    const slowInternet = !noInternet && fastestPing >= thresholdSlowInternet

    connectionState = {
      slowInternet,
      ...conn,
    }
  }

  function assert_connectionState() {
    assert(
      connectionState === null ||
        ([true, false].includes(connectionState.noInternet) &&
          [true, false].includes(connectionState.noLanConnection) &&
          [true, false].includes(connectionState.slowInternet) &&
          (connectionState.noInternet === true || connectionState.fastestPing >= 0) &&
          connectionState.awaitInternetConnection instanceof Function),
      { connectionState },
    )
  }
}
