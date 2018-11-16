const assert = require('reassert');

module.exports = FetchErrorHandler;

function FetchErrorHandler(options_global) {

  return errorHandler;

  async function errorHandler(makeRequest, options_local) {

    assert.usage(
      typeof window !== "undefined" && window.document,
      "Handli only works in the browser"
    );

    const {
      displayError,
      disableAll,
    } = {...options_global, ...options_local};

    if( disableAll ) {
      return getResponse();
    };

    const response = await getResponse();

    assert.internal(response.ok);
    assert.internal(200 <= response.status && response.status <= 299);

    return response;

    async function getResponse(close) {
      try {
        const requestPromise = makeRequest();
        const response = await requestPromise;
        /*
        console.log(response, await response.text(), response.ok, response.statusCode);
        */
        if( close ) close();
        if( !response.ok ) {
          assert.internal(!(200 <= response.status && response.status <= 299));
          return handleErrorResponse(response);
        }
        return response;
      } catch(_) {
        if( close ) close();
        return handleNoConnection();
      }
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

    async function handleOffline() {
      const {close, update} = displayError(
        [
          "You seem to have no connection to the internet.",
          "Retrying as soon as you connect to the internet.",
        ].join('<br/>')
      );

      await awaitInternetConnection();

      update(
        [
          "You now seem to be connected to the network.",
          "Retrying...",
        ].join('<br/>')
      );
      const response = await getResponse(close);
      return response;
    }

    async function handlePeriodicRetry(message) {
      const {close, update} = displayError(message);

      await wait(timeLeft => {
        update(
          [
            message,
            "Retrying in "+timeLeft+".",
          ].join('<br/>')
        );
      });

      update(
        [
          message,
          "Retrying now...",
        ].join('<br/>')
      );

      const response = await getResponse(close);
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
