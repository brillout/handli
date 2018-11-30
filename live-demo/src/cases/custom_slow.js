import {Console, wait, getSlowInternetSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {slowInternetSimulator, fetch, handli} = getSlowInternetSimulator(1100);

async function run() {
slowInternetSimulator.install();

const response = await handli(
  () => fetch('data.json'),
  // You need to provide a `timeout`
  // for Handli to handle slow connections.
  {
    // Let's be generous
    timeout: 3000,
    thresholdSlowInternet: 1000,
    thresholdNoInternet: 2000,
  }
);

console.log(await response.text());
}
