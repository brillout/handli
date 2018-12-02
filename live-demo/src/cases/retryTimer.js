import {Console, getServerDownSimulator} from '../utils';
import handli from 'handli';

export {run};
export {console};

const {serverDownSimulator, fetch} = getServerDownSimulator();
const console = new Console();

async function run() {
serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 5000);

handli.retryTimer = (
  seconds => seconds ? seconds+1 : 1
);

const response = await handli(
  () => fetch('data.json')
);


console.log(
  "+++ Response +++",
  await response.text()
);
}
