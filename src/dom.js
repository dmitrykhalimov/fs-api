///////
// создание элементов и работа с DOM
///////

import { MessageState } from "./constants";

// элемент для раскрывающейся папки
const createInput = (id, counter) => {
  return `<input type="checkbox" id="${id}-${counter}"> 
  <label for="${id}-${counter}">${id}</label>`;
  // counter нужен для того чтобы избежать одинаковых id
}

// сообщение об обновлениях
const createResultMessage = (currentState) => {
  const time = new Date().toLocaleString();
  const element = document.createElement(`p`);
  
  element.classList.add(`result__label`);
  element.classList.add(currentState.class);
  element.textContent = `${time} ${currentState.message}`
  
  return element;
}

// вставка элемента
const render = (container, elementToRender) => {
  container.appendChild(elementToRender);
}

// вставка сообщения
const renderMessage = (currentState, resultContainer) => {
  let resultMessage = '';

  if (currentState.state === MessageState.NO_CHANGES.state) {
    const lastReslutMessage = resultContainer.querySelector('.result__label--not-changed:last-of-type');
    if (lastReslutMessage) {
      lastReslutMessage.remove();
    }
  }

  resultMessage = createResultMessage(currentState);
  render(resultContainer, resultMessage);
}

const removeFileTree = (treeContainer) => {
  const fileTree = treeContainer.querySelector('ul');
  if (fileTree) {
    fileTree.remove();
  }
}

export {
  createInput,
  render,
  renderMessage,
  removeFileTree,
}