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
  () => require('./success'),
  'Success'
);

addExample(
  readFileSync(__dirname+'/404.js', 'utf-8'),
  () => require('./404.js'),
  '404'
);

function addExample(code, exec, description) {
  let html;
  html = '<h2>'+description+'</h2>';
  html += (
    '<pre><code class="language-javascript">'+
    Prism.highlight(code, Prism.languages.javascript, 'javascript')+
    '</code></pre>'
  );
  html += '<button>Run</button>';

  const li = document.createElement('li');
  li.innerHTML = html;
  const ul = document.querySelector('ul');
  ul.appendChild(li);

  const btn = li.querySelector('button');
  btn.onclick = exec;
}

if (module.hot) {
  module.hot.accept(function () {
    setTimeout(() => {
      location.reload();
    }, 1000);
  });
}
