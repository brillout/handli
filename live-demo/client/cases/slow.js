import handli_original from 'handli';
import {Console, wait} from '../utils';

export {run};
export {console};

const console = new Console();

const slowInternetSimulator = {
  install: () => {
    handliOptions.checkInternetConnection = () => {
      return {
        noInternet: false,
        slowInternet: true,
      };
    };
    fetch = async url => {
      await wait(3);
      return fetch_original(url);
    };
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = (url, opts) => handli_original(url, {...opts, ...handliOptions});

async function run() {
slowInternetSimulator.install();

const response = await handli(
  () => fetch('data.json'),
  // If you provide a timeout then
  // Handli shows a warning modal.
  {timeout: 1} // Timeout of 1 second
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
