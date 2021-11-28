'use strict'

import {createInput, render, renderMessage, removeFileTree } from './dom';
import { MessageState } from "./constants";

let counter = 0;
let rootFolder = '';
let lastUpdateDate = '';
let permissionFlag = '';
let timerId = '';
let previousKeys = [];

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
const getUpdated = async (directory, updatedList = [], keys = []) => {
  for (let element of directory) {
    if (element.value.kind === 'file') {
      if (element.updated > lastUpdateDate) {
        updatedList.push(element);
      };
    } else {
      const subDirectory = await getStructure(element.value);
      await getUpdated(subDirectory, updatedList);   
    }
  }
  return updatedList;
}

const getKeys = async(directory, keysArray = []) => {
  for await (const [key, value] of directory.entries()) {
    keysArray.push(key);
    if (value.kind === 'directory') {
      await getKeys(value, keysArray);
    }
  }
  return JSON.stringify(keysArray);
}

///////
// создание списков элементов
///////

// создание элемента файла или папки
const buildElement = async (name, type) => {
  counter++;
  const element = document.createElement(`li`);
  
  if (type.kind === 'directory') {
    element.classList.add('directory')
    element.innerHTML = createInput(name, counter);
    const subDirectory = await getStructure(type);
    element.appendChild(await buildList(subDirectory));
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
  permissionFlag = false;
  removeFileTree(treeContainer);
  resultContainer.innerHTML = '';
  
  if (timerId) {
    clearTimeout(timerId);
  }
}

const checkUpdates = async () => {
  if (!permissionFlag) {
    return;
  }

  const newKeys = await getKeys(rootFolder); // посмотреть не изменился ли список файлов;
  
  if (previousKeys !== newKeys) {
    removeFileTree(treeContainer);

    const elements = await getStructure(rootFolder);
    const elementToRender = await buildList(elements);
    previousKeys = newKeys;
    treeContainer.appendChild(elementToRender);

    renderMessage(MessageState.CHANGED_STRUCTURE, resultContainer);
    return;
  };

  const elements = await getStructure(rootFolder); //получить обновленный список элементов
  const updatedFiles = await getUpdated(elements); // есть ли файлы который были изменены позже даты открытия

  if (updatedFiles.length !== 0) {
    renderMessage(MessageState.CHANGED_FILE, resultContainer);
    render(resultContainer, await buildList(updatedFiles));
  } else {
    renderMessage(MessageState.NO_CHANGES, resultContainer);
  }

  lastUpdateDate = new Date().getTime();
}

const openFolder = async () => {
  removePrevious();
  rootFolder = await window.showDirectoryPicker();
  const elements = await getStructure(rootFolder);
  const elementToRender = await buildList(elements);
  treeContainer.appendChild(elementToRender);
  previousKeys = await getKeys(rootFolder);
  permissionFlag = true;
  lastUpdateDate = new Date().getTime();
  // timerId = setInterval(checkUpdates, 1000);
}

///////
// обработчики
//////

button.addEventListener('click', openFolder);
showUpdated.addEventListener('click', checkUpdates);
