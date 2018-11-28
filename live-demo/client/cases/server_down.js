import handli_original from 'handli';
import {Console} from '../utils';
import assert from 'reassert';

export {run};
export {console};

const serverDownSimulator = {
  install: () => {
    fetch = () => fetch_original('http://does-not-exist.example.org/foo');
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
