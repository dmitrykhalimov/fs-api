'use strict'

import {createInput, render, renderMessage, removeFileTree, placeRootName } from './dom';
import { MessageState } from "./constants";

const TIMER_INTERVAL = 1000;

const button = document.querySelector(".open-folder");
const showUpdated = document.querySelector(".show-updated");
const watch = document.querySelector(".enable-watch");
const treeContainer = document.querySelector(".tree");
const resultContainer = document.querySelector(".result__container");

let rootFolder = '';
let lastUpdateDate = '';
let permissionFlag = '';
let timerId = '';
let previousKeys = [];
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

// получить список всех файлов
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
  const element = document.createElement(`li`);
  
  if (type.kind === 'directory') {
    element.classList.add('directory')
    element.innerHTML = createInput(name);
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

// создание списка файлов
const createTree = async () => {
  const elements = await getStructure(rootFolder);
  const elementToRender = await buildList(elements);
  placeRootName(rootFolder.name);
  render(treeContainer, elementToRender);
}

////////
// хэндлеры и логика
///////

const removePrevious = () => {
  permissionFlag = false;
  removeFileTree(treeContainer);
  resultContainer.innerHTML = '';
  
  if (timerId) {
    clearTimeout(timerId);
    watch.textContent = 'Включить отслеживание';
  }
}

// посмотреть не изменился ли список файлов;
const checkSturcture = async () => {
  const newKeys = await getKeys(rootFolder); 
  
  if (previousKeys !== newKeys) {
    removeFileTree(treeContainer);
    createTree();

    previousKeys = newKeys;

    renderMessage(MessageState.CHANGED_STRUCTURE, resultContainer);
    return true;
  };

  return false;
}

// посмотреть не были ли отредактированы сами файлы
const checkChanged = async () => {
  const elements = await getStructure(rootFolder); //получить обновленный список элементов
  const updatedFiles = await getUpdated(elements); // есть ли файлы который были изменены позже даты открытия

  if (updatedFiles.length !== 0) {
    renderMessage(MessageState.CHANGED_FILE, resultContainer);
    render(resultContainer, await buildList(updatedFiles));
  } else {
    renderMessage(MessageState.NO_CHANGES, resultContainer);
  }
}

const checkUpdates = async () => {
  if (!permissionFlag) {
    return;
  }

  const resultStructure = await checkSturcture();
  if (resultStructure) {
    return;
  }

  await checkChanged();

  lastUpdateDate = new Date().getTime();
}

const openFolder = async () => {
  removePrevious();
  
  rootFolder = await window.showDirectoryPicker();
  createTree();

  previousKeys = await getKeys(rootFolder);
  permissionFlag = true;
  lastUpdateDate = new Date().getTime();
}

const toggleWatch = () => {
  if (!permissionFlag) {
    return;
  }

  if (!timerId) {
    watch.textContent = 'Выключить отслеживание';
    timerId = setInterval(checkUpdates, TIMER_INTERVAL);

    return;
  }

  watch.textContent = 'Включить отслеживание';
  clearTimeout(timerId);
}

///////
// обработчики
//////

button.addEventListener('click', openFolder);
showUpdated.addEventListener('click', checkUpdates);
watch.addEventListener('click', toggleWatch);