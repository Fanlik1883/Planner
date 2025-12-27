var file_list; // Список файлов
var file_dir=''; // Папка
var SelectFileData=''; // Выделенный файл или папка
var CopyPastDate=''; // Данные для вставки и копирования
setTimeout(UpdateList,500);
//UpdateList()
function UpdateList() {

  document.getElementById('DirectoryPath').innerHTML='Путь: '+file_dir;
fetch('https://api.allfilmbook.ru/FileManager/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'UserName='+UserName+'&UserHash='+ UserHash+'&type=ListFiles&dates='+file_dir 
})
  .then(response => response.json())
  .then(data => {
	  data=data.files;
    file_list=data;

    const fileElements = document.querySelectorAll('.file-list');

    if (fileElements.length > 0) {
      fileElements.forEach(fileElement => {
        fileElement.remove();
      });
    }


    const fileListContainer = document.getElementById('file-lists');
    data.forEach((item) => {
      const fileListItem = document.createElement('div');
      fileListItem.classList.add('file-list');
      const fileIcon = document.createElement('img');
      fileIcon.alt=item.name;
      var name=truncateFileName(item.name);
      if(item.file==true)   
            fileIcon.src = getIconPath(item.ext); // replace with your icon
      else
           fileIcon.src ='img/icon/file/folder.png'; 
      fileListItem.append(fileIcon);
      const filenameElement = document.createElement('div');
      filenameElement.textContent = name;
      filenameElement.id = item.name;
      filenameElement.classList.add('filename');
      fileListItem.append(filenameElement);
      fileListContainer.appendChild(fileListItem);

      fileIcon.addEventListener('click',SelectFile());
   
    });
  })
  .catch((error) => {
    console.error(error);
  });

}
  function truncateFileName(fileName) {
    const maxLength = 16;
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex < maxLength) {
      return fileName;
    } else {
      return fileName.substring(0, maxLength-4)+fileName.substring((dotIndex));
    }
  }



  const iconMap = { "aac": "aac.png", "c": "c.png", "doc": "doc.png", "flv": "flv.png", "iso": "iso.png", "mid": "mid.png", "odt": "odt.png", "php": "php.png", "rar": "rar.png", "tga": "tga.png", "xlsx": "xlsx.png", "aiff": "aiff.png", "cpp": "cpp.png", "dotx": "dotx.png", "gif": "gif.png", "java": "java.png", "mp3": "mp3.png", "otp": "otp.png", "png": "png.png", "rb": "rb.png", "tgz": "tgz.png", "xml": "xml.png", "ai": "ai.png", "css": "css.png", "dwg": "dwg.png", "h": "h.png", "hpp": "hpp.png", "js": "js.png", "mp4": "mp4.png", "ott": "ott.png", "psd": "psd.png", "sass": "sass.png", "sql": "sql.png", "bmp": "bmp.png", "dmg": "dmg.png", "exe": "exe.png", "ics": "ics.png", "less": "less.png", "ods": "ods.png", "pdf": "pdf.png", "qt": "qt.png", "txt": "txt.png", "wav": "wav.png", "zip": "zip.png" };
  
  function getIconPath(extension) {
    const lowerCaseExtension = extension.toLowerCase();
    if (iconMap[lowerCaseExtension]) {
      return `img/icon/file/${iconMap[lowerCaseExtension]}`;
    } else {
      return `img/icon/file/_blank.png`;}
  }




function DownloadSelectFile() {
$.post('https://api.allfilmbook.ru/FileManager/', {
  type: 'DownloadFile',
  dates: file_dir+'/'+SelectFileData,
  UserName: UserName,
  UserHash: UserHash
}, function(response) {
  let res = JSON.parse(response);
  var fileURI = encodeURI(res.href);
  showNotification('Загрузка...');
if (platform=='browser') {
  downloadFileBrowser(fileURI, SelectFileData);
}
else {
 downloadFileAndroid(fileURI, SelectFileData);
}






});



}


function downloadFileAndroid(url, filename){
 var fileURL = cordova.file.externalRootDirectory+'Download/' + filename; // Путь, по которому будет сохранен файл
  var fileTransfer = new FileTransfer();
  window.resolveLocalFileSystemURL(fileURL, function success(fileEntry) {
    const fileNameParts = filename.split('.');
    const name = fileNameParts[0];
    const extension = fileNameParts[1] || '';
    var currentDate = new Date();
    fileURL = cordova.file.externalRootDirectory+'Download/' + name+currentDate.getFullYear() + '_' + (currentDate.getMonth() + 1) + '_' + currentDate.getDate() + '_' + currentDate.getHours() + '_' + currentDate.getMinutes() + '_' + currentDate.getSeconds() + '.' + extension;
  })

 

 setTimeout(function() {
  fileTransfer.download(
      url,
      fileURL,
      function(entry) {
        showNotification('Загрузка <a onclik=\"openFileInExternalApp('+fileURL+');\">'+filename+'</a> завершена.');
      },
      function(error) {
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

        showNotification('Произошла ошибка загрузки: '+error.source +' ' + message);
 

      }
  );
}, 200);

}


async function downloadFileBrowser(url, filename) {
  /**
 * Скачивание файла через браузер
 * Работает даже без Content-Disposition от сервера
 */
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
    showNotification('Произошла ошибка загрузки: '+error)
    return false;
  }
}


  function OpenFolder(selectedFile){
    file_dir=file_dir+'/'+selectedFile;
    UpdateList();

  }


  function CutDir(str) {
    const lastSlashIndex = str.lastIndexOf('/');
    return str.slice(0, lastSlashIndex);
  }


  function GoBack() {
    file_dir=CutDir(file_dir);
    UpdateList();

  }
  
  

setTimeout(function(){ 

    $('#preloader').hide();
    $('#file').bind('change', function(){
    var data = new FormData();
var error = '';
    data.append('dates', file_dir);
    data.append('type', 'uploadFile');
    jQuery.each($('#file')[0].files, function(i, file) {
 
            if(file.name.length < 1) {               
               error = error + ' Файл имеет неправильный размер! ';             
            }            

        data.append('file-'+i, file);
    });
 
if (error != '') {$('#info').html(error);} else {
 
        $.ajax({
            url: 'https://api.allfilmbook.ru/FileManager/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            beforeSend: function() {
                $('#preloader').show();
            },
            success: function(data){
                $('#info').html(data);
                $('#preloader').hide();
                UpdateList();
            }
        });
         }
    })
 

}, 500);



function DeleteFileDir() {

var file=file_dir+'/'+SelectFileData;

$.post('https://api.allfilmbook.ru/FileManager/', {
  type: 'DeleteFileDir',
  dates: file_dir+'/'+SelectFileData,
  UserName: UserName,
  UserHash: UserHash
}, function(response) {

  HideMessage('Modal_Head_Delete');
  UpdateList();
});
}

function AddDir() {
  var Folder = document.getElementById('CreateFolderName').value;
    $.post('https://api.allfilmbook.ru/FileManager/', {
    type: 'CreateDirectory',
    dates: file_dir+'/'+Folder,
    UserName: UserName,
    UserHash: UserHash
  }, function(response) {
  
    HideMessage('Modal_Head_CreateFolder');
    document.getElementById('CreateFolderName').value='';
    UpdateList();
  });
  }
  



function ShowMessage(name) {
  var ModalWindowView = document.getElementById(name);
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');
}

function HideMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove("dm-overlayV");
  ModalWindowView.classList.add("dm-overlay")
}




function SelectFile() {

  let lastTap = 0;
  let timeout;
  
  return function detectDoubleTap(event) {
    const selectedFile = event.target.alt;
    const fileListDivs = document.querySelectorAll('.file-list');

  fileListDivs.forEach(function(div) { div.classList.remove('select');  SelectFileData=selectedFile;  });
  event.target.parentNode.classList.toggle('select')


    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 500 && tapLen > 0) {
      event.preventDefault();
      if (event.target.parentNode.classList[1]=='select') {
        var FileSelect=file_list.find(item => item.name == selectedFile);
        if(FileSelect.file==true)  DownloadSelectFile();
        else OpenFolder(selectedFile);
      }



    } else {
      timeout = setTimeout(() => {
        clearTimeout(timeout);
      }, 500);
    }
    lastTap = curTime;
  };
  



}


function openFileInExternalApp(url) {
  cordova.plugins.fileOpener2.open(
    url,
    'application/x-bittorrent'
);
}



function CopyFile() {
  var file=file_dir+'/'+SelectFileData;
  CopyPastDate=CopyPastDate+file+';';
}


function showNotification(html) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerHTML = html;
  document.body.appendChild(notification);
  setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
          document.body.removeChild(notification);
      }, 1000);
  }, 8000);
}