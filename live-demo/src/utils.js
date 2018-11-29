import handli_original from 'handli';

export {fetch};
export {Console};
export {wait};
export {getServerDownSimulator};
export {getOfflineSimulator};
export {getServerErrorSimulator};

async function fetch(url) {
  const response = await window.fetch(url);
  return await response.text();
}

function Console() {
  const history = [];

  return {history, log};

  function log(...args) {
    window.console.log(...args);
    history.push(args.join('\n'));
  }
}

function wait(seconds) {
  let resolve;
  const p = new Promise(r => resolve=r);
  setTimeout(resolve, seconds*1000);
  return p;
}

function getServerDownSimulator() {
  const fetch = url => {
    if( installed ) {
      return window.fetch('http://does-not-exist.example.org/foo');
    } else {
      return window.fetch(url);
    }
  };

  let installed = false;
  const serverDownSimulator = {
    install: () => {installed = true},
    remove: () => {installed = false},
  };

  return {serverDownSimulator, fetch};
}

function getOfflineSimulator() {
  let installed = false;
  let resolveInternet = null;
  let alreadyRemoved = null;
  const offlineSimulator = {
    install: () => {
      resolveInternet = null;
      alreadyRemoved = null;
      installed = true;
      handliOptions.checkInternetConnection = async () => {
        return {
          noInternet: true,
          awaitInternetConnection: () => {
            const internetPromise = new Promise(r => resolveInternet=r);
            if( alreadyRemoved ) {
              resolveInternet();
            }
            return internetPromise;
          },
        };
      };
    },
    remove: () => {
      delete handliOptions.checkInternetConnection;
      installed = false;
      if( resolveInternet === null ) {
        alreadyRemoved = true;
      }
      resolveInternet();
    },
  };

  const fetch = url => {
    if( installed ) {
      return window.fetch('http://does-not-exist.example.org/foo');
    } else {
      return window.fetch(url);
    }
  };

  const handliOptions = {};
  const handli = (url, opts) => handli_original(url, {...opts, ...handliOptions});

  return {offlineSimulator, handli, fetch};
}

function getServerErrorSimulator() {
  let installed;
  const serverErrorSimulator = {
    install: () => {
      installed = true;
    },
    remove: () => {
      installed = false;
    },
  };
  const fetch = url => {
    if( installed ) {
      return window.fetch('does-not-exist.lol');
    } else {
      return window.fetch(url);
    }
  };

  return {serverErrorSimulator, fetch};
}
