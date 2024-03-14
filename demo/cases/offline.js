import handli from 'handli'
import { Console, wait, getOfflineSimulator } from '../utils'

export { run }
export { console }

const console = new Console()

const { offlineSimulator, fetch } = getOfflineSimulator()

async function run() {
offlineSimulator.install()
setTimeout(offlineSimulator.remove, 2000)

const response = await handli(
  () => fetch('data.json')
)

console.log(
  '+++ Response +++',
  await response.text()
)
}
