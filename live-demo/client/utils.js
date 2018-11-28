import handli_original from 'handli';

export {fetch};
export {Console};
export {wait};
export {getServerDownSimulator};

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
  /*
  const handli = (url, opts) => handli_original(url, {...opts, ...handliOptions});
  const handliOptions = {};
  */
  const handli = handli_original;

  let installed = false;
  const serverDownSimulator = {
    install: () => {installed = true},
    remove: () => {installed = false},
  };

  return {serverDownSimulator, handli, fetch};
}
