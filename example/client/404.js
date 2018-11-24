import handli from 'handli';

export default run;

async function run() {
const response = await handli(() => fetch('/does-not-exist'));
alert("I will never be displayed to the user :(");
}
