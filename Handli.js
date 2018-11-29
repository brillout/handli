const assert = require('reassert');

module.exports = Handli;

function Handli(options_global={}) {

  const options_default = {
    devMode: typeof window !== "undefined" && window.location && window.location.hostname==='localhost',
    timeout: null,
    timeoutServer: null,
    timeoutInternet: null,
    thresholdSlowInternet: 400,
    thresholdNoInternet: 800,
    retryTimer: seconds => !seconds ? 3 : Math.ceil(seconds*1.5),
  };

  return handli;

  var pendingRequest;
  var stateIsUnfixable;
  async function handli(requestFunction, options_local={}) {

    assert.usage(
      typeof window !== "undefined" && window.document,
      "Handli only works in the browser"
    );

    if( getOption('disableHandli') ) {
      return requestFunction();
    };

    if( pendingRequest ) {
      await handleOverflow();
    }

    pendingRequest = true;
    let response;
    try {
      response = await runRequest();
    } finally {
      pendingRequest = false;
    }

    closeModal();

    return response;

    async function runRequest() {
      const NO_RESPONSE_YET = Symbol();
      let response = NO_RESPONSE_YET;
      const responsePromise = requestFunction();

      handleConnectionStatus();
      handleFlakyInternet();
      handleFlakyServer();

      /*
      const start = new Date();
      */
      try {
        response = await responsePromise;
      } catch(err) {
        response = null;
        console.error(err);
        return handleNoConnection(await getConnectionStatus());
      }
      assert_response(response);
      /*
      console.log(response.url, response.ok, response.status, new Date() - start);
      */

      if( isErrorResponse(response) ) {
        console.error(response);
        return handleErrorResponse(response);
      }

      return response;

      function handleConnectionStatus() {
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

        const minTimeout = Math.min(getInternetTimeout()||Infinity, getServerTimeout()||Infinity);
        if( minTimeout===Infinity ) return;
        const checkTimeout = minTimeout - thresholdNoInternet;
        assert.usage(
          checkTimeout>100,
          {thresholdNoInternet, timeout, timeoutInternet, timeoutServer},
          "`thresholdNoInternet` should be at least 100ms lower than `timeout`, `timeoutInternet`, and `timeoutServer`"
        );

        setTimeout(
          () => getConnectionStatus(),
          checkTimeout
        );
      }
      var connectionStatusPromise;
      async function getConnectionStatus() {
        if( ! connectionStatusPromise ) {
          const thresholdNoInternet = getOption('thresholdNoInternet');
          connectionStatusPromise = getOption('checkInternetConnection')(thresholdNoInternet);
        }
        const connectionStatus = await connectionStatusPromise;
        return connectionStatus;
      }
      function handleFlakyInternet() {
        const timeout = getInternetTimeout();
        if( ! timeout ) return;
        setTimeout(async () => {
          if( response!==NO_RESPONSE_YET ) return;

          const {noInternet, slowInternet, awaitInternetConnection} = await getConnectionInfo();
          if( response!==NO_RESPONSE_YET ) return;

          if( noInternet ) {
            showWarningModal(
              getMsg("OFFLINE_PROBABLY"),
              getMsg('RETRYING_STILL'),
            )
          } else if( slowInternet ) {
            showWarningModal(
              getMsg('SLOW_INTERNET'),
              getMsg('RETRYING_STILL'),
            );
          }
        }, timeout);
      }
      function handleFlakyServer() {
        const timeout = getServerTimeout();
        if( ! timeout ) return;
        setTimeout(async () => {
          if( response!==NO_RESPONSE_YET ) return;

          const {noInternet, slowInternet} = await getConnectionInfo();
          if( response!==NO_RESPONSE_YET ) return;
          if( noInternet ) return;
          if( slowInternet ) return;

          showErrorModal(
            getMsg('SLOW_SERVER'),
            getMsg('RETRYING_STILL'),
          );
        }, timeout);
      }
      async function getConnectionInfo() {
        assert.internal(connectionStatusPromise);
        const connectionStatus = await getConnectionStatus();
        const {noInternet, fastestPing} = connectionStatus;
        assert.internal([true, false].includes(noInternet));
        assert.internal(noInternet===true || fastestPing>=0);

        const thresholdSlowInternet = getOption('thresholdSlowInternet');
        assert.usage(
          thresholdSlowInternet>0,
          {thresholdSlowInternet},
          "`thresholdSlowInternet` is missing"
        );
        const slowInternet = !noInternet && fastestPing >= thresholdSlowInternet;

        return {
          noInternet,
          slowInternet,
        };
      }
    }

    function assert_response(response) {
      if( !isFetchLikeResponse(response) ) {
        return;
      }

      const isSuccessCode = 200 <= response.status && response.status <= 299;

      assert.warning(
        isSuccessCode === response.ok,
        "Unexpected response object. Are you using a fetch-like library?"
      );
    }
    function isFetchLikeResponse(response) {
      const yes = response instanceof Object && 'ok' in response && 'status' in response;
      return yes;
    }
    function isErrorResponse(response) {
      if( ! isFetchLikeResponse(response) ) {
        return false;
      }

      const isSuccessCode = 200 <= response.status && response.status <= 299;

      return !isSuccessCode;
    }

    async function handleOverflow() {
      showErrorModal(
        getMsg('BUG'),
        getMsg('RETRY_MANUALLY'),
      );
      stateIsUnfixable = true;
      await new Promise(()=>{});
    }

    async function handleNoConnection({noInternet, awaitInternetConnection}) {
      assert.internal([true, false].includes(noInternet));
      assert.internal(awaitInternetConnection);
      if( noInternet ) {
        return handleOffline(awaitInternetConnection);
      } else {
        return handleBug();
      }
    }

    async function handleBug(response) {
      let errorMessage = getMsg('BUG');
      let devMessage;
      if( getOption('devMode') ) {
        devMessage = await getDevMessage(response);
      }
      return handlePeriodicRetry(errorMessage, devMessage);
    }

    async function getDevMessage(response) {
      let devMessage = "<br/>-------------------------- debug info --------------------------";
      devMessage += '<br/><small style="color: #777">(shown only in dev mode, see <a target="_blank" href="https://github.com/brillout/handli">github.com/brillout/handli</a>.)</small><br/><br/>';

      if( response && (response.status || response.statusText) ) {
        devMessage += (
          '<span style="color: red">'+
          [
            response.status,
            response.statusText,
          ].filter(Boolean).join(' ')+
          '</span>'
        );
      }

      if( response && response.url ) {
        devMessage += ' <a target="_blank" href="'+response.url+'">'+response.url+'</a>';
      }

      if( response ) {
        const responseHtml = await getResponseHtml(response);
        if( responseHtml ) {
          devMessage += "<br><br>"+responseHtml;
        }
      }

      if( ! response ) {
        devMessage += (
          '<span style="color: red">'+
          'Could not connect to server.'+
          '</span>'+
          '<br/><br/>'+
          'Is the server running? Is CORS correctly set up?'
        );
      }

      return devMessage;
    }

    async function getResponseHtml(response) {
      let bodyText;
      try {
        bodyText = await response.text();
      } catch(err) {
        return null;
      }

      try {
        return JSON.stringify(JSON.parse(bodyText), null, 2);
      } catch(err) {}

      /*
      const untrustedHtml = encodeURIComponent(bodyText);
      return '<iframe src="displayUntrustedHtml?untrustedHtml='+untrustedHtml+'"></iframe>';
      */
    }

    function handleErrorResponse(response) {
      return handleBug(response);
    }

    var currentModal;
    function showWarningModal(...args) {
      _showModal(true, ...args);
    }
    function showErrorModal(...args) {
      _showModal(false, ...args);
    }
    function _showModal(isWarning, ...messageHtmls) {
      if( stateIsUnfixable ) return;
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

    async function handleOffline(awaitInternetConnection) {
      showWarningModal(
        getMsg("OFFLINE"),
        getMsg("RETRYING_WHEN_ONLINE"),
      );

      await awaitInternetConnection();

      showWarningModal(
        getMsg("ONLINE"),
        getMsg("RETRYING_NOW"),
      );

      const response = await runRequest();
      return response;
    }

    async function handlePeriodicRetry(message, devMessage) {
      showErrorModal(
        message,
        devMessage,
      );

      await wait(timeLeft => {
        showErrorModal(
          message,
          getMsg("RETRYING_IN")(timeLeft),
          devMessage,
        );
      });

      showErrorModal(
        message,
        getMsg("RETRYING_NOW"),
        devMessage,
      );

      const response = await runRequest();
      return response;
    }

    function getModalMessage(message, statusMessage, devMessage) {
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
      assert.usage(options_global instanceof Object);
      assert.usage(options_local instanceof Object);

      const val = (() => {
        if( prop in options_local ) {
          if( subProp ) {
            if( subProp in options_local[prop] ) {
              return options_local[prop][subProp];
            }
          } else {
            return options_local[prop];
          }
        }
        if( prop in options_global ) {
          if( subProp ) {
            if( subProp in options_global[prop] ) {
              return options_global[prop][subProp];
            }
          } else {
            return options_global[prop];
          }
        }
        if( subProp ) {
          return options_default[prop] && options_default[prop][subProp];
        } else {
          return options_default[prop];
        }
      })();

      assert.internal(!required || val, {val, prop, subProp});
      return val;
    }
    function getMsg(msgCode) {
      return getOption('messages', {subProp: msgCode, required: true});
    }
    function getInternetTimeout() {
      return getOption('timeoutInternet') || getOption('timeout');
    }
    function getServerTimeout() {
      return getOption('timeoutServer') || getOption('timeout');
    }
  }
}
