import {Console, getServerDownSimulator} from '../utils';
import Handli from 'handli/Handli';

export {run};
export {console};

const {serverDownSimulator, fetch} = getServerDownSimulator();
const console = new Console();

async function run() {
serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 3000);

const handli = new Handli();

const response = await handli(
  () => fetch('data.json'),
  {devMode: true}
);


console.log(
  "+++ Response +++",
  await response.text()
);
}
