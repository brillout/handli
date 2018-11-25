import handli from 'handli';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './index.css';
import {readFileSync} from 'fs';
import 'babel-polyfill';

//setTimeout(() => require('./success'), 2000);
//const response = handli(() => Fetch('/does-not-exist'));

const ul = document.createElement('div');
ul.classList.add('use_case_list');
document.body.appendChild(ul);

addExample(
  readFileSync(__dirname+'/success.js', 'utf-8'),
  require('./success').default,
  'Success',
  [
    'bla',
    'blu'
  ].join('<br/>')
);

addExample(
  readFileSync(__dirname+'/offline.js', 'utf-8'),
  require('./offline.js').default,
  'Offline'
  [
    'bla',
    'blu'
  ].join('<br/>'),
);

addExample(
  readFileSync(__dirname+'/404.js', 'utf-8'),
  require('./404.js').default,
  '404'
  [
    'bla',
    'blu'
  ].join('<br/>'),
);

function addExample(codeSource, run, title, description) {
  let html;
  html = '<h2>'+title+'</h2>';

  codeSource = stripContext(codeSource);
  html += (
    '<pre><code class="language-javascript">'+
    Prism.highlight(codeSource, Prism.languages.javascript, 'javascript')+
    '</code></pre>'
  );

  html += '<button>Run</button>';

  const li = document.createElement('div');
  li.innerHTML = html;
  ul.appendChild(li);

  const btn = li.querySelector('button');
  btn.onclick = run;
}

function stripContext(codeSource) {
  const codeSourceLines = codeSource.split('\n');
  const runFnLine = codeSourceLines.findIndex(line => line.includes('function run'));
  return codeSourceLines.slice(runFnLine+1, -2).join('\n');
}

if (module.hot) {
  module.hot.accept(function () {
    setTimeout(() => {
      location.reload();
    }, 1000);
  });
}
