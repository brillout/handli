import handli_original from 'handli';
import {Console} from '../utils';

export {run};
export {console};

const serverErrorSimulator = {
  install: () => {
    fetch = () => fetch_original('does-not-exist');
  },
  remove: () => {
    fetch = fetch_original;
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = url => handli_original(url, handliOptions);

const console = new Console();

async function run() {
serverErrorSimulator.install();
setTimeout(serverErrorSimulator.remove, 2000);

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
