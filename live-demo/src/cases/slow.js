import handli from 'handli';
import {Console, wait, getSlowInternetSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {slowInternetSimulator, fetch} = getSlowInternetSimulator();

async function run() {
slowInternetSimulator.install();

// If you provide a timeout then
// Handli handles slow connections.
handli.timeout = 1000; // Timeout of 1 second

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
