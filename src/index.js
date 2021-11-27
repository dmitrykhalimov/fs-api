'use strict'
import { get, set } from 'idb-keyval';

let counter = 0;
let rootFolder = '';

const button = document.querySelector(".open-folder");
const showUpdated = document.querySelector(".show-updated");
const treeContainer = document.querySelector(".tree");

const getStructure = async (directory) => {
  const structure = [];
  for await (const [key, value] of directory.entries()) {
    structure.push({ key, value })
  }
  return structure;
}

const createInput = (id) => {
  return `<input type="checkbox" id="${id}-${counter}">
  <label for="${id}-${counter}">${id}</label>`;
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
  await set('directory', rootFolder);
  treeContainer.appendChild(buildList(elements));
});

showUpdated.addEventListener('click', async (evt) => {
  const directoryHandleOrUndefined = await get('directory');
  const elements = await getStructure(directoryHandleOrUndefined);
  console.log(elements);
});