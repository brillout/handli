const assert = require('reassert');

module.exports = checkInternetConnection;

async function checkInternetConnection(timeout) {
  assert.usage(
    timeout,
    {timeout},
    "`checkInternetConnection` requires argument `timeout`",
  );
  let noInternet = false;
  let fastestPing;

  if( noLanConnection() ) {
    noInternet = true;
  } else {
    fastestPing = await getFastestPing(timeout);
    assert.internal(fastestPing===null || fastestPing>=0);
    if( fastestPing===null ) {
      noInternet = true;
    }
  }

  console.log(noInternet);
  console.log(fastestPing);

  return {
    noInternet,
    fastestPing,
    awaitInternetConnection,
  }
}
function noLanConnection() {
  return window.navigator.onLine===false;
}
function hasLanConnection() {
  return window.navigator.onLine===true;
}
function noLanConnectionInfo() {
  return ![true, false].includes(window.navigator.onLine);
}
async function awaitInternetConnection() {
  await awaitLanConnection();
  await awaitPing();
}
async function awaitLanConnection() {
  if( hasLanConnection() ) {
    return;
  }
  if( noLanConnectionInfo() ) {
    return;
  }

  let resolve;
  const promise = new Promise(r => resolve=r);
  window.addEventListener('online', resolve);

  await promise;
}
async function getFastestPing(timeout) {
  const start = new Date();
  const allRejected = await PromiseRaceSuccess([
    pingImage('https://google.com/favicon.ico', timeout),
    pingImage('https://amazon.com/favicon.ico', timeout),
    pingImage('https://apple.com/favicon.ico', timeout),
    pingImage('https://facebook.com/favicon.ico', timeout),
  ]);
  assert.internal([true, false].includes(allRejected));
  if( allRejected ) return null;
  return new Date() - start;
}
function PromiseRaceSuccess(promises) {
  // Promise.race doesn't ignore rejected promises
  let resolve;
  const racePromise = new Promise(r => resolve=r);
  Promise.all(
    promises
    .map(async pingPromise => {
      const success = await pingPromise;
      assert.internal([true, false].includes(success));
      if( success ) {
        resolve(false);
      }
    })
  )
  .then(() => {
    resolve(true);
  });
  return racePromise;
}
async function pingImage(imgUrl, timeout) {
  assert.internal(imgUrl);
  const pingPromise = new Promise(r => resolve=r);
  const img = document.createElement('img');

  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  if( timeout ) setTimeout(() => resolve(false), timeout);

  const epochTime = new Date().getTime();
  img.src = imgUrl + '?_=' + epochTime;

  return pingPromise;
}
async function awaitPing() {
  while(true) {
    const fastestPing = await getFastestPing();
    assert.internal(fastestPing===null || fastestPing>=0);
    if( fastestPing !== null ) return;
    await wait(0.5);
  }
}
function wait(seconds) {
  let resolve;
  const p = new Promise(r => resolve=r);
  setTimeout(resolve, seconds*1000);
  return p;
}
