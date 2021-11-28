const MessageState = {
  NO_CHANGES: {
    state: 'NO_CHANGES',
    class: 'result__label--not-changed',
    message: 'Изменений нет'
  },
  CHANGED_FILE: {
    state: 'CHANGED_FILE',
    class: 'result__label--changed',
    message: 'Изменены файлы:'
  },
  CHANGED_STRUCTURE: {
    state: 'CHANGED_STRUCTRE',
    class: 'result__label--structure',
    message: 'Произошли изменения в структуре файлов'
  },
}

export {
  MessageState,
}