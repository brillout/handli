import handli from 'handli';

export default run;

async function run() {
const response = await handli(() => fetch('/game-of-thrones.json'));
const data = await response.text();
alert("+++ Response +++\n"+data);
}
