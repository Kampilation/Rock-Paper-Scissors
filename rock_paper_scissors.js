const videoElement = document.getElementById('videoElement');
        const computerChoiceElement = document.getElementById('computerChoice');
        const resultElement = document.getElementById('result');
        const playButton = document.getElementById('playButton');

        let model;
        let stream;

        async function setupCamera() {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            return new Promise(resolve => {
                videoElement.onloadedmetadata = () => {
                    resolve(videoElement);
                };
            });
        }

        async function loadHandposeModel() {
            model = await handpose.load();
        }

        async function detectHand() {
            const predictions = await model.estimateHands(videoElement);
            if (predictions.length > 0) {
                const fingers = predictions[0].annotations;
                const isClosed = fingers.indexFinger[3][1] > fingers.indexFinger[0][1] &&
                                 fingers.middleFinger[3][1] > fingers.middleFinger[0][1] &&
                                 fingers.ringFinger[3][1] > fingers.ringFinger[0][1] &&
                                 fingers.pinky[3][1] > fingers.pinky[0][1];

                if (isClosed) {
                    return 'rock';
                } else {
                    const isScissors = fingers.indexFinger[3][1] < fingers.indexFinger[0][1] &&
                                       fingers.middleFinger[3][1] < fingers.middleFinger[0][1] &&
                                       fingers.ringFinger[3][1] > fingers.ringFinger[0][1] &&
                                       fingers.pinky[3][1] > fingers.pinky[0][1];
                    return isScissors ? 'scissors' : 'paper';
                }
            }
            return null;
        }

        function getComputerChoice() {
            const choices = ['rock', 'paper', 'scissors'];
            return choices[Math.floor(Math.random() * choices.length)];
        }

        function determineWinner(playerChoice, computerChoice) {
            if (playerChoice === computerChoice) return 'It\'s a tie!';
            if ((playerChoice === 'rock' && computerChoice === 'scissors') ||
                (playerChoice === 'paper' && computerChoice === 'rock') ||
                (playerChoice === 'scissors' && computerChoice === 'paper')) {
                return 'You win!';
            }
            return 'Computer wins!';
        }

        async function playGame() {
            playButton.disabled = true;
            const computerChoice = getComputerChoice();
            computerChoiceElement.textContent = `Computer's choice: ${computerChoice}`;

            let playerChoice;
            while (!playerChoice) {
                playerChoice = await detectHand();
            }

            const result = determineWinner(playerChoice, computerChoice);
            resultElement.textContent = `You chose ${playerChoice}. ${result}`;
            playButton.disabled = false;
        }

        async function initTensorFlow() {
            await tf.ready();
            console.log('TensorFlow.js initialized');
        }

        async function init() {
            try {
                await initTensorFlow();
                await setupCamera();
                await loadHandposeModel();
                playButton.addEventListener('click', playGame);
                console.log("Initialization complete");
            } catch (error) {
                console.error("Initialization failed:", error);
            }
        }

        // Wait for the DOM to load before initializing
        document.addEventListener('DOMContentLoaded', init);