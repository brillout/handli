import handli from 'handli';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './index.css';
import {readFileSync} from 'fs';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

//setTimeout(() => require('./success'), 2000);
//const response = handli(() => Fetch('/does-not-exist'));

const examples = getExamples();

ReactDOM.render(
  <Examples {...{examples}}/>,
  document.body.appendChild(document.createElement('div'))
);

function getExamples() {
  const examples = [
    [
      readFileSync(__dirname+'/success.js', 'utf-8'),
      require('./success').default,
      'Success',
      <div>
        The request was successful.
      </div>
    ],
    [
      readFileSync(__dirname+'/offline.js', 'utf-8'),
      require('./offline.js').default,
      'Offline',
      <div>
        This when the user is not connted to the internet.
      </div>
    ],
    [
      readFileSync(__dirname+'/404.js', 'utf-8'),
      require('./404.js').default,
      'Error',
      <div>
        This happens when:
        <ul>
          <li>1xx</li>
          <li>3xx</li>
          <li>4xx</li>
          <li>5xx</li>
        </ul>
        We treat all this because Handli is assumed to be used by 
        because the user doesn't care.
        The only thing the user wants to be toled that something went wrong.
        He doesn't care if the error was an internal server error,
        or a resource that doesn't exist anymore.
      </div>
    ],
  ];

  return examples;
}

function Examples({examples}) {
  return (
    <div className='cls_examples'>{
      examples.map((example, key) =>
        <Example {...{example, key}}/>
      )
    }</div>
  );
}

function Example({example: [codeSource, run, title, description]}) {
  const leftView = (
    <div>
      <h2>{title}</h2>
      {description}
    </div>
  );

  const middleView = (
    <div>{
      CodeView(codeSource)
    }</div>
  );
  return (
    <React.Fragment>
      {leftView}
      {middleView}
    </React.Fragment>
  );
}

function CodeView(codeSource) {
  codeSource = stripContext(codeSource);

  const codeHtml = Prism.highlight(
    codeSource,
    Prism.languages.javascript,
    'javascript',
  );

  return (
    <pre>
      <code
        className="language-javascript"
        dangerouslySetInnerHTML={{__html: codeHtml}}
      />
    </pre>
  );
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
