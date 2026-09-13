const removalRolls = new Set([1, 3, 5, 6]);
const bacteriaTypes = ['blue', 'yellow', 'red'];
let day = 0;
let population = [];
let rolling = false;
let runId = 0;
let reproductionTimer = null;

const $ = id => document.getElementById(id);

function startingPopulation() {
  return [
    ...Array.from({ length: 13 }, () => ({ type: 'blue', alive: true })),
    ...Array.from({ length: 6 }, () => ({ type: 'yellow', alive: true })),
    { type: 'red', alive: true }
  ];
}

function count(type) {
  return population.filter(bacterium => bacterium.alive && (!type || bacterium.type === type)).length;
}

function renderBacteria() {
  const layer = $('bacteria');
  layer.innerHTML = '';
  population.forEach((bacterium, index) => {
    const element = document.createElement('img');
    element.className = `bacterium ${bacterium.type}${bacterium.alive ? '' : ' removed'}`;
    element.src = `assets/bacteria/${bacterium.type}.png`;
    element.alt = `${bacterium.type} bacterium`;
    element.style.left = `${20 + (index * 29) % 60}%`;
    element.style.top = `${22 + (index * 43) % 56}%`;
    element.style.animationDelay = `-${(index % 8) * 0.24}s`;
    layer.appendChild(element);
  });
}

function renderCounts() {
  $('total').textContent = count();
  $('dishStatus').textContent = `${count()} bacteria are present`;
  $('blueKeyCount').textContent = `${count('blue')} ${count('blue') === 1 ? 'bacterium' : 'bacteria'}`;
  $('yellowKeyCount').textContent = `${count('yellow')} ${count('yellow') === 1 ? 'bacterium' : 'bacteria'}`;
  $('redKeyCount').textContent = `${count('red')} ${count('red') === 1 ? 'bacterium' : 'bacteria'}`;
}

function render() {
  $('day').textContent = day;
  $('dayTitle').textContent = day === 0 ? 'Before the first dose' : `After day ${day} of treatment`;
  renderBacteria();
  renderCounts();
}

function setDie(value) {
  $('die').dataset.value = value;
  $('die').setAttribute('aria-label', `Die showing ${value}`);
}

function removeBacteria() {
  let remaining = 5;
  for (const type of bacteriaTypes) {
    for (const bacterium of population) {
      if (remaining === 0) break;
      if (bacterium.alive && bacterium.type === type) {
        bacterium.alive = false;
        remaining -= 1;
      }
    }
  }
}

function reproduce() {
  bacteriaTypes.forEach(type => {
    if (count(type) > 0) population.push({ type, alive: true });
  });
}

function completeRoll(value, currentRun) {
  if (currentRun !== runId) return;
  const antibioticTaken = removalRolls.has(value);
  if (antibioticTaken) removeBacteria();
  renderBacteria();
  $('doseStatus').textContent = antibioticTaken ? 'Dose taken' : 'Dose missed';
  $('rollMessage').textContent = antibioticTaken ? `Roll ${value}: dose taken` : `Roll ${value}: dose missed`;
  $('dayTitle').textContent = `After day ${day} of treatment`;
  $('dishStatus').textContent = 'Bacteria are reproducing...';
  $('total').textContent = count();

  reproductionTimer = setTimeout(() => {
    if (currentRun !== runId) return;
    population = population.filter(bacterium => bacterium.alive);
    reproduce();
    render();
    $('dishStatus').textContent = `${count()} bacteria are present`;
    $('takeaway').textContent = day === 8
      ? 'The eight-day course is complete. Resistant bacteria are the most likely to remain.'
      : 'Bacteria reproduce after each day. Roll again to continue the treatment.';
    $('rollButton').disabled = day >= 8;
    $('rollButton').textContent = day >= 8 ? 'Treatment complete' : 'Roll the die';
    rolling = false;
  }, 650);
}

function rollDie() {
  if (rolling || day >= 8) return;
  rolling = true;
  $('rollButton').disabled = true;
  const currentRun = runId;
  const finalValue = Math.floor(Math.random() * 6) + 1;
  const animation = setInterval(() => setDie(Math.floor(Math.random() * 6) + 1), 75);
  $('die').classList.add('rolling');
  setTimeout(() => {
    clearInterval(animation);
    $('die').classList.remove('rolling');
    setDie(finalValue);
    day += 1;
    completeRoll(finalValue, currentRun);
  }, 600);
}

function reset() {
  runId += 1;
  clearTimeout(reproductionTimer);
  day = 0;
  population = startingPopulation();
  rolling = false;
  setDie(1);
  $('rollButton').disabled = false;
  $('rollButton').textContent = 'Roll the die';
  $('rollMessage').textContent = 'Roll to take the first dose';
  $('doseStatus').textContent = 'Ready for the first roll';
  $('takeaway').textContent = 'Each surviving type reproduces after every roll. Complete all eight days to see which bacteria remain.';
  render();
}

$('rollButton').addEventListener('click', rollDie);
$('resetButton').addEventListener('click', reset);
reset();
