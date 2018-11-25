import handli from 'handli';
import {fetch, console} from './utils';

export default run;

async function run() {
const response = await handli(() =>
  fetch('/game-of-thrones.json')
);

alert("+++ Response +++\n"+data);
}
