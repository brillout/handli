import handli from 'handli'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import './style.css'
import React from 'react'
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

main()

async function main() {
  const examples = await loadExamples()
  ReactDOM.render(<LiveDemo examples={examples} />, document.body.appendChild(document.createElement('div')))
}

function LiveDemo({ examples }: { examples: ExampleType[] }) {
  return (
    <React.Fragment>
      <Header />
      <Intro examples={examples} />
    </React.Fragment>
  )
}

function Header() {
  const githubIcon = (
    <img
      src="https://github.com/favicon.ico"
      height="18"
      style={{
        verticalAlign: 'middle',
        marginTop: -4,
        marginRight: -1,
      }}
      alt="github.com/"
    />
  )
  const handliIcon = (
    <img
      src={import.meta.env.BASE_URL + 'logo.svg'}
      height="40"
      style={{ verticalAlign: 'middle', marginTop: -3 }}
      alt="Handli"
    />
  )
  return (
    <h1
      style={{
        width: '100%',
        textAlign: 'center',
        paddingTop: 50,
        marginBottom: 10,
        fontSize: '1.05em',
        boxSizing: 'border-box',
        fontWeight: 'normal',
      }}
    >
      <a href="https://github.com/brillout/handli" style={{ textDecoration: 'none', paddingLeft: 3 }}>
        {handliIcon}
        <br />
        <div style={{ paddingTop: 11 }}>{githubIcon} brillout/handli</div>
      </a>
    </h1>
  )
}

function Intro({ examples }: { examples: ExampleType[] }) {
  const handliBehavior = (
    <span>
      Handli blocks the UI, blocks the code (it doesn't resolve nor rejects the promise), and shows an error message to
      the user.
    </span>
  )
  return (
    <ColumnsWrapper>
      <Columns>
        <Column title={'Expected'} className="cls_green">
          <CaseExplanation>
            When the request succeeds or the request fails but your code handles the error.
          </CaseExplanation>
          <p>Handli does nothing and simply returns what your request function returns.</p>
          <Examples examples={examples.filter(([category]) => category === 'expected')} />
        </Column>
        <Column title={'Flaky Internet Connection'} className="cls_yellow">
          <CaseExplanation>When the user is offline or has a poor internet connection.</CaseExplanation>
          <p>{handliBehavior} The request is retried when the user reconnects.</p>
          <Examples examples={examples.filter(([category]) => category === 'connection')} />
        </Column>
        <Column title={'Bug'} className="cls_red">
          <CaseExplanation>
            When your server is not replying or replies with an error not handled by your code.
          </CaseExplanation>
          <p>{handliBehavior} The request is periodically retried.</p>
          <Examples examples={examples.filter(([category]) => category === 'bug')} />
        </Column>
      </Columns>
      {/*
      <div className="cls_gray" style={{textAlign: 'center'}}>
        <ColumnTitle style={{display: 'inline-block'}}>Options</ColumnTitle>
      </div>
      */}
      <Columns className="cls_gray">
        <Column>
          <ColumnTitle id="options">Options</ColumnTitle>
          <Examples examples={examples.filter(([category]) => category === 'options1')} />
        </Column>
        <Column>
          <ColumnTitlePlaceholder />
          <Examples examples={examples.filter(([category]) => category === 'options2')} />
        </Column>
        <Column>
          <ColumnTitlePlaceholder />
          <Examples examples={examples.filter(([category]) => category === 'options3')} />
        </Column>
      </Columns>
    </ColumnsWrapper>
  )
}
function InlineCode({ children }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  )
}
function ColumnsWrapper({ children }) {
  return <div className={'cls_columns_wrapper'}>{children}</div>
}
function Columns({ children, className = '' }) {
  return <div className={'cls_columns ' + className}>{children}</div>
}
function ColumnTitle({ children, ...props }) {
  return <h2 {...props}>{children}</h2>
}
function ColumnTitlePlaceholder() {
  return <ColumnTitle style={{ opacity: 0 }}>I'm invisible</ColumnTitle>
}
function Column({ title, children, className = '' }: any) {
  return (
    <div className={className + ' cls_column'}>
      {title && <ColumnTitle>{title}</ColumnTitle>}
      {children}
    </div>
  )
}

function CaseExplanation({ children }) {
  return (
    <p>
      <i>{children}</i>
    </p>
  )
}

async function loadExamples() {
  const examplesPromise: ExamplePromise[] = [
    [
      'expected',
      import('./cases/success?raw'),
      import('./cases/success'),
      'Success',
      <div>When the server replies with a 2xx status code.</div>,
    ],
    [
      'expected',
      import('./cases/expected_error.js?raw'),
      import('./cases/expected_error.js'),
      'Handled Error',
      <div>When the server replies with an error handled by your code.</div>,
    ],
    [
      'connection',
      import('./cases/offline.js?raw'),
      import('./cases/offline.js'),
      'Offline',
      <div>When the user is not connected to the internet.</div>,
    ],
    [
      'connection',
      import('./cases/slow.js?raw'),
      import('./cases/slow.js'),
      'Slow Internet',
      <div>When the user has a slow internet connection.</div>,
    ],
    [
      'bug',
      import('./cases/bug.js?raw'),
      import('./cases/bug.js'),
      'Unhandled Error',
      <div>When the server replies with an error not handled by your code.</div>,
    ],
    [
      'bug',
      import('./cases/server_slow.js?raw'),
      import('./cases/server_slow.js'),
      'Unresponsive Server',
      <div>When the server is down or taking a long time to reply.</div>,
    ],
    [
      'options1',
      import('./cases/retryTimer.js?raw'),
      import('./cases/retryTimer.js'),
      'Retry Timer',
      <div>Customize when the request is retried.</div>,
    ],
    [
      'options1',
      import('./cases/custom_slow.js?raw'),
      import('./cases/custom_slow.js'),
      'Custom Slow Threshold',
      <div>Customize when Handli considers the network to be "slow".</div>,
    ],
    [
      'options2',
      import('./cases/custom-style/customStyle.css?raw'),
      import('./cases/custom-style/customStyle.js'),
      'Custom Style',
      <div>Customize the modal.</div>,
      { codeLang: 'css', dontStrip: true },
    ],
    [
      'options2',
      import('./cases/custom_text.js?raw'),
      import('./cases/custom_text.js'),
      'Custom Text',
      <div>Customize the texts shown to.</div>,
    ],
    [
      'options3',
      import('./cases/custom-ui/customUi.jsx?raw'),
      import('./cases/custom-ui/customUi.jsx'),
      'Custom UI',
      <div>Customize how messages are shown to the user.</div>,
    ],
  ]
  const examples: ExampleType[] = await Promise.all(
    examplesPromise.map(async (examplePromise: ExamplePromise) => {
      const [category, codeSourcePromise, codeModulePromise, title, description, options] = examplePromise
      const [{ default: codeSource }, codeModule] = await Promise.all([codeSourcePromise, codeModulePromise])
      return [category, codeSource, codeModule, title, description, options]
    }),
  )

  return examples
}

function Examples({ examples }: { examples: ExampleType[] }) {
  return (
    <div>
      {examples.map((example, key) => (
        <Example {...{ example, key }} />
      ))}
    </div>
  )
}

type Category = 'expected' | 'connection' | 'bug' | 'options1' | 'options2' | 'options3'
type Options = { codeLang?: 'javascript' | 'css' | undefined | string; dontStrip?: boolean }
type ExampleBase = [Category, string, CodeModule, string, JSX.Element]
type ExampleBasePromise = [Category, Promise<{ default: string }>, Promise<CodeModule>, string, JSX.Element]
type ExampleType = ExampleBase | [...ExampleBase, Options]
type ExamplePromise = ExampleBasePromise | [...ExampleBasePromise, Options]

function Example({
  example: [_category, codeSource, codeModule, title, description, { codeLang = 'javascript', dontStrip = false } = {}],
}: { example: ExampleType }) {
  const headerId = title.toLowerCase().split(' ').join('-')
  const textView = (
    <div>
      <h3 id={headerId}>{title}</h3>
      {description}
    </div>
  )

  return (
    <div className="cls_example">
      {textView}
      <div className="cls_code_section">
        {getCodView({ codeSource, codeLang, dontStrip })}
        {<ResultView {...{ codeModule }} />}
      </div>
    </div>
  )
}

function ResultView({ codeModule }) {
  const [history, setHistory] = useState([])

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
          style={
            {
              /*
            textTransform: 'uppercase',
            float: 'right',
            */
            }
          }
          onClick={onRun}
        >
          Run
        </button>
      </div>
      {history === null ? (
        <em style={{ color: '#aaa' }}>waiting result...</em>
      ) : (
        <pre>
          <code>{history.join('\n')}</code>
        </pre>
      )}
    </React.Fragment>
  )

  async function onRun() {
    setHistory(null)
    codeModule.console.history.length = 0
    await codeModule.run()
    revertOptions()
    setHistory(codeModule.console.history)
  }
}
type CodeModule = {
  run: () => void
  console: { history: any }
}

const optionsPristine = { ...handli, messages: { ...handli.messages } }
function revertOptions() {
  Object.assign(handli, { ...optionsPristine, messages: { ...optionsPristine.messages } })
  for (let key in handli) if (!(key in optionsPristine)) delete handli[key]
}

function getCodView({ codeSource, codeLang, dontStrip }) {
  if (!dontStrip) {
    codeSource = stripContext(codeSource)
  }

  const codeHtml = Prism.highlight(codeSource, Prism.languages[codeLang], codeLang)

  return (
    <pre className={'language-' + codeLang}>
      <code className={'language-' + codeLang} dangerouslySetInnerHTML={{ __html: codeHtml }} />
    </pre>
  )
}

function stripContext(codeSource: string) {
  const codeSourceLines = codeSource.split('\n')
  const runFnLine = codeSourceLines.findIndex((line) => line.includes('function run'))
  return codeSourceLines.slice(runFnLine + 1, -2).join('\n')
}
