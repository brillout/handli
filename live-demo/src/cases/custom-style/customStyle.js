import {Console, wait, getOfflineSimulator} from '../../utils';
import {readFileSync} from 'fs';

export {run};
export {console};

const console = new Console();
const {offlineSimulator, handli, fetch} = getOfflineSimulator();

const customCss = readFileSync(__dirname+'/customStyle.css', 'utf-8');

const id = 'custom_style';
const addCss = () => {
  const styleEl = window.document.createElement("style");
  Object.assign(styleEl, {
    id,
    type: 'text/css',
    innerHTML: customCss,
  });
  document.head.appendChild(styleEl);
};
const removeCss = () => {
  const styleEl = document.getElementById(id);
  styleEl.parentElement.removeChild(styleEl);
};

async function run() {
offlineSimulator.install();
setTimeout(offlineSimulator.remove, 2000);

addCss();
let resp;
try {
  resp = await handli(() => fetch('data.json'));
} finally {
  removeCss();
}

console.log(await resp.text());
}
