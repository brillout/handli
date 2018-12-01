const assert = require('reassert');

module.exports = checkInternetConnection;

async function checkInternetConnection(timeout) {
  assert.usage(
    timeout,
    {timeout},
    "`checkInternetConnection` requires argument `timeout`",
  );
  let noInternet = false;
  let noLanConnection = hasNoLanConnection();
  let fastestPing;

  if( noLanConnection ) {
    noInternet = true;
  } else {
    fastestPing = await getFastestPing(timeout);
    assert.internal(fastestPing===null || fastestPing>=0);
    if( fastestPing===null ) {
      noInternet = true;
    }
  }

  /*
  console.log(noInternet);
  console.log(fastestPing);
  */

  return {
    noInternet,
    hasNoLanConnection,
    fastestPing,
    awaitInternetConnection,
  }
}
function hasNoLanConnection() {
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
  const fastestPing = await PromiseRaceSuccess([
    pingImage('https://www.google.com/favicon.ico', timeout),
    pingImage('https://www.facebook.com/favicon.ico', timeout),
    pingImage('https://www.cloudflare.com/favicon.ico', timeout),
    pingImage('https://www.amazon.com/favicon.ico', timeout),
    /*
    pingImage('https://www.apple.com/favicon.ico', timeout),
    pingImage('https://www.microsoft.com/favicon.ico', timeout),
    */
  ]);
  assert.internal(fastestPing===null || fastestPing>=0);
  return fastestPing;
}
function PromiseRaceSuccess(promises) {
  // Promise.race doesn't ignore rejected promises
  let resolve;
  const racePromise = new Promise(r => resolve=r);
  Promise.all(
    promises
    .map(async pingPromise => {
      const rtt = await pingPromise;
      /*
      console.log(rtt, pingPromise.imgUrl);
      */
      assert.internal(rtt===null || rtt>=0);
      if( rtt ) {
        resolve(rtt);
      }
    })
  )
  .then(() => {
    resolve(null);
  });
  return racePromise;
}
function pingImage(imgUrl, timeout) {
  assert.internal(imgUrl);
  let resolve;
  const pingPromise = new Promise(r => resolve=r);
  const img = document.createElement('img');

  img.onload = () => resolve(new Date() - start);
  img.onerror = () => resolve(null);
  if( timeout ) setTimeout(() => resolve(null), timeout);

  const start = new Date().getTime();
  const src = imgUrl + '?_=' + start;
  img.src = src;

  pingPromise.imgUrl = src;

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
