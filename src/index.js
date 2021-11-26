'use strict'

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Работает
} else {
  alert('File API не поддерживается данным браузером');
}

const button = document.querySelector(".open-folder");
const treeContainer = document.querySelector(".tree");

const getStructure = async (directory) => {
  const structure = [];
  for await (const [key, value] of directory.entries()) {
    structure.push({ key, value })
  }
  return structure;
}

const buildElement = async (name, type) => {
  const element = document.createElement(`li`);
  
  if (type.kind === 'directory') {
    element.classList.add('folder')
    const paragraph = document.createElement(`p`);
    paragraph.textContent = name;
    const test = await getStructure(type);
    element.appendChild(paragraph);
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
  evt.preventDefault();
  const dir = await window.showDirectoryPicker();
  const elements = await getStructure(dir);
  treeContainer.appendChild(buildList(elements));
});

