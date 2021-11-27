'use strict'
import { get, set } from 'idb-keyval';

let counter = 0;
let rootFolder = '';
let lastUpdateDate = '';
let permissionFlag = '';

const button = document.querySelector(".open-folder");
const showUpdated = document.querySelector(".show-updated");
const treeContainer = document.querySelector(".tree");
const resultContainer = document.querySelector(".result");

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

const createInput = (id) => {
  return `<input type="checkbox" id="${id}-${counter}">
  <label for="${id}-${counter}">${id}</label>`;
}

const createResultMessage = (time, isChanged) => {
  console.log(isChanged);
  const element = document.createElement(`p`);
  element.classList.add(`result__label`);
  element.classList.add(isChanged ? 'result__label--changed' : 'result__label--not-changed');
  element.textContent = `${time} ${isChanged ? 'Изменения есть' : 'Изменений нет'}`
  return element;
}

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

const buildElement = async (name, type) => {
  counter++;
  const element = document.createElement(`li`);
  
  if (type.kind === 'directory') {
    element.classList.add('directory')
    element.innerHTML = createInput(name);
    const test = await getStructure(type);
    element.appendChild(buildList(test));
  } else {
    element.classList.add('file')
    element.textContent = name;
  }
  return element;
}

const buildList = (folders) => {
  const list = document.createElement('ul');
  folders.sort((folder) => (folder.value.kind === 'file') ? 1 : - 1);
  folders.forEach(async (element) => {
    const {key: name, value: type} = element;
    list.appendChild(await buildElement(name, type))
  });
  return list;
};

const buildUpdates = async (folders) => {
  const list = document.createElement('ul');
  folders.forEach(async (element) => {
    const {key: name, value: type} = element;
    list.appendChild(await buildElement(name, type))
  });
  return list;
}

button.addEventListener('click', async (evt) => {
  rootFolder = await window.showDirectoryPicker();
  const elements = await getStructure(rootFolder);
  treeContainer.appendChild(buildList(elements));
  permissionFlag = true;
});

showUpdated.addEventListener('click', async (evt) => {
  if (!permissionFlag) {
    return;
  }

  const elements = await getStructure(rootFolder);
  const test = await getUpdated(elements, []);
  console.log(test);

  if (test.length !== 0) {
    const result = await buildUpdates(test);
    console.log(result);
    resultContainer.appendChild(createResultMessage(new Date().toLocaleString(), true));
    resultContainer.appendChild(result);
  } else {
    const lastReslutMessage = resultContainer.querySelector('.result__label--not-changed:last-of-type');
    if (lastReslutMessage) {
      lastReslutMessage.remove();
    }
    resultContainer.appendChild(createResultMessage(new Date().toLocaleString(), false))
  }
  lastUpdateDate = new Date().getTime();
  
});

lastUpdateDate = new Date().getTime();