const assert = require('reassert');

module.exports = Handli;

function Handli(options_global={}) {

  const options_default = {
    devMode: typeof window !== "undefined" && window.location && window.location.hostname==='localhost',
  };

  return handli;

  var requestIsPending;
  async function handli(requestFunction, options_local={}) {

    assert.usage(
      typeof window !== "undefined" && window.document,
      "Handli only works in the browser"
    );

    if( getOption('disableHandli') ) {
      return requestFunction();
    };

    if( requestIsPending ) {
      await handleOverflow();
    }

    requestIsPending = true;
    let response;
    try {
      response = await runRequest();
    } finally {
      requestIsPending = false;
    }

    return response;

    async function runRequest() {
      let response;
      try {
        const responsePromise = requestFunction();
        response = await responsePromise;
      } catch(err) {
        console.error(err);
        closeModal();
        return handleNoConnection();
      }

      /*
      console.log(response, await response.text(), response.ok, response.status);
      */
      closeModal();

      if( isErrorResponse(response) ) {
        console.error(response);
        return handleErrorResponse(response);
      }

      return response;
    }

    function isErrorResponse(response) {
      // TODO-eventually: This is too loose, make a stricter check to avoid conflict
      const isFetchResponse = response instanceof Object && ('ok' in response || 'status' in response);

      if( ! isFetchResponse ) {
        return false;
      }

      const isSuccessCode = 200 <= response.status && response.status <= 299;

      if( response.ok===false || !isSuccessCode ) {
        return true;
      }

      return false;
    }

    async function handleOverflow() {
      closeModal();
      showModal(
        getMsg('BUG'),
        getMsg('RETRY_MANUALLY'),
      );
      await new Promise();
    }

    async function handleNoConnection() {
      if( await noInternet() ) {
        return handleOffline();
      } else {
        return handleBug();
      }
    }

    async function handleBug(response) {
      let errorMessage = getMsg('BUG');
      let devMessage;
      if( getOption('devMode') ) {
        devMessage = await getDevMessage(response);
        console.log(devMessage);
      }
      return handlePeriodicRetry(errorMessage, devMessage);
    }

    async function getDevMessage(response) {
      let devMessage = "<br/>-------------------------- debug info --------------------------";
      devMessage += '<br/><small style="color: #777">(debug info is only shown in developer mode)</small><br/><br/>';

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
      return '<iframe src="/displayUntrustedHtml?untrustedHtml='+untrustedHtml+'"></iframe>';
      */
    }

    function handleErrorResponse(response) {
      return handleBug(response);
    }

    var currentModal;
    function showModal(...messageHtmls) {
      const messageHtml = messageHtmls.filter(Boolean).join('<br/>');

      if( currentModal ) {
        currentModal.update(messageHtml);
      } else {
        currentModal = getOption('showMessage')(messageHtml);
      }
    }
    function closeModal() {
      if( currentModal ) currentModal.close();
      currentModal = null;
    }

    async function handleOffline() {
      showModal(
        getMsg("OFFLINE"),
        getMsg("RETRYING_WHEN_ONLINE"),
      );

      await awaitInternetConnection();

      showModal(
        getMsg("ONLINE"),
        getMsg("RETRYING_NOW"),
      );

      const response = await runRequest();
      return response;
    }

    async function handlePeriodicRetry(message, devMessage) {
      showModal(
        message,
        devMessage,
      );

      await wait(timeLeft => {
        showModal(
          message,
          getMsg("RETRYING_IN")(timeLeft),
          devMessage,
        );
      });

      showModal(
        message,
        getMsg("RETRYING_NOW"),
        devMessage,
      );

      const response = await runRequest();
      return response;
    }

    function getModalMessage(message, statusMessage, devMessage) {
    }

    var attempts;
    function wait(timeListener) {
      attempts = attempts || 0;
      let secondsLeft = 5*Math.pow(2, attempts++)+1;
      const callListener = () => {
        --secondsLeft;
        if( secondsLeft===0 ) {
          resolve();
          return;
        }
        timeListener(secondsLeft+" seconds");
        window.setTimeout(callListener, 1000);
      };
      let resolve;
      const promise = new Promise(resolver => resolve=resolver);
      callListener();
      return promise;
    }

    function getOption(optionName) {
      assert.usage(options_global instanceof Object);
      assert.usage(options_local instanceof Object);
      if( optionName in options_local ) {
        return options_local[optionName];
      }
      if( optionName in options_global ) {
        return options_global[optionName];
      }
      return options_default[optionName];
    }

    function getMsg(msgCode) {
      const messages = getOption('messages');
      const message = messages[msgCode];
      assert.internal(message);
      return message;
    }
  }
}

// TODO ping some always available resources to differiente between
//  - no internet connection, and
//  - server is down
async function noInternet() {
  return !window.navigator.onLine;
}
async function awaitInternetConnection() {
  if( ! await noInternet() ) {
    return;
  }

  let resolve;
  const promise = new Promise(resolver => resolve=resolver);

  window.addEventListener('online', function(e) {
    resolve();
  });

  return promise;
}
