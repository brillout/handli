import handli from 'handli';
import {Console, wait, getSlowInternetSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {slowInternetSimulator, fetch} = getSlowInternetSimulator(1100);

async function run() {
slowInternetSimulator.install();

// Set a generous request timeout.
// (When setting `timeout` Handli will
// handle a slow internet as well as a
// slow server.)
handli.timeout = 3000;

// The thresholds are not tested against
// your server but against low-latency and
// highly-available servers such a google.com
handli.thresholdSlowInternet = 1000;
handli.thresholdNoInternet = 2000;

const response = await handli(
  () => fetch('data.json')
);

console.log(await response.text());
}
