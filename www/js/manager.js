var file_list; // Список файлов
var file_dir = ''; // Папка
var SelectFileData = ''; // Выделенный файл или папка
var CopyPastDate = ''; // Данные для вставки и копирования

class FileManager {
  constructor() {
    this.FileManager = document.getElementById('file-manager-container');
    this.init();
  }

  init() {
    setTimeout(() => this.UpdateList(), 500);
    this.bindFileUpload();
  }

  HideView() {
    if (this.FileManager.style.display == 'block') {
      this.FileManager.style.display = 'none';
    } else {
      this.FileManager.style.display = 'block';
    }
  }

  UpdateList() {
    const directoryPathElement = document.getElementById('DirectoryPath');
    if (directoryPathElement) {
      directoryPathElement.innerHTML = 'Путь: ' + file_dir;
    }

    fetch('https://api.allfilmbook.ru/FileManager/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'UserName=' + encodeURIComponent(user.UserName) + '&UserHash=' + encodeURIComponent(user.UserHash) + '&type=ListFiles&dates=' + encodeURIComponent(file_dir),
    })
      .then((response) => {
        // Проверка статуса ответа
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Проверка структуры полученных данных
        if (!data || !Array.isArray(data.files)) {
          throw new Error('Некорректный формат данных от сервера');
        }

        const files = data.files;
        file_list = files; // предполагается глобальная переменная file_list

        // Удаление старых элементов списка
        const oldFileElements = document.querySelectorAll('.file-list');
        oldFileElements.forEach((el) => el.remove());

        const container = document.getElementById('file-lists');
        if (!container) {
          throw new Error('Контейнер file-lists не найден');
        }

        // Создание новых элементов
        files.forEach((item) => {
          const fileListItem = document.createElement('div');
          fileListItem.classList.add('file-list');

          const fileIcon = document.createElement('img');
          fileIcon.alt = item.name;
          const displayName = this.truncateFileName(item.name);

          if (item.file === true) {
            fileIcon.src = this.getIconPath(item.ext);
          } else {
            fileIcon.src = 'img/icon/file/folder.png';
          }

          fileListItem.appendChild(fileIcon);

          const filenameElement = document.createElement('div');
          filenameElement.textContent = displayName;
          filenameElement.id = item.name; // потенциально небезопасно, но оставлено как в оригинале
          filenameElement.classList.add('filename');
          fileListItem.appendChild(filenameElement);

          container.appendChild(fileListItem);
          fileIcon.addEventListener('click', this.SelectFile());
        });
      })
      .catch((error) => {
        console.error('Ошибка в UpdateList:', error);
        alert('Не удалось загрузить список файлов: ' + error.message);
        const container = document.getElementById('file-lists');
        if (container) {
          container.innerHTML = ''; // очищаем контейнер
          const errorDiv = document.createElement('div');
          errorDiv.textContent = 'Ошибка загрузки. Попробуйте позже.';
          errorDiv.style.color = 'red';
          container.appendChild(errorDiv);
        }
      });
  }

  truncateFileName(fileName) {
    const maxLength = 16;
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex < maxLength) {
      return fileName;
    } else {
      return fileName.substring(0, maxLength - 4) + fileName.substring(dotIndex);
    }
  }

  getIconPath(extension) {
    const iconMap = {
      aac: 'aac.png',
      c: 'c.png',
      doc: 'doc.png',
      flv: 'flv.png',
      iso: 'iso.png',
      mid: 'mid.png',
      odt: 'odt.png',
      php: 'php.png',
      rar: 'rar.png',
      tga: 'tga.png',
      xlsx: 'xlsx.png',
      aiff: 'aiff.png',
      cpp: 'cpp.png',
      dotx: 'dotx.png',
      gif: 'gif.png',
      java: 'java.png',
      mp3: 'mp3.png',
      otp: 'otp.png',
      png: 'png.png',
      rb: 'rb.png',
      tgz: 'tgz.png',
      xml: 'xml.png',
      ai: 'ai.png',
      css: 'css.png',
      dwg: 'dwg.png',
      h: 'h.png',
      hpp: 'hpp.png',
      js: 'js.png',
      mp4: 'mp4.png',
      ott: 'ott.png',
      psd: 'psd.png',
      sass: 'sass.png',
      sql: 'sql.png',
      bmp: 'bmp.png',
      dmg: 'dmg.png',
      exe: 'exe.png',
      ics: 'ics.png',
      less: 'less.png',
      ods: 'ods.png',
      pdf: 'pdf.png',
      qt: 'qt.png',
      txt: 'txt.png',
      wav: 'wav.png',
      zip: 'zip.png',
    };

    const lowerCaseExtension = extension.toLowerCase();
    if (iconMap[lowerCaseExtension]) {
      return `img/icon/file/${iconMap[lowerCaseExtension]}`;
    } else {
      return `img/icon/file/_blank.png`;
    }
  }

  DownloadSelectFile() {
    $.post(
      'https://api.allfilmbook.ru/FileManager/',
      {
        type: 'DownloadFile',
        dates: file_dir + '/' + SelectFileData,
        UserName: user.UserName,
        UserHash: user.UserHash,
      },
      (response) => {
        let res = JSON.parse(response);
        var fileURI = encodeURI(res.href);
        showNotification('Загрузка...');
        if (planer.platform == 'browser') {
          this.downloadFileBrowser(fileURI, SelectFileData);
        } else {
          this.downloadFileAndroid(fileURI, SelectFileData);
        }
      },
    );
  }

  downloadFileAndroid(url, filename) {
    var fileURL = cordova.file.externalRootDirectory + 'Download/' + filename;
    var fileTransfer = new FileTransfer();

    window.resolveLocalFileSystemURL(fileURL, (fileEntry) => {
      const fileNameParts = filename.split('.');
      const name = fileNameParts[0];
      const extension = fileNameParts[1] || '';
      var currentDate = new Date();
      fileURL = cordova.file.externalRootDirectory + 'Download/' + name + currentDate.getFullYear() + '_' + (currentDate.getMonth() + 1) + '_' + currentDate.getDate() + '_' + currentDate.getHours() + '_' + currentDate.getMinutes() + '_' + currentDate.getSeconds() + '.' + extension;
    });

    setTimeout(() => {
      fileTransfer.download(
        url,
        fileURL,
        (entry) => {
          showNotification('Загрузка <a onclick=\"openFileInExternalApp(' + fileURL + ');\">' + filename + '</a> завершена.');
        },
        (error) => {
          let message;
          switch (error.code) {
            case 1:
              message = 'Файл не найден';
              break;
            case 2:
              message = 'Недопустимый URL';
              break;
            case 3:
              message = 'Ошибка подключения';
              break;
            case 4:
              message = 'Отмена операции';
              break;
            case 5:
              message = 'Файл не был изменен';
              break;
            default:
              message = 'Нет соответствия кода ошибки';
          }
          showNotification('Произошла ошибка загрузки: ' + error.source + ' ' + message);
        },
      );
    }, 200);
  }

  async downloadFileBrowser(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      return true;
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      showNotification('Произошла ошибка загрузки: ' + error);
      return false;
    }
  }

  OpenFolder(selectedFile) {
    file_dir = file_dir + '/' + selectedFile;
    this.UpdateList();
  }

  CutDir(str) {
    const lastSlashIndex = str.lastIndexOf('/');
    return str.slice(0, lastSlashIndex);
  }

  GoBack() {
    file_dir = this.CutDir(file_dir);
    this.UpdateList();
  }

  bindFileUpload() {
    setTimeout(() => {
      $('#preloader').hide();
      $('#file').bind('change', (event) => {
        var data = new FormData();
        var error = '';
        data.append('UserName', user.UserName);
        data.append('UserHash', user.UserHash);
        data.append('dates', file_dir);
        data.append('type', 'uploadFile');

        jQuery.each($('#file')[0].files, (i, file) => {
          if (file.name.length < 1) {
            error = error + ' Файл имеет неправильный размер! ';
          }
          data.append('file-' + i, file);
        });

        if (error != '') {
          $('#info').html(error);
        } else {
          $.ajax({
            url: 'https://api.allfilmbook.ru/FileManager/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            beforeSend: () => {
              $('#preloader').show();
            },
            success: (data) => {
              $('#info').html(data);
              $('#preloader').hide();
              this.UpdateList();
            },
            error: (xhr, status, error) => {
              $('#info').html('Ошибка загрузки: ' + error);
              $('#preloader').hide();
            },
          });
        }
      });
    }, 500);
  }

  DeleteFileDir() {
    var file = file_dir + '/' + SelectFileData;
    $.post(
      'https://api.allfilmbook.ru/FileManager/',
      {
        type: 'DeleteFileDir',
        dates: file_dir + '/' + SelectFileData,
        UserName: user.UserName,
        UserHash: user.UserHash,
      },
      (response) => {
        visualpanel.HideMessage('Modal_Head_Delete');
        this.UpdateList();
      },
    );
  }

  AddDir() {
    var Folder = document.getElementById('CreateFolderName').value;
    $.post(
      'https://api.allfilmbook.ru/FileManager/',
      {
        type: 'CreateDirectory',
        dates: file_dir + '/' + Folder,
        UserName: user.UserName,
        UserHash: user.UserHash,
      },
      (response) => {
        visualpanel.HideMessage('Modal_Head_CreateFolder');
        document.getElementById('CreateFolderName').value = '';
        this.UpdateList();
      },
    );
  }

  SelectFile() {
    let lastTap = 0;
    let timeout;

    return (event) => {
      const selectedFile = event.target.alt;
      const fileListDivs = document.querySelectorAll('.file-list');

      fileListDivs.forEach((div) => {
        div.classList.remove('select');
        SelectFileData = selectedFile;
      });
      event.target.parentNode.classList.toggle('select');

      const curTime = new Date().getTime();
      const tapLen = curTime - lastTap;
      if (tapLen < 500 && tapLen > 0) {
        event.preventDefault();
        if (event.target.parentNode.classList[1] == 'select') {
          var FileSelect = file_list.find((item) => item.name == selectedFile);
          if (FileSelect.file == true) this.DownloadSelectFile();
          else this.OpenFolder(selectedFile);
        }
      } else {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
        }, 500);
      }
      lastTap = curTime;
    };
  }

  CopyFile() {
    var file = file_dir + '/' + SelectFileData;
    CopyPastDate = CopyPastDate + file + ';';
  }

  openFileInExternalApp(url) {
    cordova.plugins.fileOpener2.open(url, 'application/x-bittorrent');
  }
}

const fileManager = new FileManager();

