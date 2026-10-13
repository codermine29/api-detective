const questions = [
  {
    title: 'Which method retrieves data?',
    scenario: 'A music app needs to fetch a playlist from /api/playlists without changing anything on the server. Which HTTP method fits the request?',
    choices: ['POST', 'GET', 'PATCH', 'DELETE'],
    answer: 1,
    explanation: 'GET is used to retrieve data. It should not create, edit, or remove a resource on the server.'
  },
  {
    title: 'What does this response tell you?',
    scenario: 'You request /api/users/42. The server responds with a 404 status code. What is the most likely meaning?',
    choices: ['The server found the user', 'The request was successful', 'The requested resource was not found', 'The server is restarting'],
    answer: 2,
    explanation: '404 Not Found means the server could not find the requested resource. The server may be running correctly, but that user or path does not exist.'
  },
  {
    title: 'Which header describes the body?',
    scenario: 'A client sends a new profile as JSON. Which request header tells the server what format the request body uses?',
    choices: ['Content-Type: application/json', 'Accept-Language: en-US', 'Authorization: Bearer token', 'Cache-Control: no-cache'],
    answer: 0,
    explanation: 'Content-Type describes the format of the request body. application/json tells the server to parse the body as JSON.'
  },
  {
    title: 'Where should the filter value go?',
    scenario: 'An API request should return books published after 2020, using /api/books. Which URL correctly uses a query parameter for this optional filter?',
    choices: ['/api/books/after/2020', '/api/books?year=2020', '/api/books/year/2020', '/api/books#year=2020'],
    answer: 1,
    explanation: 'Query parameters follow a ? and are useful for optional filters or sorting. A path parameter usually identifies a specific resource, such as /books/42.'
  },
  {
    title: 'Find the bug in this handler.',
    scenario: 'A POST /api/tasks endpoint should return the new task. The handler reads the body, saves the task, then sends a response. What is wrong?',
    choices: [
      'It uses POST for creating a task',
      'It sends the response before the save operation finishes',
      'It returns a JSON response',
      'It reads the request body'
    ],
    answer: 1,
    explanation: 'If saving is asynchronous, the handler must wait for it to finish before responding, often with await. Otherwise the response can be sent before the task is actually saved.'
  }
];

let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;

const welcomeScreen = document.querySelector('#welcome-screen');
const gameScreen = document.querySelector('#game-screen');
const resultsScreen = document.querySelector('#results-screen');
const startButton = document.querySelector('#start-button');
const nextButton = document.querySelector('#next-button');
const playAgainButton = document.querySelector('#play-again-button');
const questionCount = document.querySelector('#question-count');
const questionNumber = document.querySelector('#question-number');
const questionTitle = document.querySelector('#question-title');
const scenario = document.querySelector('#scenario');
const answerList = document.querySelector('#answer-list');
const scoreDisplay = document.querySelector('#score');
const progressBar = document.querySelector('#progress-bar');
const feedback = document.querySelector('#feedback');
const feedbackIcon = document.querySelector('#feedback-icon');
const feedbackTitle = document.querySelector('#feedback-title');
const feedbackExplanation = document.querySelector('#feedback-explanation');
const finalScore = document.querySelector('#final-score');
const resultsCopy = document.querySelector('#results-copy');
const resultSealMark = document.querySelector('#result-seal-mark');

function showScreen(screenToShow) {
  [welcomeScreen, gameScreen, resultsScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startGame() {
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.textContent = score;
  showScreen(gameScreen);
  renderQuestion();
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  hasAnswered = false;
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionNumber.textContent = `${String(currentQuestionIndex + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
  questionTitle.textContent = question.title;
  scenario.textContent = question.scenario;
  progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
  feedback.hidden = true;
  nextButton.hidden = true;
  answerList.innerHTML = '';

  question.choices.forEach((choice, index) => {
    const answerButton = document.createElement('button');
    answerButton.type = 'button';
    answerButton.className = 'answer-button';
    answerButton.dataset.index = index;
    answerButton.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${choice}</span>`;
    answerButton.addEventListener('click', () => handleAnswer(index));
    answerList.append(answerButton);
  });
}

function handleAnswer(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;

  const question = questions[currentQuestionIndex];
  const isCorrect = selectedIndex === question.answer;
  const answerButtons = answerList.querySelectorAll('.answer-button');

  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) button.classList.add('correct');
    if (index === selectedIndex && !isCorrect) button.classList.add('incorrect');
  });

  if (isCorrect) {
    score += 1;
    scoreDisplay.textContent = score;
  }

  feedback.classList.toggle('incorrect', !isCorrect);
  feedbackIcon.textContent = isCorrect ? 'OK' : '!';
  feedbackTitle.textContent = isCorrect ? 'Correct evidence.' : 'Not quite.';
  feedbackExplanation.textContent = question.explanation;
  feedback.hidden = false;
  nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'View Results ->' : 'Next Question ->';
  nextButton.hidden = false;
  nextButton.focus();
}

function showNextQuestion() {
  if (!hasAnswered) return;

  if (currentQuestionIndex === questions.length - 1) {
    showResults();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
  questionTitle.focus();
}

function showResults() {
  finalScore.textContent = score;
  resultSealMark.textContent = score === questions.length ? 'OK' : '+';

  if (score === questions.length) {
    resultsCopy.textContent = 'Every clue matched. You have a sharp eye for API fundamentals.';
  } else if (score >= 3) {
    resultsCopy.textContent = 'Strong detective work. Review the clues you missed and keep following the request.';
  } else {
    resultsCopy.textContent = 'Every investigation starts with a clue. Review the explanations and try the case again.';
  }

  showScreen(resultsScreen);
  playAgainButton.focus();
}

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', showNextQuestion);
playAgainButton.addEventListener('click', startGame);
