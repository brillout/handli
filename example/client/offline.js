import handli as handli_original from 'handli';

const handliOptions
const handli
const handliOptions = {
  alwaysAvailableResources: ['/fake-always-available-resource'],
};

export default run;

async function run() {
const response = await handli(
  async () => {
    if( handliOptions.alwaysAvailableResources ) {
      try {
        return fetch('/does-not-exist');
      } finally {
        delete handliOptions.alwaysAvailableResources;
      }
    }
    return fetch('/game-of-thrones.json');
  },
  handliOptions
);
alert("I am displayed only after the second attempt");
}

async function run() {
offlineSimulator.install();

const response = await handli(() => {
  try {
    return fetch('/game-of-thrones.json');
  } finally {
    offlineSimulator.remove();
  }
});

const data = await response.text();

alert("+++ Response +++\n"+data);
}
