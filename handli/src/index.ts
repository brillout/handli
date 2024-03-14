// @ts-ignore
import assert from 'reassert'
import Handli from './Handli'
import showMessage from './showMessage'
import messages from './messages'
import checkInternetConnection from './checkInternetConnection'

// @ts-ignore
const handli = new Handli()

Object.assign(handli, {
  showMessage,
  checkInternetConnection,
  messages,
})

export default handli

if (typeof window !== 'undefined') {
  if ('handli' in window) {
    assert.warning(false, "We didn't `window.handli = new Handli()` because `window.handli` is already defined")
  } else {
    // @ts-ignore
    window.handli = handli
  }
}

/*
function showMessage(...args) {
  console.log(...args);
  return {close: () => {console.log('close');}, update: (...args) => {console.log(...args)}};
}
*/
