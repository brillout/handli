module.exports = showMessages;

function showMessages(html, isWarning) {
  const modalEl = window.document.createElement('div');
  const id = '@brillout/fetch-error-handler/modal';
  modalEl.id = id;
  Object.assign(modalEl.style, {
    zIndex: 10000000,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const modalBodyEl = window.document.createElement('div');
  modalEl.appendChild(modalBodyEl);
  Object.assign(modalBodyEl.style, {
    padding: '10px 20px',
    borderRadius: '5px',
    borderWidth: '0 0 0 10px',
    borderStyle: 'solid',
    borderColor: isWarning ? '#fff252' : '#ff6868',
    background: 'white',
    display: 'flex',
  });

  /*
  const modalImageEl = window.document.createElement('div');
  modalBodyEl.appendChild(modalImageEl);
  modalImageEl.innerHTML = "\u26A0";
  Object.assign(modalImageEl.style, {
    fontSize: '3em',
    paddingRight: '20px',
  });
  */

  const modalContentEl = window.document.createElement('div');
  modalBodyEl.appendChild(modalContentEl);
  Object.assign(modalContentEl.style, {
    alignSelf: 'center',
  });

  const overflow_original = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.body.appendChild(modalEl);

  update(html);

  return {close, update};

  function close() {
    document.body.style.overflow = overflow_original;
    modalEl.parentElement.removeChild(modalEl);
  }
  function update(html) {
    modalContentEl.innerHTML = html;
  }
}
