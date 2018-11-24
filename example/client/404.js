import handli from 'handli';

(async () => {
  const response = await handli(() => fetch('/does-not-exist'));
  alert("I will never be displayed to the user :(");
})();
