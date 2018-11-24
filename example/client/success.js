import handli from 'handli';

(async () => {
  const response = await handli(() => fetch('/game-of-thrones.json'));
  const data = await response.text();
  alert("+++ Response +++\n"+data);
})();
