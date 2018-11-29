import {Console, getServerDownSimulator} from '../utils';
import handli from 'handli';

export {run};
export {console};

const {serverDownSimulator, fetch} = getServerDownSimulator();
const console = new Console();

async function run() {
serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 3000);

const response = await handli(
  () => fetch('data.json'),
  {devMode: true}
);


console.log(
  "+++ Response +++",
  await response.text()
);
}
