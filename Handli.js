const assert = require('reassert');

module.exports = Handli;

function Handli(options_global={}) {

  let requestIsPending = false;
  let currentModal = null;

  const options_default = {
    devMode: typeof window !== "undefined" && window.location && window.location.hostname==='localhost',
  };

  return handli;

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
        if( currentModal ) currentModal.closeModal();
        return handleNoConnection();
      }

      /*
      console.log(response, await response.text(), response.ok, response.status);
      */
      if( currentModal ) currentModal.closeModal();

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
      if( currentModal ) currentModal.closeModal();
      showModal(getErrorMessage('FATAL'));
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
      let errorMessage = getErrorMessage('BUG');
      let devMessage;
      if( getOption('devMode') ) {
        devMessage = await getDevMessage(response, err);
      }
      return handlePeriodicRetry(errorMessage, devMessage);
    }

    async function getDevMessage(response) {
      let devMessage = "<br/><br/>===== DEV DEBUG =====<br/>";

      if( response ) {
        devMessage +=

        devMessage += (
          '<span style="color: red">'+
          [
            response.status,
            response.statusText,
          ].filter(Boolean).join(' ')+
          '<span>'
        );

        devMessage += " "+response.url;

        let bodyText;
        try {
          bodyText = await response.text();
        } catch(err) {}
        if( bodyText ) {
          devMessage += "<br><br>"+bodyText;
        }
      } else {
        devMessage += (
          '<span style="color: red">'+
          'Could not connect to server.'+
          '<span>'+
          '<br/><br/>'+
          'Is the server running? Is CORS correctly set up?'
        );
      }

      devMessage += '<br/><br/><small style="color: #777">You are seeing this because you are in developer mode.</small>';

      return devMessage;
    }

    function handleErrorResponse(response) {
      return handleBug(response);
    }

    function showModal(...messageHtmls) {
      const messageHtml = messageHtmls.filter(Boolean).join('<br/>');

      const {close, update} = getOption('showMessage')(messageHtml);
      currentModal = {
        closeModal: () => {
          close();
          currentModal = null;
        },
        updateModal: update,
      };
    }
    function updateModal() {
      
    }

    async function handleOffline() {
      showModal(getErrorMessage("OFFLINE"));

      await awaitInternetConnection();

      showModal(
        getErrorMessage("ONLINE"),
        getErrorMessage("RETRYING"),
      );

      const response = await runRequest();
      return response;
    }

    async function handlePeriodicRetry(message, devMessage) {
      showModal(
        message,
        getErrorMessage("RETRY_IN")(timeLeft)
        devMessage
      );

      await wait(timeLeft => {
        showModal(
          message,
          getErrorMessage("RETRY_IN")(timeLeft)
          devMessage
        );
      });

      currentModal.updateModal(getModalMessage(message, "Retrying now...", devMessage));

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

    function getErrorMessage(errorCode) {
      const errorMessages = getOption('errorMessages');
      const errorMessage = errorMessages[errorCode];
      assert.internal(errorMessage);
      return errorMessage;
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
