import handli_original from 'handli';
import {Console, wait} from '../utils';

export {run};
export {console};

const console = new Console();

const slowInternetSimulator = {
  install: () => {
    handliOptions.checkInternetConnection = async () => {
      const fastestPing = 500;
      wait(fastestPing/1000);
      return {
        noInternet: false,
        fastestPing,
      };
    };
    fetch = async url => {
      await wait(3);
      return window.fetch(url);
    };
  },
};

let fetch;
const handliOptions = {};
const handli = (url, opts) => handli_original(url, {...opts, ...handliOptions});

async function run() {
slowInternetSimulator.install();

const response = await handli(
  () => fetch('data.json'),
  // If you provide a timeout then
  // Handli handles slow connections.
  {timeout: 1000} // Timeout of 1 second
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
