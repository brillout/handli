const assert = require('reassert');

module.exports = Handli;

function Handli(options_global) {

  let requestIsPending = false;
  let currentModal = null;

  return handli;

  async function handli(requestFunction, options_local) {

    assert.usage(
      typeof window !== "undefined" && window.document,
      "Handli only works in the browser"
    );

    const {
      showMessage,
      disableHandli,
    } = {...options_global, ...options_local};

    if( disableHandli ) {
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

    async function runRequest(close) {
      let response;
      try {
        const responsePromise = requestFunction();
        response = await responsePromise;
      } catch(err) {
        console.error(err);
        if( close ) close();
        return handleNoConnection();
      }

      /*
      console.log(response, await response.text(), response.ok, response.status);
      */
      if( close ) close();

      if( isErrorResponse(response) ) {
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
      if( close ) close();
      await new Promise();
    }

    async function handleNoConnection() {
      if( await noInternet() ) {
        return handleOffline();
      } else {
        return handlePeriodicRetry("Cannot connect to server.");
      }
    }

    function handleErrorResponse(response) {
      return handlePeriodicRetry("Server received the request but did not process it.");
    }

    function showModal(messageHtml) {
      const {close, update} = showMessage(messageHtml);
      currentModal = {
        closeModal: () => {
          close();
          currentModal = null;
        },
        updateModal: update,
      };
    }

    async function handleOffline() {
      showModal(
        [
          "You are offline.",
          "Go online to proceed.",
        ].join('<br/>')
      );

      await awaitInternetConnection();

      update(
        [
          "You now seem to be connected to the network.",
          "Retrying...",
        ].join('<br/>')
      );
      const response = await runRequest(close);
      return response;
    }

    async function handlePeriodicRetry(message) {
      showModal(message);

      await wait(timeLeft => {
        currentModal.updateModal(
          [
            message,
            "Retrying in "+timeLeft+".",
          ].join('<br/>')
        );
      });

      currentModal.updateModal(
        [
          message,
          "Retrying now...",
        ].join('<br/>')
      );

      const response = await runRequest();
      return response;
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
