import {Console, getServerDownSimulator} from '../utils';
import React from 'react';
import ReactDOM from 'react-dom';
import {ToastContainer, toast as reactToastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import handli from 'handli';

export {run};
export {console};

const toasterRoot = document.body.appendChild(document.createElement('div'));
const toastContainer = (
  <ToastContainer
    position="top-right"
    autoClose={false}
    newestOnTop={false}
    closeOnClick={false}
    rtl={false}
    pauseOnVisibilityChange={false}
    draggable={false}
  />
);
ReactDOM.render(toastContainer, toasterRoot);

const {serverDownSimulator, fetch} = getServerDownSimulator();

const console = new Console();

function toast(msg) {
  const div = __html => <div dangerouslySetInnerHTML={{__html}}/>;
  const toastId = reactToastify.error(
    div(msg),
    {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    }
  );
  const update = msg => reactToastify.update(toastId, {render: div(msg)});
  const close = () => reactToastify.dismiss(toastId);
  return {update, close};
}

async function run() {
const showMessage = msg => {
  uiBlocker.enable();
  const toaster = toast(msg);
  return {
    update: msg => toaster.update(msg),
    close: () => {
      uiBlocker.disable();
      toaster.close();
    }
  };
};

// Because our toaster doesn't block the UI,
// we need to block it ourselfs
const {body} = document;
const uiBlocker = {
  enable: () =>
    body.classList.add('disableRun'),
  disable: () =>
    body.classList.remove('disableRun'),
};

serverDownSimulator.install();
setTimeout(serverDownSimulator.remove, 4000);

const response = await handli(
  () => fetch('data.json'),
  {showMessage}
);


console.log(
  "+++ Response +++",
  await response.text()
);
}
