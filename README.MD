# File System Api Manager

## Features

- Позволяет построить дерево папок и файлов со вложенными файлами
- Отслеживает изменения файлов

## Технологии и отсылки

В проекте используется [File System Access API](https://wicg.github.io/file-system-access/). При разработке также были использовны материалы:
1. Документация [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API).
2. Статья [The File System Access API: simplifying access to local files](https://web.dev/file-system-access/).
3. Репозиторий [Browser-FS-Access](https://github.com/GoogleChromeLabs/browser-fs-access).

## Запуск

Проект собран на Node.JS 16.13.0 (но вероятно будет работать и на младших версиях). Так как технология экспериментальная, могут быть проблемы с совместимостью браузеров. Точно работает на Chrome 96.
[Can i use](https://caniuse.com/native-filesystem-api)

```sh
npm i
npm start
```

##### Адрес сервера locahost:9000