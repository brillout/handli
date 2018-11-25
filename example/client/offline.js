import handli_original from 'handli';
import {fetch, console} from './utils';

const offlineSimulator = {
  install: () => {
    handliOptions.alwaysAvailableResources = ['/fake-always-available-resource'];
    fetch = () => fetch_original('/does-not-exist');
  },
  remove: () => {
    delete handliOptions.alwaysAvailableResources;
    fetch = fetch_original;
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = url => handli_original(url, handliOptions);

export default run;

async function run() {
offlineSimulator.install();

const response = await handli(() => {
  try {
    return fetch('/game-of-thrones.json');
  } finally {
    offlineSimulator.remove();
  }
});

alert([
  "I am displayed only after the second attempt.",
  "+++Response+++",
  response
].join('\n'));
}
