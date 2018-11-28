import handli_original from 'handli';
import {Console, wait} from '../utils';

export {run};
export {console};

const console = new Console();

const offlineSimulator = {
  install: () => {
    handliOptions.checkInternetConnection = async () => {
      return {
        noInternet: true,
        awaitInternetConnection: () => wait(2.2),
      };
    };
    fetch = () => fetch_original('http://non-existent-server.example.org/non-existent-resource');
  },
  remove: () => {
    delete handliOptions.checkInternetConnection;
    fetch = fetch_original;
  },
};

const fetch_original = fetch;
const handliOptions = {};
const handli = url => handli_original(url, handliOptions);

async function run() {
offlineSimulator.install();
setTimeout(offlineSimulator.remove, 2000);

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
