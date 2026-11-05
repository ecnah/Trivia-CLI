'use strict';

const readline = require('node:readline');
const { performance } = require('node:perf_hooks');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const questions = [
  { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'print', 'define'], answer: 1 },
  { question: 'Which method creates a new array by transforming each element?', options: ['push()', 'map()', 'pop()', 'join()'], answer: 1 },
  { question: 'What does CLI stand for?', options: ['Command-Line Interface', 'Code Logic Input', 'Computer Link Internet', 'Command List Index'], answer: 0 },
  { question: 'Which operator checks strict equality?', options: ['=', '==', '===', '!='], answer: 2 },
  { question: 'Which function runs code after a delay?', options: ['setTimeout()', 'console.log()', 'parseInt()', 'filter()'], answer: 0 },
  { question: 'Which data structure stores ordered values?', options: ['Array', 'Boolean', 'Number', 'Function'], answer: 0 },
  { question: 'What does JSON stand for?', options: ['JavaScript Object Notation', 'Java Source Object Network', 'JavaScript Online Node', 'Joined Script Object Name'], answer: 0 },
  { question: 'Which method can combine array values into one result?', options: ['reduce()', 'slice()', 'includes()', 'shift()'], answer: 0 },
];

function ask(prompt) {
  return new Promise(resolve => rl.question(prompt, answer => resolve(answer.trim())));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Each question has a time limit. A timeout ends the current question.
async function askTimed(prompt, seconds) {
  return new Promise(resolve => {
    process.stdout.write(prompt);
    let settled = false;
    const onLine = line => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rl.removeListener('line', onLine);
      resolve({ answer: line.trim(), timedOut: false });
    };
    rl.on('line', onLine);
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      rl.removeListener('line', onLine);
      console.log('\n⏰ Time is up!');
      resolve({ answer: '', timedOut: true });
    }, seconds * 1000);
  });
}

async function playGame() {
  const timeLimit = 15;
  let score = 0;
  const results = [];
  console.log('\n🎮 Welcome to JavaScript Trivia CLI!');
  console.log(`Answer ${questions.length} questions. You have ${timeLimit} seconds per question.`);
  console.log('Choose A, B, C or D and press Enter.\n');
  await delay(500);
  const started = performance.now();

  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];
    console.log(`\nQuestion ${i + 1}/${questions.length}: ${item.question}`);
    item.options.forEach((option, index) => console.log(`  ${'ABCD'[index]}. ${option}`));
    const questionStart = performance.now();
    const response = await askTimed(`Your answer (${timeLimit}s): `, timeLimit);
    const elapsed = Math.min(timeLimit, (performance.now() - questionStart) / 1000);
    const choice = response.answer.toUpperCase();
    const selected = 'ABCD'.indexOf(choice);
    const correct = !response.timedOut && selected === item.answer;
    if (correct) {
      score++;
      console.log('✅ Correct!');
    } else {
      console.log(`❌ ${response.timedOut ? 'No answer received.' : 'Incorrect.'} Correct answer: ${'ABCD'[item.answer]}. ${item.options[item.answer]}`);
    }
    results.push({ number: i + 1, correct, elapsed });
  }

  const totalSeconds = (performance.now() - started) / 1000;
  const percent = Math.round((score / questions.length) * 100);
  console.log('\n========== FINAL RESULTS ==========');
  console.log(`Score: ${score}/${questions.length} (${percent}%)`);
  console.log(`Total time: ${totalSeconds.toFixed(1)} seconds`);
  console.log(`Correct: ${score} | Incorrect/timed out: ${questions.length - score}`);
  console.log(percent >= 80 ? '🏆 Excellent work!' : percent >= 50 ? '👍 Good effort! Keep practicing.' : '📚 Keep learning and try again!');
  console.log('Question review:');
  results.forEach(result => console.log(`  Q${result.number}: ${result.correct ? 'Correct' : 'Incorrect'} (${result.elapsed.toFixed(1)}s)`));
}

async function main() {
  try {
    let again = 'y';
    while (again === 'y' || again === 'yes') {
      await playGame();
      again = (await ask('\nPlay again? (y/n): ')).toLowerCase();
    }
    console.log('\nThanks for playing! Goodbye.');
  } finally {
    rl.close();
  }
}

main().catch(error => {
  console.error('Unexpected error:', error.message);
  rl.close();
  process.exitCode = 1;
});
