export {fetch};
export {Console};

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
