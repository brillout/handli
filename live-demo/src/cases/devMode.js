import {Console, getServerDownSimulator} from '../utils';
import handli from 'handli';

export {run};
export {console};

const {serverDownSimulator, fetch} = getServerDownSimulator();
const console = new Console();

async function run() {
serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 3000);

// Defaults to `true` when URL is `localhost`
const devMode = true;

const response = await handli(
  () => fetch('data.json'),
  {devMode}
);


console.log(
  "+++ Response +++",
  await response.text()
);
}
