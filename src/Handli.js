const ConnectionStateManager = require('./ConnectionStateManager')
const assert = require('reassert')

module.exports = Handli

function Handli() {
  Object.assign(handli, {
    timeout: null,
    timeoutServer: null,
    timeoutInternet: null,
    thresholdSlowInternet: 500,
    thresholdNoInternet: 900,
    retryTimer: (seconds) => (!seconds ? 3 : Math.ceil(seconds * 1.5)),
  })

  const failedRequests = []

  const connectionStateManager = getConnectionStateManager()

  return handli

  async function handleFailure() {
    if (failedRequests.length === 0) {
      closeModal()
      previousSeconds = undefined
      connectionStateManager.deprecateState()
      return
    }

    const connectionState = connectionStateManager.getConnectionState()
    // console.log('c', connectionState, failedRequests.length);

    if (connectionState !== null && connectionState.noInternet === true) {
      await handleOffline(connectionState)
    } else if (connectionState !== null && connectionState.slowInternet === true) {
      await handleSlowInternet(connectionState)
    } else if (hasSlowResponse()) {
      await handleSlowServer()
    } else {
      await handleBugs()
    }

    /*
    await Promise.all([
      antiFlakyUI(),
      resolveFailedRequests(),
    ]);
    */
    connectionStateManager.deprecateState()
    await resolveFailedRequests()

    handleFailure()
  }
  function hasSlowResponse() {
    return getRequestsWith('SLOW_RESPONSE').length > 0
  }
  async function handleOffline(connectionState) {
    assert.internal(connectionState.noInternet === true)
    const { noLanConnection } = connectionState
    if (noLanConnection) {
      showWarningModal(getMsg('OFFLINE'), getMsg('RETRYING_WHEN_ONLINE'))
    } else {
      showWarningModal(getMsg('OFFLINE_PROBABLY'), getMsg('RETRYING_STILL'))
    }

    await connectionState.awaitInternetConnection()

    if (noLanConnection) {
      showWarningModal(getMsg('ONLINE'), getMsg('RETRYING_NOW'))
    }
  }
  async function handleSlowInternet() {
    showWarningModal(getMsg('SLOW_INTERNET'), getMsg('RETRYING_STILL'))
  }
  async function handleSlowServer() {
    showErrorModal(getMsg('SLOW_SERVER'), getMsg('RETRYING_STILL'))
  }
  async function handleBugs() {
    await wait((timeLeft) => {
      showErrorModal(getMsg('ERROR'), getMsgRetryingIn(timeLeft))
    })

    showErrorModal(getMsg('ERROR'), getMsg('RETRYING_NOW'))
  }
  async function resolveFailedRequests() {
    for (let request of getRequestsWith('SLOW_RESPONSE')) {
      await request.retryRequest()
    }
    for (let request of getRequestsWith('ERROR_RESPONSE')) {
      await request.retryRequest()
    }
    for (let request of getRequestsWith('NO_RESPONSE')) {
      await request.retryRequest()
    }
  }
  function getRequestsWith(failureState) {
    const STATES = ['SLOW_RESPONSE', 'ERROR_RESPONSE', 'NO_RESPONSE']
    assert.internal(STATES.includes(failureState))
    assert.internal(
      failedRequests.every((req) => STATES.includes(req.requestState.failureState)),
      failedRequests,
    )
    return failedRequests.filter((request) => request.requestState.failureState === failureState)
  }

  async function handli(requestFunction) {
    const isBrowser = typeof window !== 'undefined' && window.document

    const skipHandli = !isBrowser || getOption('disableHandli')

    if (skipHandli) {
      return requestFunction()
    }

    const requestState = {}

    let resolveValue
    const resolvedValuePromise = new Promise((r) => (resolveValue = r))

    await tryRequest()

    if (requestState.failureState) {
      addFailedRequest()
    }

    return resolvedValuePromise

    function addFailedRequest() {
      const failedRequest = {
        requestState,
        retryRequest,
      }
      failedRequests.push(failedRequest)

      const resolveValue_ = resolveValue
      resolveValue = (resolvedValue) => {
        const idx = failedRequests.indexOf(failedRequest)
        assert.internal(idx >= 0)
        failedRequests.splice(idx, 1)

        resolveValue_(resolvedValue)
      }

      if (failedRequests.length === 1) {
        handleFailure()
      }
    }

    async function retryRequest() {
      if (requestState.failureState) {
        await tryRequest()
      }
    }

    var responsePromise
    async function tryRequest() {
      let responseReceived

      let resolveAttempt
      const attemptPromise = new Promise((r) => (resolveAttempt = r))

      const checkConnectionStateTimeout = getCheckConnectionStateTimeout()

      handleResponse()
      handleConnectionStatus()
      handleFlakyInternet()
      handleFlakyServer()

      return attemptPromise

      async function handleResponse() {
        if (!responsePromise) {
          responsePromise = requestReponse()
        }
        await responsePromise
        responseReceived = true
        resolveAttempt()
      }
      async function requestReponse() {
        assert.internal(!responsePromise)
        let returnedValue
        try {
          returnedValue = await requestFunction()
        } catch (err) {
          console.error(err)
          requestState.failureState = 'NO_RESPONSE'
          responsePromise = null
          await connectionStateManager.checkNowIfMissing()
          return
        }

        assert_returnedValue(returnedValue)
        if (isErrorResponse(returnedValue)) {
          console.error(returnedValue)
          requestState.failureState = 'ERROR_RESPONSE'
          if (checkConnectionStateTimeout) {
            await connectionStateManager.checkNowIfMissing()
          }
        } else {
          requestState.failureState = null
          resolveValue(returnedValue)
        }

        responsePromise = null
      }

      function handleConnectionStatus() {
        if (!checkConnectionStateTimeout) {
          return
        }
        setTimeout(connectionStateManager.checkNowIfMissing, checkConnectionStateTimeout)
      }
      function handleFlakyInternet() {
        const timeout = getInternetTimeout()
        if (!timeout) return
        setTimeout(async () => {
          if (responseReceived) return

          const { noInternet, slowInternet } = await retrieveConnectionState()
          if (responseReceived) return
          if (noInternet) return
          if (!slowInternet) return

          requestState.failureState = 'SLOW_RESPONSE'
          resolveAttempt()
        }, timeout)
      }
      function handleFlakyServer() {
        const timeout = getServerTimeout()
        if (!timeout) return
        setTimeout(async () => {
          if (responseReceived) return

          const { noInternet, slowInternet } = await retrieveConnectionState()
          if (responseReceived) return
          if (noInternet) return
          if (slowInternet) return

          requestState.failureState = 'SLOW_RESPONSE'
          resolveAttempt()
        }, timeout)
      }
    }
    async function retrieveConnectionState() {
      await connectionStateManager.checkNowIfMissing()
      const connectionState = connectionStateManager.getConnectionState()

      const { noInternet, slowInternet } = connectionState
      assert.internal([true, false].includes(noInternet))
      assert.internal([true, false].includes(slowInternet))
      return { noInternet, slowInternet }
    }
  }

  var previousSeconds
  function wait(timeListener) {
    const seconds = getOption('retryTimer')(previousSeconds)
    assert.usage(seconds > 0 && (previousSeconds === undefined || seconds >= previousSeconds), 'Wrong `retryTimer`')
    let secondsLeft = (previousSeconds = seconds)
    const callListener = () => {
      if (secondsLeft === 0) {
        resolve()
        return
      }
      timeListener(secondsLeft)
      --secondsLeft
      window.setTimeout(callListener, 1000)
    }
    let resolve
    const promise = new Promise((resolver) => (resolve = resolver))
    callListener()
    return promise
  }

  function getOption(prop, { required, subProp } = {}) {
    let val = handli[prop]
    if (subProp) {
      val = val && val[subProp]
    }

    assert.internal(!required || val, { val, prop, subProp })

    return val
  }
  function getMsgRetryingIn(timeLeft) {
    const msgFn = getMsg('RETRYING_IN', true)
    if ((!msgFn) instanceof Function) {
      return strToHtml(msgFn)
    }
    const msg = msgFn(timeLeft)
    return strToHtml(msg)
  }
  function getMsg(msgCode, isFn) {
    let msg = getOption('messages', { subProp: msgCode, required: true })
    return isFn ? msg : strToHtml(msg)
  }
  function strToHtml(str) {
    assert.usage(str && str.split, str)
    const html = str.split('\n').join('<br/>')
    return html
  }
  function getInternetTimeout() {
    return getOption('timeoutInternet') || getOption('timeout')
  }
  function getServerTimeout() {
    return getOption('timeoutServer') || getOption('timeout')
  }
  function getCheckConnectionStateTimeout() {
    const timeout = getOption('timeout')
    const timeoutServer = getOption('timeoutServer')
    const timeoutInternet = getOption('timeoutInternet')
    const thresholdNoInternet = getOption('thresholdNoInternet')
    const thresholdSlowInternet = getOption('thresholdSlowInternet')

    assert.usage(
      thresholdSlowInternet < thresholdNoInternet,
      { thresholdSlowInternet, thresholdNoInternet },
      '`thresholdSlowInternet` should be lower than `thresholdNoInternet`',
    )

    const minTimeout = Math.min(getInternetTimeout() || Infinity, getServerTimeout() || Infinity)
    if (minTimeout === Infinity) {
      return null
    }
    const checkTimeout = minTimeout - thresholdNoInternet
    assert.usage(
      checkTimeout >= 100,
      { thresholdNoInternet, timeout, timeoutInternet, timeoutServer },
      '`thresholdNoInternet` should be lower than `timeout`, `timeoutInternet`, and `timeoutServer`',
    )
    return checkTimeout
  }
  function noServerTimeout() {
    return !getServerTimeout()
  }
  function noInternetTimeout() {
    return !getInternetTimeout()
  }

  var currentModal
  function showWarningModal(...args) {
    _showModal(true, ...args)
  }
  function showErrorModal(...args) {
    _showModal(false, ...args)
  }
  function _showModal(isWarning, ...messageHtmls) {
    const messageHtml = messageHtmls.filter(Boolean).join('<br/>')

    if (currentModal && currentModal.isWarning === isWarning) {
      currentModal.update(messageHtml)
    } else {
      closeModal()
      const { update, close } = getOption('showMessage')(messageHtml, isWarning)
      currentModal = {
        isWarning,
        update,
        close,
      }
    }
  }
  function closeModal() {
    if (currentModal) currentModal.close()
    currentModal = null
  }

  function getConnectionStateManager() {
    return new ConnectionStateManager(getCheckOptions)

    function getCheckOptions() {
      const checkInternetConnection = getOption('checkInternetConnection')
      const thresholdNoInternet = getOption('thresholdNoInternet')
      const thresholdSlowInternet = getOption('thresholdSlowInternet')
      return {
        checkInternetConnection,
        thresholdNoInternet,
        thresholdSlowInternet,
      }
    }
  }
}

function assert_resolvedValue(resolvedValue) {
  if (isFetchLikeResponse(resolvedValue)) {
    const response = resolvedValue
    assert_fetchLikeResponse(response)
    const { status } = response
    assert.internal(200 <= status && status <= 299)
  }
}
function assert_returnedValue(returnedValue) {
  if (isFetchLikeResponse(returnedValue)) {
    const response = returnedValue
    assert_fetchLikeResponse(response)
  }
}
function assert_fetchLikeResponse(response) {
  const isSuccessCode = 200 <= response.status && response.status <= 299
  assert.warning(isSuccessCode === response.ok, 'Unexpected response object. Are you using a fetch-like library?')
}
function isFetchLikeResponse(response) {
  const yes = response instanceof Object && [true, false].includes(response.ok) && 'status' in response
  return yes
}
function isErrorResponse(response) {
  if (!isFetchLikeResponse(response)) {
    return false
  }
  const isSuccessCode = 200 <= response.status && response.status <= 299
  return !isSuccessCode
}

/*
function antiFlakyUI() {
  return sleep(0.5);
}
// TODO rename
function sleep(seconds) {
  let resolve;
  const p = new Promise(r => resolve=r);
  setTimeout(resolve, seconds*1000);
  return p;
}
*/
