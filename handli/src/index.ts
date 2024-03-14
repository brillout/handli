import Handli from './Handli'
import showMessage from './showMessage'
import messages from './messages'
import checkInternetConnection from './checkInternetConnection'
import { assertWarning } from './utils/assert'

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
    assertWarning(false, "We didn't `window.handli = new Handli()` because `window.handli` is already defined", {
      onlyOnce: true,
    })
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
