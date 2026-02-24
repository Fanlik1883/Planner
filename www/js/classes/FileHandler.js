class FileHandler {
  constructor() {
    // Кэшируем ссылки на элементы DOM для модального окна
    this.modal = document.getElementById('filePutModal');
    this.overlay = document.getElementById('filePutOverlay');
    this.fileInput = document.getElementById('fileInput');
  }

  // Преобразует строку с URL (разделённых ';') в теги и вставляет их в редакторы
  getFilesFrom(data) {
    const fileList = data.split(';');
    const files = []; // массив для возврата, если потребуется

    fileList.forEach(fileUrl => {
      fileUrl = 'http://allfilmbook.ru/project/' + fileUrl;
      const isImage = fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png');
      const lastIndex = fileUrl.lastIndexOf('/');
      const remaining = fileUrl.substring(lastIndex + 1);
      const tag = isImage
        ? `<img src="${fileUrl}" alt="${remaining}" align="none">`
        : `<a href="${fileUrl}">${remaining}</a>`;

      // Вставка в редакторы (глобальный объект nicEditors)
      const editor2 = nicEditors.findEditor('Form2_description');
      if (editor2) {
        editor2.setContent(editor2.getContent() + '<br>' + tag + '<br>');
      }
      const editor1 = nicEditors.findEditor('Form1_description');
      if (editor1) {
        editor1.setContent(editor1.getContent() + '<br>' + tag + '<br>');
      }

      files.push(tag);
    });

    return files; // возвращаем массив созданных тегов
  }

  // Показывает модальное окно для вставки файлов
  FilePut() {
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  // Закрывает модальное окно и очищает поле ввода
  closeFilePut() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
    this.fileInput.value = ''; // очистка поля
  }

  // Обработчик отправки данных из модального окна
  submitFilePut() {
    const fileInfo = this.fileInput.value;
    this.getFilesFrom(fileInfo);
    this.closeFilePut();
  }
}