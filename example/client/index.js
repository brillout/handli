import handli from 'handli';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './index.css';
import {readFileSync} from 'fs';
import 'babel-polyfill';

//setTimeout(() => require('./success'), 2000);
//const response = handli(() => Fetch('/does-not-exist'));

addExample(
  readFileSync(__dirname+'/success.js', 'utf-8'),
  require('./success').default,
  'Success'
);

addExample(
  readFileSync(__dirname+'/404.js', 'utf-8'),
  require('./404.js').default,
  '404'
);

function addExample(codeSource, run, description) {
  let html;
  html = '<h2>'+description+'</h2>';

  codeSource = stripContext(codeSource);
  html += (
    '<pre><code class="language-javascript">'+
    Prism.highlight(codeSource, Prism.languages.javascript, 'javascript')+
    '</code></pre>'
  );

  html += '<button>Run</button>';

  const li = document.createElement('li');
  li.innerHTML = html;
  const ul = document.querySelector('ul');
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
