'use strict'

let counter = 0;
let rootFolder = '';
let lastUpdateDate = '';
let permissionFlag = '';
let timerId = '';

const button = document.querySelector(".open-folder");
const showUpdated = document.querySelector(".show-updated");
const treeContainer = document.querySelector(".tree");
const resultContainer = document.querySelector(".result__container");

///////
// работа со структурами
///////

// получить структуру каталога
const getStructure = async (directory) => {
  const structure = [];
  for await (const [key, value] of directory.entries()) {
    let element = ''
    if (value.kind === 'file') {
      element = await value.getFile();
    }
    structure.push({ key, value, updated: element.lastModified})
  }
  return structure;
}

// получить обновленные элементы
const getUpdated = async (directory, updatedList) => {
  for (let element of directory) {
    if (element.value.kind === 'file') {
      if (element.updated > lastUpdateDate) {
        updatedList.push(element);
      };
    } else {
      const test = await getStructure(element.value);
      await getUpdated(test, updatedList);   
    }
  }
  return updatedList;
}

///////
// создание элементов и работа с DOM
///////

// элемент для раскрывающейся папки
const createInput = (id) => {
  return `<input type="checkbox" id="${id}-${counter}"> 
  <label for="${id}-${counter}">${id}</label>`;
  // counter нужен для того чтобы избежать одинаковых id
}

// сообщение об обновлениях
const createResultMessage = (time, isChanged) => {
  const element = document.createElement(`p`);
  element.classList.add(`result__label`);
  element.classList.add(isChanged ? 'result__label--changed' : 'result__label--not-changed');
  element.textContent = `${time} ${isChanged ? 'Изменено:' : 'Изменений нет'}`
  return element;
}

// вставка элемента
const render = (container, elementToRender) => {
  container.appendChild(elementToRender);
}

// ренедринг сообщения
const renderMessage = (isChanged) => {
  const resultMessage = createResultMessage(new Date().toLocaleString(), isChanged);
  render(resultContainer, resultMessage);
}
// 

///////
// создание списков элементов
///////

// создание элемента файла или папки
const buildElement = async (name, type) => {
  counter++;
  const element = document.createElement(`li`);
  
  if (type.kind === 'directory') {
    element.classList.add('directory')
    element.innerHTML = createInput(name);
    const test = await getStructure(type);
    element.appendChild(await buildList(test));
  } else {
    element.classList.add('file')
    element.textContent = name;
  }
  return element;
}

// создание общего списка файлов
const buildList = async (folders) => {
  const list = document.createElement('ul');
  folders.sort((folder) => (folder.value.kind === 'file') ? 1 : - 1);
  for (let folder of folders) {
    const {key: name, value: type} = folder;
    const test = await buildElement(name, type);
    list.appendChild(test);
  }

  return list;
};

////////
// хэндлеры
///////

const removePrevious = () => {
  resultContainer.innerHTML = '';
  const previousList = treeContainer.querySelector('ul');
  if (previousList) {
    previousList.remove();
  }

  if (timerId) {
    clearTimeout(timerId);
  }
}

const checkUpdates = async () => {
  if (!permissionFlag) {
    return;
  }

  const elements = await getStructure(rootFolder); //получить обновленный список элементов
  const updatedFiles = await getUpdated(elements, []); // есть ли файлы который были изменены позже даты открытия

  if (updatedFiles.length !== 0) {
    const resultList = await buildList(updatedFiles);
    renderMessage(true);
    render(resultContainer, resultList);
  } else {
    const lastReslutMessage = resultContainer.querySelector('.result__label--not-changed:last-of-type');
    if (lastReslutMessage) {
      lastReslutMessage.remove();
    }
    renderMessage(false);
  }
  lastUpdateDate = new Date().getTime();
}

const openFolder = async () => {
  removePrevious();
  rootFolder = await window.showDirectoryPicker();
  const elements = await getStructure(rootFolder);
  const elementToRender = await buildList(elements);
  treeContainer.appendChild(elementToRender);
  permissionFlag = true;
  lastUpdateDate = new Date().getTime();
  timerId = setInterval(checkUpdates, 1000);
}

///////
// обработчики
//////

button.addEventListener('click', openFolder);
showUpdated.addEventListener('click', checkUpdates);
