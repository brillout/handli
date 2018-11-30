import handli from 'handli';
import {Console, getServerErrorSimulator} from '../utils';

export {run};
export {console};

const console = new Console();

const {serverErrorSimulator, fetch} = getServerErrorSimulator();

async function run() {
serverErrorSimulator.install();
setTimeout(serverErrorSimulator.remove, 2000);

// The list of messages can be found at
// require('handli/messages.js');
const messages = {
  ERROR: (
    'An unexpected error occured, sorry.\n\n'+
    'We have been notified and we are \n'+
    'working on fixing the issue.'
  ),
  RETRYING_IN: sec => "\nReytring in: "+sec,
};

const response = await handli(
  () => fetch('data.json'),
  {messages}
);

console.log(
  "+++ Response +++",
  await response.text()
);
}
