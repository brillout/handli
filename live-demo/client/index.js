import handli from 'handli';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './index.css';
import {readFileSync} from 'fs';
import 'babel-polyfill';
import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

//setTimeout(() => require('./success'), 2000);
//const response = handli(() => Fetch('/does-not-exist'));

ReactDOM.render(
  <LiveDemo/>,
  document.body.appendChild(document.createElement('div'))
);

function LiveDemo() {
  return (
    <React.Fragment>
      <h1>
        <img src="/logo.svg" height="34" style={{marginRight: 10, marginBottom: -5}}/>
        Handli
      </h1>
      <Intro/>
    </React.Fragment>
  );
}

function Intro() {
  const examples = getExamples();
  const handliBehavior = (
    <span>
      Handli
      blocks the UI,
      blocks the code (it doesn't resolve nor rejects the promise),
      and shows an error message to the user.
    </span>
  );
  return (
    <div>
      <div className="cls_cases">
        <Case title={'Expected'} className='cls_expected'>
          When the request succeeded or
          the request failed but your code handled the error.
          <br/>
          Handli does nothing and simply returns what your request function returns.
          <Examples examples={examples.expected}/>
        </Case>
        <Case title={'Flaky Internet Connection'} className='cls_internet'>
          When the user is offline or
          has a poor internet connection.
          <br/>
          {handliBehavior}
          <Examples examples={examples.connection}/>
        </Case>
        <Case title={'Bug'} className='cls_bug'>
          When your server is not replying
          or
          when the server replies with an error that is not handled by your code.
          <br/>
          {handliBehavior}
          <Examples examples={examples.bug}/>
        </Case>
      </div>
    </div>
  );
}
function InlineCode({children}) {
  return <pre><code>{children}</code></pre>;
}
function Case({title, children, className}) {
  return (
    <div className={className+" cls_case"}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function getExamples() {
  const examples = {
    expected: [
      [
        readFileSync(__dirname+'/cases/success.js', 'utf-8'),
        require('./cases/success'),
        'Success',
        <div>
          When the server replies with a 2xx status code.
        </div>
      ],
      [
        readFileSync(__dirname+'/cases/expected_error.js', 'utf-8'),
        require('./cases/expected_error.js'),
        'Handled Error',
        <div>
          When you handle the error.
        </div>
      ],
    ],
    connection: [
      [
        readFileSync(__dirname+'/cases/offline.js', 'utf-8'),
        require('./cases/offline.js'),
        'Offline',
        <div>
          When the user is not connected to the internet.
        </div>
      ],
      [
        readFileSync(__dirname+'/cases/slow.js', 'utf-8'),
        require('./cases/slow.js'),
        'Slow Internet',
        <div>
          When the user has a slow internet connection.
        </div>
      ],
    ],
    bug: [
      [
        readFileSync(__dirname+'/cases/bug.js', 'utf-8'),
        require('./cases/bug.js'),
        'Unhandled Error',
        <div>
         When the server replies with a status code other than 2xx.
        </div>
      ],
      [
        readFileSync(__dirname+'/cases/server_down.js', 'utf-8'),
        require('./cases/server_down.js'),
        'Server Down',
        <div>
          When the server isn't replying.
        </div>
      ],
    ],
  };

  return examples;
}

function Examples({examples}) {
  return (
    <div>{
      examples.map((example, key) =>
        <Example {...{example, key}}/>
      )
    }</div>
  );
}

function Example({example: [codeSource, codeModule, title, description]}) {
  const textView = (
    <div>
      <h3>{title}</h3>
      {description}
    </div>
  );

  const codeView = (
    <div>{
      ViewCode(codeSource)
    }</div>
  );

  const resultView = (
    <Result {...{codeModule}}/>
  );

  return (
    <div className="cls_example">
      {textView}
      {codeView}
      {resultView}
    </div>
  );
}

function Result({codeModule}) {
  const [history, setHistory] = useState(codeModule.console.history);

  return (
    <div>
      <button onClick={onClick}>Run</button>
      <pre><code>{history.join('\n')}</code></pre>
    </div>
  );

  async function onClick() {
    codeModule.console.history.length = 0;
    setHistory(codeModule.console.history);
    await codeModule.run();
    setHistory(codeModule.console.history);
  }
}

function ViewCode(codeSource) {
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
