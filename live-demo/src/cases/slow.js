import {Console, wait, getSlowInternetSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {slowInternetSimulator, fetch, handli} = getSlowInternetSimulator();

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
