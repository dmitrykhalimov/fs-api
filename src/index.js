'use strict'
import { get, set } from 'idb-keyval';

let counter = 0;
let rootFolder = '';
let lastUpdateDate = '';

const button = document.querySelector(".open-folder");
const showUpdated = document.querySelector(".show-updated");
const treeContainer = document.querySelector(".tree");

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

const getUpdated = async () => {
  const updated = [];
  const elements = await getStructure(rootFolder);
  elements.forEach((element) => {
    if (element.value.kind) {
      if (element.updated > lastUpdateDate) {
        updated.push(element);
      };
    }
  })
  lastUpdateDate = new Date().getTime();
  console.log(updated);
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

button.addEventListener('click', async (evt) => {
  rootFolder = await window.showDirectoryPicker();
  const elements = await getStructure(rootFolder);
  console.log(elements);
  treeContainer.appendChild(buildList(elements));
});

showUpdated.addEventListener('click', async (evt) => {
  getUpdated();
});

lastUpdateDate = new Date().getTime();