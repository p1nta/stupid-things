function main() {
  const initialState = {
    attemptsAllowed: 5,
    attemptsUsed: 0,
    numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    answer: ['0', '1', '2', '3'],
    currentValue: ['', '', '', ''],
  }

  let state = Object.assign({}, initialState);

  const resultElement = document.getElementById('result');
  const terminalElement = document.getElementById('terminal');
  const openSafeFormElement = document.getElementById('open_safe_form');

  const inputElement0 = document.getElementById('input_element_0');
  const inputElement1 = document.getElementById('input_element_1');
  const inputElement2 = document.getElementById('input_element_2');
  const inputElement3 = document.getElementById('input_element_3');

  /* START REGION of rendering utils  */
  function renderAttemptTitle(attempt) {
    if (terminalElement) {
      const brElement = document.createElement('br');
      const attemptElement = document.createElement('p');
      attemptElement.innerText = `# Attempt ${attempt} of ${state.attemptsAllowed}`;

      terminalElement.appendChild(brElement);
      terminalElement.appendChild(attemptElement);
    } else {
      alert('Element with ID "terminal" not found')
    }
  }

  function renderAttemptResult(reviewResult) {
    if (terminalElement) {
      const answerElement = document.createElement('p');
      answerElement.innerText = `* |${state.currentValue[0]}|${state.currentValue[1]}|${state.currentValue[2]}|${state.currentValue[3]}|`
      terminalElement.appendChild(answerElement);


      const reviewResultElement = document.createElement('p');
      reviewResultElement.innerText = `^ Present: ${reviewResult.present} RightPlace: ${reviewResult.rightPlace}`;
      terminalElement.appendChild(reviewResultElement);

      const newLineWithBorderElement = document.createElement('p');
      newLineWithBorderElement.classList.add('spred_border');
      newLineWithBorderElement.innerHTML = '&nbsp;';
      terminalElement.appendChild(newLineWithBorderElement);
    } else {
      alert('Element with ID "terminal" not found')
    }
  }

  function renderVictory() {
    const congratulationElement = document.createElement('p');
    congratulationElement.innerText = 'You WIN!';

    if (resultElement && resultElement.firstElementChild) {
      resultElement.classList.remove('hidden');
      resultElement.classList.add('visible');
      resultElement.firstElementChild.appendChild(congratulationElement);
    }
  }

  function renderDefeat() {
    const congratulationElement = document.createElement('p');
    congratulationElement.innerText = 'You LOSE!';
    console.log(resultElement);
    if (resultElement && resultElement.firstElementChild) {
      resultElement.classList.remove('hidden');
      resultElement.classList.add('visible');
      resultElement.firstElementChild.appendChild(congratulationElement);
    }
  }
  /* END REGION of rendering utils  */

  /* START REGION of game manipulations utils  */
  function restart() {
    state = Object.assign({}, initialState);
    state.answer = state.numbers.sort(() => Math.random() - Math.random()).slice(0, 4)
  }

  function validate() {
    const result = {
      present: 0,
      rightPlace: 0,
    };

    for (let i = 0; i < state.currentValue.length; i += 1) {
      const currentValueEl = state.currentValue[i];
      const index = state.answer.indexOf(currentValueEl);

      if (index === -1) {
        continue;
      }

      if (index !== i) {
        result.present += 1;

        continue;
      }

      result.present += 1;
      result.rightPlace += 1;
    }

    return result;
  }

  function onInputChange(e) {
    const input = e.target;
    const value = input.value;
    const isValidInput = value.match(/[0-9]/gi);
    input.value = isValidInput ? value[value.length - 1] : "";

    let fieldIndex = Number(input.dataset.index);

    if (fieldIndex < state.answer.length - 1 && isValidInput) {
        input.nextElementSibling.focus();
    }

    if (e.key === "Backspace" && fieldIndex > 0 && value === "") {
        input.previousElementSibling.focus();
    }
  }

  function onSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const result = [];
    
    for (const pair of formData.entries()) {
      result.push(pair[1]);
    }
    
    state.attemptsUsed += 1;
    state.currentValue = result;

    if (openSafeFormElement) {
      openSafeFormElement.reset();
    }

    const validationResult = validate();

    renderAttemptResult(validationResult);

    if (validationResult.rightPlace === state.answer.length) {
      return renderVictory()
    }

    if (state.attemptsUsed === state.attemptsAllowed) {
      return renderDefeat()
    }

    renderAttemptTitle(state.attemptsUsed + 1);

    if (inputElement0) {
      inputElement0.focus();
    }
  }

  function addListeners() {
    if (openSafeFormElement) {
      openSafeFormElement.addEventListener('submit', onSubmit);
    }

    if (inputElement0) {
      inputElement0.addEventListener('keyup', onInputChange)
    }
    if (inputElement1) {
      inputElement1.addEventListener('keyup', onInputChange)
    }
    if (inputElement2) {
      inputElement2.addEventListener('keyup', onInputChange)
    }
    if (inputElement3) {
      inputElement3.addEventListener('keyup', onInputChange)
    }
  }
  /* END REGION of game manipulations utils  */

  /* START REGION of scripts running  */
  restart();

  addListeners();

  renderAttemptTitle(state.attemptsUsed + 1);
  /* END REGION of rendering utils  */
}

window.onload = () => {
  main();
}
