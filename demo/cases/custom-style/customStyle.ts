import handli from 'handli'
import { Console, wait, getOfflineSimulator } from '../../utils'

export { run }
export { console }

const console = new Console()
const { offlineSimulator, fetch } = getOfflineSimulator()

const id = 'custom_style'
const addCss = async () => {
  const customCss = (await import('./customStyle.css?raw')).default

  const styleEl = window.document.createElement('style')
  Object.assign(styleEl, {
    id,
    type: 'text/css',
    innerHTML: customCss,
  })
  document.head.appendChild(styleEl)
}
const removeCss = () => {
  const styleEl = document.getElementById(id)
  styleEl.parentElement.removeChild(styleEl)
}

async function run() {
  offlineSimulator.install()
  setTimeout(offlineSimulator.remove, 2000)

  await addCss()
  let resp
  try {
    resp = await handli(() => fetch('data.json'))
  } finally {
    removeCss()
  }

  console.log(await resp.text())
}
