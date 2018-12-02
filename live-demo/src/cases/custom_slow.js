import handli from 'handli';
import {Console, wait, getSlowInternetSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {slowInternetSimulator, fetch} = getSlowInternetSimulator(1100);

async function run() {
slowInternetSimulator.install();

// Generously increaase the timeout.
// (Note that the values are not tested against
// your server but against low-latency and
// highly-available servers such a google.com)
handli.timeout = 3000;
handli.thresholdSlowInternet = 1000;
handli.thresholdNoInternet = 2000;

const response = await handli(
  () => fetch('data.json')
);

console.log(await response.text());
}
