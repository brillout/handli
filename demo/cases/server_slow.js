import { Console, getSlowServerSimulator } from '../utils'
import handli from 'handli'

export { run }
export { console }

const { slowServerSimulator, fetch } = getSlowServerSimulator()

const console = new Console()

async function run() {
slowServerSimulator.install()

// If you provide a timeout then
// Handli handles a slow server.
handli.timeoutServer = 2000

const response = await handli(
  () => fetch('data.json')
)

console.log(
  '+++ Response +++',
  await response.text()
)
}
