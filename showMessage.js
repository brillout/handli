module.exports = showMessages;

const CSS = `
body.handliModal {
  overflow: hidden !important;
}
.handliModalBackground {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 99999999999999;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.7);

  display: flex;
  align-items: center;
  justify-content: center;
}
.handliModalContent {
  padding: 10px 20px;
  border-radius: 5px;
  background: white;
  border-width: 0 0 0 10px;
  border-style: solid;
  border-color: #ff6868;
}
.handliIsWarning > * {
  border-color: #fff252;
}
`;
/*
.handliModalWrapper > :first-child > :first-child::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  border-radius
  width: 10px;
  background: red;
}
*/

function showMessages(html, isWarning) {
  addCss();
  /*
  const modalWrapper = window.document.createElement('div');
  modalWrapper.setAttribute('class', 'handliModalWrapper');
  modalWrapper.appendChild(modalBackground);
  */

  const modalBackground = window.document.createElement('div');
  modalBackground.setAttribute('class', 'handliModalBackground'+(isWarning?' handliIsWarning':''));

  const modalContent = window.document.createElement('div');
  modalContent.setAttribute('class', 'handliModalContent');
  modalBackground.appendChild(modalContent);

  /*
  const modalImageEl = window.document.createElement('div');
  modalContent.appendChild(modalImageEl);
  modalImageEl.innerHTML = "\u26A0";
  Object.assign(modalImageEl.style, {
    fontSize: '3em',
    paddingRight: '20px',
  });

  const modalContentEl = window.document.createElement('div');
  modalContent.appendChild(modalContentEl);
  Object.assign(modalContentEl.style, {
    alignSelf: 'center',
  });
  */

  const bodyCls = 'handliModal';
  document.body.classList.add(bodyCls);
  document.body.appendChild(modalBackground);

  update(html);

  return {close, update};

  function close() {
    removeElement(modalBackground);
    document.body.classList.remove(bodyCls);
  }
  function update(html) {
    modalContent.innerHTML = html;
  }
}

function removeElement(element) {
  element.parentElement.removeChild(element);
}

function prependChild(parent, child) {
  const {firstChild} = parent;
  if( ! firstChild ) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, firstChild);
  }
}

function addCss() {
  const id = 'handliStyle';
  if( document.getElementById(id) ) {
    return;
  }
  const css = window.document.createElement("style");
  Object.assign(css, {
    id,
    type: 'text/css',
    innerHTML: CSS,
  });
  //document.head -> https://caniuse.com/#feat=documenthead
  prependChild(document.head, css);
}
