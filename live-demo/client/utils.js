import handli_original from 'handli';

export {fetch};
export {Console};
export {wait};
export {getServerDownSimulator};
export {getOfflineSimulator};

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
  const offlineSimulator = {
    install: () => {
      handliOptions.checkInternetConnection = async () => {
        return {
          noInternet: true,
          awaitInternetConnection: () => wait(2.2),
        };
      };
      installed = true;
    },
    remove: () => {
      delete handliOptions.checkInternetConnection;
      installed = false;
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
