import handli from 'handli';

export {fetch};
export {Console};
export {wait};
export {getServerDownSimulator};
export {getOfflineSimulator};
export {getServerErrorSimulator};
export {getSlowInternetSimulator};

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
  const offlineSimulator = {
    install: () => {
      installed = true;
      handli.checkInternetConnection = async () => {
        return {
          noInternet: true,
          noLanConnection: true,
          awaitInternetConnection: () => {
            if( !installed ) {
              return;
            }
            return new Promise(r => resolveInternet=r);
          },
        };
      };
    },
    remove: () => {
      delete handli.checkInternetConnection;
      installed = false;
      if( resolveInternet ) {
        resolveInternet();
      }
    },
  };

  const fetch = url => {
    if( installed ) {
      return window.fetch('http://does-not-exist.example.org/foo');
    } else {
      return window.fetch(url);
    }
  };

  return {offlineSimulator, fetch};
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

function getSlowInternetSimulator(fastestPing=500) {
  let installed;
  const slowInternetSimulator = {
    install: () => {
      handli.checkInternetConnection = async () => {
        wait(fastestPing/1000);
        return {
          noInternet: false,
          fastestPing,
        };
      };
      installed = true;
    },
  };

  const fetch = async url => {
    if( installed ) {
      await wait(4);
    }
    return window.fetch(url);
  };

  return {slowInternetSimulator, fetch};
}

