import './customStyle.css';
import {Console, wait, getOfflineSimulator} from '../../utils';

export {run};
export {console};

const console = new Console();
const {offlineSimulator, handli, fetch} = getOfflineSimulator();

async function run() {
offlineSimulator.install();
setTimeout(offlineSimulator.remove, 3000);

const resp = await handli(() => fetch('data.json'));

console.log(await resp.text());
}
