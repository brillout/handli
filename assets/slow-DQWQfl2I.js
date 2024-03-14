const n=`import handli from 'handli'
import { Console, wait, getSlowInternetSimulator } from '../utils'

export { run }
export { console }

const console = new Console()

const { slowInternetSimulator, fetch } = getSlowInternetSimulator()

async function run() {
slowInternetSimulator.install()

// If you provide a timeout then
// Handli handles a slow internet.
handli.timeoutInternet = 1500

const response = await handli(
  () => fetch('data.json')
)

console.log(
  '+++ Response +++',
  await response.text()
)
}
`;export{n as default};
