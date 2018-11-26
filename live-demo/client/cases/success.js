import handli from 'handli';
import {Console} from '../utils';

export {run};
export {console};

const console = new Console();

async function run() {
const response = await handli(
  () => fetch('/data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
