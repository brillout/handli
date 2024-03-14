import handli from 'handli'
import { Console } from '../utils'
import assert from 'reassert'

export { run }
export { console }

const console = new Console()

async function run() {
const err = await handli(async () => {
  try {
    return await (
      fetch('https://doesnt-exist.example.org')
    )
  } catch (err) {
    return 'This error is custom handled.'
  }
})

console.log('+++ Handled error +++', err)
}
