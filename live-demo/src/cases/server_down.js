import {Console, getServerDownSimulator} from '../utils';

export {run};
export {console};

const {serverDownSimulator, fetch, handli} = getServerDownSimulator();
const console = new Console();

async function run() {
serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 3000);

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
