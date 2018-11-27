import handli_original from 'handli';
import {Console} from '../utils';

export {run};
export {console};

const console = new Console();

const offlineSimulator = {
  install: () => {
    handliOptions.alwaysAvailableResources = ['fake-always-available-resource'];
    fetch = () => fetch_original('does-not-exist');
  },
  remove: () => {
    delete handliOptions.alwaysAvailableResources;
    fetch = fetch_original;
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = url => handli_original(url, handliOptions);

async function run() {
offlineSimulator.install();

setTimeout(() => {
  offlineSimulator.remove();
}, 4000);

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
