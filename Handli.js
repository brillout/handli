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

    /*
    */
		console.log(response, await response.text(), response.ok, response.statusCode);
    if( response.ok ) {
      return response;
    }

    throw new Error(response.statusText);

    return;

    async function getResponse(close) {
      try {
        const requestPromise = makeRequest();
        console.log(requestPromise);
        const response = await requestPromise;
        if( close ) close();
        return response;
      } catch(_) {
        if( close ) close();
        return handleNoconnection();
      }
    }

    async function handleNoconnection() {
      if( await noInternet() ) {
        const {close, update} = displayError(
          [
            "You seem to have no connection to the internet.",
            "Retrying as soon as you connect to the internet.",
          ].join('<br/>')
        );

        await awaitInternetConnection();

        update(
          [
            "You seem to have an internet connection now.",
            "Retrying now...",
          ].join('<br/>')
        );
        const response = await getResponse(close);
        return response;
      }

      const message = "Cannot connect to server.";
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

// TODO ping some always available resources to check internet connection
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
