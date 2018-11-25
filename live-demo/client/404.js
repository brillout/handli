import handli from 'handli';
import {fetch, console} from './utils';

export default run;

async function run() {
await handli(() => fetch('/does-not-exist'));
alert("I will never be displayed to the user :(");
}
