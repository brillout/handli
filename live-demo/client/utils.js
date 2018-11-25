export {fetch};

async function fetch(url) {
  const response = await window.fetch(url);
  return await response.text();
}
