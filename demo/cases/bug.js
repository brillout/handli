import handli from 'handli'
import { Console, getServerErrorSimulator } from '../utils'

export { run }
export { console }

const console = new Console()

const { serverErrorSimulator, fetch } = getServerErrorSimulator()

async function run() {
serverErrorSimulator.install()
setTimeout(serverErrorSimulator.remove, 2000)

const response = await handli(
  () => fetch('data.json')
)

console.log(
  '+++ Response +++',
  await response.text()
)
}
