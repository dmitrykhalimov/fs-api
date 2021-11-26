'use strict'

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Работает
} else {
  alert('File API не поддерживается данным браузером');
}

const button = document.querySelector(".open-folder");
const treeContainer = document.querySelector(".tree");

const buildElement = (name, type) => {
  const element = document.createElement(`li`)
  element.textContent = name;
  return element;
}

const buildList = (folders) => {
  const list = document.createElement('ul');
  folders.forEach((element) => {
    const {key: name, value: type} = element;
    list.appendChild(buildElement(name, type))
  });
  return list;
};

button.addEventListener('click', async (evt) => {
  evt.preventDefault();
  const dir = await window.showDirectoryPicker();
  const structure = [];
  for await (const [key, value] of dir.entries()) {
    structure.push({ key, value })
  }
  console.log(structure);
  console.log(buildList(structure));
  console.log(treeContainer);
  treeContainer.appendChild(buildList(structure));
});

