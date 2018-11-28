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
        <img
          src="logo.svg"
          height="34"
          style={{marginRight: 10, marginBottom: -5}}
          alt="Handli"
        />
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
      <Columns>
        <Column title={'Expected'} className='cls_green'>
          <CaseExplanation>
            When the request succeeds or
            the request fails but your code handles the error.
          </CaseExplanation>
          <p>
          Handli does nothing and simply returns what your request function returns.
          </p>
          <Examples examples={examples.expected}/>
        </Column>
        <Column title={'Flaky Internet Connection'} className='cls_yellow'>
          <CaseExplanation>
            When the user is offline or
            has a poor internet connection.
          </CaseExplanation>
          <p>
          {handliBehavior}
          {' '}
          The request is retried when the user reconnects.
          </p>
          <Examples examples={examples.connection}/>
        </Column>
        <Column title={'Bug'} className='cls_red'>
          <CaseExplanation>
            When your server is not replying
            or
            replies an error that is not handled by your code.
          </CaseExplanation>
          <p>
          {handliBehavior}
          {' '}
          The request is periodically retried.
          </p>
          <Examples examples={examples.bug}/>
        </Column>
      </Columns>
      <div className="cls_gray">
        <ColumnTitle>Options</ColumnTitle>
      </div>
      <Columns className="cls_gray">
        <Column>
          <Examples examples={examples.bug}/>
        </Column>
        <Column>
          <Examples examples={examples.bug}/>
        </Column>
        <Column>
          <Examples examples={examples.bug}/>
        </Column>
      </Columns>
    </div>
  );
}
function InlineCode({children}) {
  return <pre><code>{children}</code></pre>;
}
function Columns({children, className=''}) {
  return <div className={"cls_columns "+className}>{children}</div>;
}
function ColumnTitle({children, ...props}) {
  return <h2 {...props}>{children}</h2>;
}
function Column({title, children, className=''}) {
  return (
    <div className={className+" cls_column"}>
      {title && <ColumnTitle>{title}</ColumnTitle>}
      {children}
    </div>
  );
}

function CaseExplanation({children}) {
  return <p><i>{children}</i></p>;
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

  return (
    <div className="cls_example">
      {textView}
      <div className="cls_code_section">
        {getCodView(codeSource)}
        {<ResultView {...{codeModule}}/>}
      </div>
    </div>
  );
}

function ResultView({codeModule}) {
  const [history, setHistory] = useState([]);

  return (
    <React.Fragment>
      <div>
        <span
          style={{
            textTransform: 'uppercase',
            /*
            fontSize: '1.1em',
            fontWeight: 'bold',
            letterSpacing: '1.01em',
            float: 'left',
            */
            marginRight: 10,
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '1.12px',
            color: '#afafaf',
          }}
        >
          Result
        </span>
        <button
          style={{
            /*
            textTransform: 'uppercase',
            float: 'right',
            */
          }}
          onClick={onRun}
        >Run</button>
      </div>
      { history===null ? (
          <em style={{color: '#aaa'}}>waiting result...</em>
        ) : (
          <pre><code>{history.join('\n')}</code></pre>
        )
      }
    </React.Fragment>
  );

  async function onRun() {
    setHistory(null);
    codeModule.console.history.length = 0;
    await codeModule.run();
    setHistory(codeModule.console.history);
  }
}

function getCodView(codeSource) {
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
