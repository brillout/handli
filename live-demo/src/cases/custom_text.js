import handli from 'handli';
import {Console, getServerErrorSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {serverErrorSimulator, fetch} = getServerErrorSimulator();

async function run() {
serverErrorSimulator.install();
setTimeout(serverErrorSimulator.remove, 2000);

// Inspect `handli.messages` to
// see The list of messages.
handli.messages.ERROR = (
  'An unexpected error occured, sorry.\n\n'+
  'We have been notified and we are \n'+
  'working on fixing the issue.\n'
);
handli.messages.RETRYING_IN = (
  sec => "Reytring in: "+sec
);

const response = await handli(
  () => fetch('data.json')
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
