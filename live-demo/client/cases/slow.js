import handli_original from 'handli';
import {Console} from '../utils';

export {run};
export {console};

const console = new Console();

const slowInternet = {
  install: () => {
    handliOptions.alwaysAvailableResources = ['/fake-always-available-resource'];
    fetch = () => fetch_original('/does-not-exist');
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = url => handli_original(url, handliOptions);

async function run() {
slowInternetSimulator.install();

const response = await handli(
  () => fetch('/data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
