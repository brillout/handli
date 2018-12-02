const assert = require('reassert');

module.exports = Handli;

function Handli() {
  Object.assign(handli, {
    timeout: null,
    timeoutServer: null,
    timeoutInternet: null,
    thresholdSlowInternet: 500,
    thresholdNoInternet: 900,
    retryTimer: seconds => !seconds ? 3 : Math.ceil(seconds*1.5),
  });

  const failedRequests = [];
  var checkConnectionPromise;
  let connectionState = null;

  return handli;

  async function handleFailure() {
    if( failedRequests.length===0 ) {
      closeModal();
      previousSeconds = undefined;
      return;
    }

    assert.internal(
      (
        noServerTimeout() && noInternetTimeout()
      ) || (
        [true, false].includes(connectionState.noInternet) &&
        [true, false].includes(connectionState.slowInternet)
      )
    );

    if( connectionState!== null && connectionState.noInternet===true ) {
      await handleOffline(connectionState);
    }
    else if( connectionState!==null && connectionState.slowInternet===true ) {
      await handleSlowInternet(connectionState);
    }
    else if( hasSlowResponse() ) {
      await handleSlowServer();
    } else {
      await handleBugs();
    }

    await Promise.all([
      antiFlakyUI(),
      resolveFailedRequests(),
    ]);

    handleFailure();
  }
  function hasSlowResponse() {
    assert.internal(connectionState===null || connectionState.slowInternet===false);
    return getRequestsWith('SLOW_RESPONSE').length>0;
  }
  async function handleOffline() {
    assert.internal(connectionState.noInternet===true);
    const {noLanConnection} = connectionState;
    if( noLanConnection ) {
      showWarningModal(
        getMsg("OFFLINE"),
        getMsg("RETRYING_WHEN_ONLINE"),
      );
    } else {
      showWarningModal(
        getMsg("OFFLINE_PROBABLY"),
        getMsg("RETRYING_STILL"),
      );
    }

    await connectionState.awaitInternetConnection();

    if( noLanConnection ) {
      showWarningModal(
        getMsg("ONLINE"),
        getMsg("RETRYING_NOW")
      );
    }
  }
  async function handleSlowInternet() {
    showWarningModal(
      getMsg("SLOW_INTERNET"),
      getMsg("RETRYING_STILL"),
    );
  }
  async function handleSlowServer() {
    showErrorModal(
      getMsg('SLOW_SERVER'),
      getMsg('RETRYING_STILL'),
    );
  }
  async function handleBugs() {
    await wait(timeLeft => {
      showErrorModal(
        getMsg('ERROR'),
        getMsgRetryingIn(timeLeft),
      );
    });

    showErrorModal(
      getMsg('ERROR'),
      getMsg("RETRYING_NOW"),
    );
  }
  async function resolveFailedRequests() {
    for(request of getRequestsWith('SLOW_RESPONSE')) {
      await request.retryRequest();
    }
    for(request of getRequestsWith('ERROR_RESPONSE')) {
      await request.retryRequest();
    }
    for(request of getRequestsWith('NO_RESPONSE')) {
      await request.retryRequest();
    }
  }
  function getRequestsWith(failureState) {
    const STATES = ['SLOW_RESPONSE', 'ERROR_RESPONSE', 'NO_RESPONSE'];
    assert.internal(STATES.includes(failureState));
    assert.internal(failedRequests.every(req => STATES.includes(req.requestState.failureState)), failedRequests);
    return (
      failedRequests
      .filter(request => request.requestState.failureState===failureState)
    );
  }



  async function handli(requestFunction) {
    const isBrowser = typeof window !== "undefined" && window.document;

    const skipHandli = (
      !isBrowser ||
      getOption('disableHandli')
    );

    if( skipHandli ) {
      return requestFunction();
    };

    const requestState = {};

    let resolveValue;
    const resolvedValuePromise = new Promise(r => resolveValue = r);

    await tryRequest();

    if( requestState.failureState ) {
      addFailedRequest();
    }

    return resolvedValuePromise;

    function addFailedRequest() {
      const failedRequest = {
        requestState,
        retryRequest,
      };
      failedRequests.push(failedRequest);

      const resolveValue_ = resolveValue;
      resolveValue = resolvedValue => {
        const idx = failedRequests.indexOf(failedRequest);
        assert.internal(idx>=0);
        failedRequests.splice(idx, 1);

        resolveValue_(resolvedValue);
      };

      if( failedRequests.length===1 ) {
        handleFailure();
      }
    }

    async function retryRequest() {
      if( requestState.failureState ) {
        await tryRequest();
      }
    }

    var responsePromise;
    async function tryRequest() {
      let responseReceived;

      let resolveAttempt;
      const attemptPromise = new Promise(r => resolveAttempt=r);

      let connectionStatusPromise;
      handleResponse();
      handleConnectionStatus();
      handleFlakyInternet();
      handleFlakyServer();

      return attemptPromise;

      async function handleResponse() {
        if( ! responsePromise ) {
          responsePromise = requestReponse();
        }
        await responsePromise;
        responseReceived = true;
        resolveAttempt();
      }
      async function requestReponse() {
        assert.internal(!responsePromise);
        let returnedValue;
        try {
          returnedValue = await requestFunction();
        } catch(err) {
          console.error(err);
          requestState.failureState = 'NO_RESPONSE';
          responsePromise = null;
          if( connectionStatusPromise ) {
            await connectionStatusPromise;
          }
          return;
        }

        assert_returnedValue(returnedValue);
        if( isErrorResponse(returnedValue) ) {
          console.error(returnedValue);
          requestState.failureState = 'ERROR_RESPONSE';
        } else {
          requestState.failureState = null;
          resolveValue(returnedValue);
        }

        responsePromise = null;
      }

      function handleConnectionStatus() {
        connectionState = null;

        const timeout = getOption('timeout');
        const timeoutServer = getOption('timeoutServer');
        const timeoutInternet = getOption('timeoutInternet');
        const thresholdNoInternet = getOption('thresholdNoInternet');
        const thresholdSlowInternet = getOption('thresholdSlowInternet');
        assert.usage(
          thresholdSlowInternet<thresholdNoInternet,
          {thresholdSlowInternet, thresholdNoInternet},
          '`thresholdSlowInternet` should be lower than `thresholdNoInternet`'
        );

        if( noServerTimeout() && noInternetTimeout() ) {
          return;
        }
        const minTimeout = getMinTimeout();
        const checkTimeout = minTimeout - thresholdNoInternet;
        assert.usage(
          checkTimeout>=100,
          {thresholdNoInternet, timeout, timeoutInternet, timeoutServer},
          "`thresholdNoInternet` should be at least 100ms lower than `timeout`, `timeoutInternet`, and `timeoutServer`"
        );

        let resolveConnectionStatus;
        connectionStatusPromise = new Promise(r => resolveConnectionStatus=r);
        setTimeout(
          async () => {
            connectionState = await getConnectionInfo();
            assert.internal([true, false].includes(connectionState.noInternet));
            assert.internal([true, false].includes(connectionState.slowInternet));
            resolveConnectionStatus();
          },
          checkTimeout
        );
      }
      // TODO
      function handleFlakyInternet() {
        const timeout = getInternetTimeout();
        if( ! timeout ) return;
        setTimeout(async () => {
          if( responseReceived ) return;

          await connectionStatusPromise;
          assert.internal([true, false].includes(connectionState.noInternet));
          assert.internal([true, false].includes(connectionState.slowInternet));
          if( responseReceived ) return;

          const {noInternet, slowInternet} = connectionState;
          if( noInternet ) return;
          if( !slowInternet ) return;

          requestState.failureState = 'SLOW_RESPONSE';
          resolveAttempt();
        }, timeout);
      }
      function handleFlakyServer() {
        const timeout = getServerTimeout();
        if( ! timeout ) return;
        setTimeout(async () => {
          if( responseReceived ) return;

          await connectionStatusPromise;
          assert.internal([true, false].includes(connectionState.noInternet));
          assert.internal([true, false].includes(connectionState.slowInternet));
          if( responseReceived ) return;

          const {noInternet, slowInternet} = connectionState;
          if( responseReceived ) return;
          if( noInternet ) return;
          if( slowInternet ) return;

          requestState.failureState = 'SLOW_RESPONSE';
          resolveAttempt();
        }, timeout);
      }
    }

    async function getConnectionInfo() {
      if( ! checkConnectionPromise ) {
        checkConnectionPromise = checkConnection();
      }
      const connectionInfo = await checkConnectionPromise;
      checkConnectionPromise = null;
      return connectionInfo;
    }
    async function checkConnection() {
      const thresholdNoInternet = getOption('thresholdNoInternet');
      const conn = await getOption('checkInternetConnection')(thresholdNoInternet);
      const {noInternet, fastestPing} = conn;
      assert.internal([true, false].includes(noInternet));
      assert.internal(noInternet===true || fastestPing>=0);

      const thresholdSlowInternet = getOption('thresholdSlowInternet');
      assert.usage(
        thresholdSlowInternet>0,
        {thresholdSlowInternet},
        "`thresholdSlowInternet` is missing"
      );
      const slowInternet = !noInternet && fastestPing >= thresholdSlowInternet;

      const connectionInfo = {
        slowInternet,
        ...conn,
      };

      return connectionInfo;
    }
  }



  var previousSeconds;
  function wait(timeListener) {
    const seconds = getOption('retryTimer')(previousSeconds);
    assert.usage(
      seconds>0 && (previousSeconds===undefined || seconds>=previousSeconds),
      "Wrong `retryTimer`",
    );
    let secondsLeft = previousSeconds = seconds;
    const callListener = () => {
      if( secondsLeft===0 ) {
        resolve();
        return;
      }
      timeListener(secondsLeft);
      --secondsLeft;
      window.setTimeout(callListener, 1000);
    };
    let resolve;
    const promise = new Promise(resolver => resolve=resolver);
    callListener();
    return promise;
  }



  function getOption(prop, {required, subProp}={}) {
    let val = handli[prop];
    if( subProp ) {
      val = val && val[subProp];
    }

    assert.internal(!required || val, {val, prop, subProp});

    return val;
  }
  function getMsgRetryingIn(timeLeft) {
    const msgFn = getMsg('RETRYING_IN', true);
    if( ! msgFn instanceof Function ) {
      return strToHtml(msgFn);
    }
    const msg = msgFn(timeLeft);
    return strToHtml(msg);
  }
  function getMsg(msgCode, isFn) {
    let msg = getOption('messages', {subProp: msgCode, required: true});
    return isFn ? msg : strToHtml(msg);
  }
  function strToHtml(str) {
    assert.usage(str && str.split, str);
    const html = str.split('\n').join('<br/>');
    return html;
  }
  function getInternetTimeout() {
    return getOption('timeoutInternet') || getOption('timeout');
  }
  function getServerTimeout() {
    return getOption('timeoutServer') || getOption('timeout');
  }
  function getMinTimeout() {
    return Math.min(getInternetTimeout()||Infinity, getServerTimeout()||Infinity);
  }
  function noServerTimeout() {
    return !getServerTimeout();
  }
  function noInternetTimeout() {
    return !getInternetTimeout();
  }



  var currentModal;
  function showWarningModal(...args) {
    _showModal(true, ...args);
  }
  function showErrorModal(...args) {
    _showModal(false, ...args);
  }
  function _showModal(isWarning, ...messageHtmls) {
    const messageHtml = messageHtmls.filter(Boolean).join('<br/>');

    if( currentModal && currentModal.isWarning===isWarning ) {
      currentModal.update(messageHtml);
    } else {
      closeModal();
      const {update, close} = getOption('showMessage')(messageHtml, isWarning);
      currentModal = {
        isWarning,
        update,
        close,
      };
    }
  }
  function closeModal() {
    if( currentModal ) currentModal.close();
    currentModal = null;
  }
}



function assert_resolvedValue(resolvedValue) {
  if( isFetchLikeResponse(resolvedValue) ) {
    const response = resolvedValue;
    assert_fetchLikeResponse(response);
    const {status} = response;
    assert.internal(200<= status && status<=299);
  }
}
function assert_returnedValue(returnedValue) {
  if( isFetchLikeResponse(returnedValue) ) {
    const response = returnedValue;
    assert_fetchLikeResponse(response);
  }
}
function assert_fetchLikeResponse(response) {
  const isSuccessCode = 200 <= response.status && response.status <= 299;
  assert.warning(
    isSuccessCode === response.ok,
    "Unexpected response object. Are you using a fetch-like library?"
  );
}
function isFetchLikeResponse(response) {
  const yes = (
    response instanceof Object &&
    [true, false].includes(response.ok) &&
    'status' in response
  );
  return yes;
}
function isErrorResponse(response) {
  if( ! isFetchLikeResponse(response) ) {
    return false;
  }
  const isSuccessCode = 200 <= response.status && response.status <= 299;
  return !isSuccessCode;
}


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
