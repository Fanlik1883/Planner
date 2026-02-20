const TIME1DAY = 86400000;
const TIMEREQUEST = 5000;
var ViewClose = 0;
var ViewHide = 0;
var ProjectList = [];

class User {
  constructor() {
    this.UserHash = getCookie('user_hash') || '';
    this.UserName = getCookie('user_name') || '';
  }
}

const user = new User();

if (!user.UserHash || !user.UserName) {
  ShowMessage('Avtorization_Head');
}

class Planer {
  constructor() {
    this.RazdelId = Number(getCookie('UserPage')) || 9;
    this.platform = window.cordova && window.cordova.platformId ? window.cordova.platformId : 'browser';
    this.Form1_Run_once = 0;
    this.offset = 0;
    this.TaskAllJson();
    this.PlanerData = new Array();
    this.OutList = new Array();
  }

  TaskAllJson() {
    $.ajaxSetup({ timeout: 10000 });

    // Создаем FormData для POST-полей авторизации
    const formData = new FormData();
    formData.append('UserName', user.UserName);
    formData.append('UserHash', user.UserHash);
    formData.append('type', 'get_all');

    /* action и другие параметры добавляем как JSON в отдельное поле
    const jsonData = {
        action: 'get_all'
    };
    formData.append('data', JSON.stringify(jsonData));
    */
    $.ajax({
      url: 'https://api.allfilmbook.ru/project_api.php',
      type: 'POST',
      data: formData,
      processData: false, // важно: не обрабатывать данные
      contentType: false, // важно: не устанавливать Content-Type
      success: function (response) {
        if (typeof response === 'string') {
          try {
            response = JSON.parse(response);
          } catch (e) {
            alert('Ошибка парсинга JSON ответа');
            return;
          }
        }

        // Проверяем новый API формат
        if (!response || response.success !== true) {
          const errorMsg = response && response.message ? response.message : 'Неизвестная ошибка сервера';
          alert('Ошибка API: ' + errorMsg);
          return;
        }

        const data = response.data;

        if (!Array.isArray(data)) {
          alert('Некорректный формат данных от сервера');
          return;
        }
        /*            
            // Декодируем HTML-сущности в описании
            data.forEach(item => {
                if (item.description) {
                    item.description = item.description
                        .replace(/&apos;/g, "'")
                        .replace(/&quot;/g, '"');
                }
            });
           */
        planer.PlanerData = data;
        planer.PlanerData.reverse();
        planer.ViewTaskAll();

        // Сбрасываем счетчик ошибок
        errorCount = 0;
      },
      error: function (xhr, status, error) {
        errorCount++;

        let errorMessage = 'Не удалось загрузить данные';
        if (status === 'timeout') {
          errorMessage = 'Таймаут запроса';
        } else if (xhr.status === 401) {
          errorMessage = 'Ошибка авторизации';
        }

        if (errorCount < 3) {
          if (confirm(errorMessage + '. Повторить запрос?')) {
            ViewTaskAllJson();
          }
        } else {
          errorCount = 0;
          alert('Нет доступа к API.');
        }
      },
    });
  }

  filterProjectsByType(typeProjectValue, viewClose = 0, viewHide = 1, currentDate = new Date()) {
    // Преобразуем искомый тип проекта в строку для сравнения
    const searchType = String(typeProjectValue);

    return planer.PlanerData.filter((item) => {
      // Проверяем type_project
      if (String(item.type_project) !== searchType) {
        return false;
      }

      // Проверяем статус в зависимости от viewClose
      if (viewClose == 1) {
        // Если viewClose === 1, нужен статус = 4
        if (String(item.status) !== '4') {
          return false;
        }
      } else {
        // Если viewClose !== 1, нужен статус > 0 и < 4
        const status = parseInt(item.status);
        if (!(status > 0 && status < 4)) {
          return false;
        }
      }

      // Дополнительная проверка для type_project = 9
      if (searchType === '9' && viewHide != 1) {
        // Проверяем remind_date <= currentDate
        if (!item.remind_date) {
          return false; // Если нет даты напоминания - не включаем
        }

        const remindDate = new Date(item.remind_date);
        if (remindDate > currentDate) {
          return false; // Если дата напоминания в будущем - не включаем
        }
      }

      return true;
    });
  }

  ViewTaskAll(RazdelId = 0) {
    if (RazdelId == 0) RazdelId = planer.RazdelId;
    setCookieMy('UserPage', RazdelId);
    planer.RazdelId = RazdelId;
    visualpanel.ViewPort.innerHTML = '';
    visualpanel.ViewPortHead.innerHTML = '<h3>' + visualpanel.HeadDates[RazdelId].title + visualpanel.HeadDates[RazdelId].includes + '</h3>';
    planer.OutList = this.filterProjectsByType(planer.RazdelId, ViewClose, ViewHide);
    visualpanel.renderTable(RazdelId);
  }
}

class VisualPanel {
  constructor() {
    this.HeadDates = {
      9: { title: 'Выполнить', includes: '' },
      15: { title: 'Дело', includes: '' },
      1: { title: 'Проекты', includes: '' },
      13: { title: 'Дневник', includes: "<br><input type='text' id='search' style='width: 90%;' oninput='visualpanel.renderTable()' value=''>", name: 'DiaryList' },
      10: { title: 'Желания', includes: '' },
      12: { title: 'Идеи', includes: '' },
      11: { title: 'Образ жизни', includes: '' },
      14: { title: 'Справочные данные', includes: '' },
      16: { title: 'Статистика данные', includes: "<br><input id='Form10_name'  style='width: 90%;' type='text' size='40'><br><button onclick='formDataHandler.postForm10()' style='width: 100%;' type='submit'>Добавить</button>", name: 'StatisticList' },
    };
    this.ViewPort = document.getElementById('ViewPort');
    this.ViewPortHead = document.getElementById('HeadShop');
  }

  renderTable(Razdel_id = 0) {
    Razdel_id = planer.RazdelId;
    let search = document.getElementById('search')?.value || '';
    const today = new Date().toISOString().split('T')[0];

    if (search.length > 2) {
      visualpanel.ViewPort.innerHTML = '';
    }

    planer.OutList.forEach(function (item, i) {
      if (item.remind_date && item.remind_date > today && ViewHide == 0) {
        return; // Пропускаем элементы с датой в будущем
      }
      if (search.length > 2) {
        if (item.name.toLowerCase().includes(search.toLowerCase())) {
          visualpanel.addTableRow(item, Razdel_id);
        }
      } else {
        visualpanel.addTableRow(item, Razdel_id);
      }
    });
  }

  addTableRow(item, Razdel_id) {
    let liLast = document.createElement('tr');
    let AdddataHtml = '<td  >';
    let checkboxHtml = '';
    let nameProjectHtml = '';
    if (Razdel_id == 9 || Razdel_id == 10) checkboxHtml = " <button class='BottonDone' type='button'  onclick='Done(" + item['id'] + ")'>Выполнить</button>";
    AdddataHtml += "<label class='NameRecord' onclick='formDataHandler.showHideDescription(" + item['id'] + ")'>" + item['name'] + '</label>';
    AdddataHtml += "<div  class='dropdown-Description' id='Description_" + item['id'] + "'>" + item['remind_date'] + checkboxHtml + " <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'><hr>" + item['description'] + '</div></td>';
    liLast.innerHTML = AdddataHtml;

    visualpanel.ViewPort.append(liLast);
  }
}

const planer = new Planer();
const visualpanel = new VisualPanel();

GetProjectList();

var errorCount = 0;

function Done(id) {
  $.ajaxSetup({ timeout: TIMEREQUEST });
  $.post('https://api.allfilmbook.ru/project_api.php', {
    type: 'Done',
    id: id,
    UserName: user.UserName,
    UserHash: user.UserHash,
  }).done(function (data) {
    if (data.success === true) {
      replacePlannerItemById(id, data.data);
      planer.ViewTaskAll();
    } else {
      alert(data);
    }
  });
}

function replacePlannerItemById(id, newData) {
  const index = planer.PlanerData.findIndex((item) => Number(item.id) === id);
  if (index !== -1) {
    planer.PlanerData[index] = { ...newData };
    return true;
  }

  return false;
}

function Pluse1Day(id) {
  $.ajaxSetup({ timeout: TIMEREQUEST });
  $.post('https://api.allfilmbook.ru/project_api.php', {
    type: 'Pluse1Day',
    id: id,
    UserName: user.UserName,
    UserHash: user.UserHash,
  }).done(function (data) {
    if (data.success === true) {
      replacePlannerItemById(id, data.data);
      planer.ViewTaskAll();
    } else {
      alert(data);
    }
  });
}

var how = 0;

function SettingsPanelHide(id) {
  if (how == 0) {
    document.getElementById('myDropdown').classList.toggle('show');
    how = 1;
  } else {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
  how = 0;
}

class FormDataHandler {
  constructor() {
    // Form1 элементы
    this.Form1_name = document.getElementById('Form1_name');
    this.Form1_id_project = document.getElementById('Form1_id_project');
    this.Form1_type_project = document.getElementById('Form1_type_project');
    this.Form1_tag = document.getElementById('Form1_tag');
    this.Form1_remind = document.getElementById('Form1_remind');
    this.Form1_data_create = document.getElementById('Form1_data_create');
    this.Form1_remind_date = document.getElementById('Form1_remind_date');
    this.Form1_status = document.getElementById('Form1_status');
    this.Form1_remind_time = document.getElementById('Form1_remind_time');

    // Form2 элементы
    this.Form2_name = document.getElementById('Form2_name');
    this.Form2_id_project = document.getElementById('Form2_id_project');
    this.Form2_remind_date = document.getElementById('Form2_remind_date');
    this.Form2_remind = document.getElementById('Form2_remind');
    this.Form2_type_project = document.getElementById('Form2_type_project');
    this.Form2_status = document.getElementById('Form2_status');
    this.Form2_tag = document.getElementById('Form2_tag');
    this.Form2_data_create = document.getElementById('Form2_data_create');
    this.Form2_id = document.getElementById('Form2_id');
    this.Form2_remind_time = document.getElementById('Form2_remind_time');

    // Form4 элементы
    this.Form4_login = document.getElementById('Form4_login');
    this.Form4_password = document.getElementById('Form4_password');

    // Form5 элементы
    this.Form5_id = document.getElementById('Form5_id');

    // Авторизация элементы
    this.Avtorization_login = document.getElementById('Avtorization_login');
    this.Avtorization_password = document.getElementById('Avtorization_password');
  }

  resetForm1() {
    this.Form1_name.value = '';
    this.Form1_id_project.value = 0;
    this.Form1_type_project.value = '';
    this.Form1_tag.value = '';
    this.Form1_remind.value = '';
    this.Form1_data_create.value = '';
    this.Form1_remind_date.value = '';
    this.Form1_status.value = 1;
    this.Form1_remind_time.value = '';

    if (nicEditors.findEditor('Form1_description')) {
      nicEditors.findEditor('Form1_description').setContent('');
    }
  }

  resetForm2() {
    this.Form2_name.value = '';
    this.Form2_id.value = '';
    this.Form2_id_project.value = 0;
    this.Form2_type_project.value = '';
    this.Form2_tag.value = '';
    this.Form2_remind.value = '';
    this.Form2_data_create.value = '';
    this.Form2_remind_date.value = '';
    this.Form2_status.value = 1;
    this.Form2_remind_time.value = '';

    if (nicEditors.findEditor('Form2_description')) {
      nicEditors.findEditor('Form2_description').setContent('');
    }
  }

  resetForm4() {
    this.Form4_login.value = '';
    this.Form4_password.value = '';
  }

  resetForm10() {
    document.getElementById('Form10_name').value = '';
  }

  Form1Post() {
    // Отправляем новый элемент в планеровщик и добавляем в массив
    if (this.Form1_remind_date.value == '') this.Form1_remind_date.value = this.Form1_data_create.value;
    const formData = {
      type: 'Form1_AddProject',
      remind: this.Form1_remind.value,
      remind_time: this.Form1_remind_time.value,
      remind_date: this.Form1_remind_date.value,
      name: this.Form1_name.value,
      id_project: this.Form1_id_project.value,
      description: nicEditors.findEditor('Form1_description').getContent(),
      type_project: this.Form1_type_project.value,
      status: this.Form1_status.value,
      tag: this.Form1_tag.value,
      data_create: this.Form1_data_create.value,
      UserName: user.UserName,
      UserHash: user.UserHash,
    };

    $.ajax({
      url: 'https://api.allfilmbook.ru/project_api.php',
      type: 'POST',
      data: formData,
      timeout: TIMEREQUEST,
      success: (response) => {
        // Парсим JSON ответ
        let data;
        try {
          data = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          console.error('Ошибка парсинга JSON:', e);
          alert('Ошибка формата ответа от сервера');
          return;
        }

        // Проверяем success из ответа
        if (data.success === true) {
          // Создаем копию данных без UserName и UserHash для добавления в массив
          const newItem = { ...formData };
          delete newItem.UserName;
          delete newItem.UserHash;

          // Добавляем ID из ответа сервера
          if (data.data && data.data.id) newItem.id = data.data.id;

          // Добавляем новую дату создания из ответа, если она есть
          if (data.data && data.data.created_at) newItem.data_create = data.data.created_at;

          // Добавляем новый элемент в массив PlanerData
          planer.PlanerData.unshift(newItem);

          if (this.Form1_id_project.value > 0) planer.Form1_Run_once = 0;
          this.showHideForm1();
          planer.ViewTaskAll();
        } else {
          // Если success === false или не указан
          const errorMessage = data.message || data.error || 'Неизвестная ошибка сервера';
          alert(errorMessage);
        }
      },
      error: (xhr, status, error) => {
        console.error('Ошибка отправки формы:', status, error);
        alert('Произошла ошибка при отправке данных');
      },
    });
  }

  showHideForm1() {
    GetProjectList();
    this.resetForm1();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    this.Form1_data_create.value = yyyy + '-' + mm + '-' + dd;
    this.Form1_remind_date.value = yyyy + '-' + mm + '-' + dd;

    var ModalWindowView = document.getElementById('Modal1_Head');
    if (ModalWindowView.classList.value == 'casementHide') {
      this.Form1_type_project.value = planer.RazdelId;
      ModalWindowView.classList.remove('casementHide');
      ModalWindowView.classList.add('casementView');
    } else {
      ModalWindowView.classList.remove('casementView');
      ModalWindowView.classList.add('casementHide');
    }
  }

  postForm2() {
    // Сохраняем данные формы до отправки
    const formData = {
      type: 'Form2_EditProject',
      remind: this.Form2_remind.value,
      remind_time: this.Form2_remind_time.value,
      remind_date: this.Form2_remind_date.value,
      id: this.Form2_id.value,
      name: this.Form2_name.value,
      id_project: this.Form2_id_project.value,
      description: nicEditors.findEditor('Form2_description').getContent(),
      type_project: this.Form2_type_project.value,
      status: this.Form2_status.value,
      tag: this.Form2_tag.value,
      data_create: this.Form2_data_create.value,
      UserName: user.UserName,
      UserHash: user.UserHash,
    };

    // Создаем копию данных без UserName и UserHash для обновления массива
    const updateData = { ...formData };
    delete updateData.UserName;
    delete updateData.UserHash;

    $.ajax({
      url: 'https://api.allfilmbook.ru/project_api.php',
      type: 'POST',
      data: formData,
      timeout: TIMEREQUEST,
      success: (data) => {
        if (data.success === true) {
          // Находим и обновляем элемент в массиве PlanerData
          const itemId = this.Form2_id.value;
          const index = planer.PlanerData.findIndex((item) => item.id == itemId);

          if (index !== -1) {
            planer.PlanerData[index] = {
              ...planer.PlanerData[index], // Сохраняем существующие свойства
              ...updateData, // Обновляем значения из формы (без UserName/UserHash)
            };
          }

          if (this.Form2_id_project.value > 0) planer.Form1_Run_once = 0;
          this.showHideForm2();

          planer.ViewTaskAll();
        } else {
          alert(data);
        }
      },
      error: (xhr, status, error) => {
        console.error('Ошибка отправки формы:', status, error);
        alert('Произошла ошибка при отправке данных');
      },
    });
  }

  showHideForm2(id0 = null) {
    GetProjectList();

    const ModalWindowView = document.getElementById('Modal2_Head');

    if (ModalWindowView.classList.value == 'casementHide') {
      ModalWindowView.classList.remove('casementHide');
      ModalWindowView.classList.add('casementView');

      if (id0) {
        $.post('https://api.allfilmbook.ru/project_api.php', {
          type: 'ProjectView',
          id: id0,
          UserName: user.UserName,
          UserHash: user.UserHash,
        }).done((data) => {
          const json = JSON.parse(data);

          // Заполняем Form2 данными из API
          this.Form2_name.value = json['name'];
          this.Form2_id.value = id0;
          this.Form2_id_project.value = json['id_project'];

          if (nicEditors.findEditor('Form2_description')) {
            nicEditors.findEditor('Form2_description').setContent(json['description']);
          }

          this.Form2_type_project.value = json['type_project'];
          this.Form2_status.value = json['status'];
          this.Form2_remind_date.value = json['remind_date'];
          this.Form2_tag.value = json['tag'];
          this.Form2_remind.value = json['remind'];
          this.Form2_remind_time.value = json['remind_time'];

          const tmp = json['data_create'].split(' ')[0];
          this.Form2_data_create.value = tmp;
        });
      }
    } else {
      this.resetForm2();
      ModalWindowView.classList.remove('casementView');
      ModalWindowView.classList.add('casementHide');
    }
  }

  showHideForm5(id0 = null) {
    var ModalWindowView = document.getElementById('Modal5_Head');
    if (ModalWindowView.classList.value == 'casementHide') {
      ModalWindowView.classList.remove('casementHide');
      ModalWindowView.classList.add('casementView');

      if (id0) {
        this.Form5_id.value = id0;
      }
    } else {
      ModalWindowView.classList.remove('casementView');
      ModalWindowView.classList.add('casementHide');
    }
  }

  postForm5() {
    const idToDelete = this.Form5_id.value;

    $.ajax({
      url: 'https://api.allfilmbook.ru/project_api.php',
      type: 'POST',
      data: {
        type: 'Form5_DeleteProject',
        id: idToDelete,
        UserName: user.UserName,
        UserHash: user.UserHash,
      },
      timeout: TIMEREQUEST,
      success: (data) => {
        if (data.success === true) {
          // Находим индекс элемента для удаления
          const index = planer.PlanerData.findIndex((item) => item.id == idToDelete);

          // Удаляем элемент из массива, если найден
          if (index !== -1) {
            planer.PlanerData.splice(index, 1);
          }

          this.showHideForm5();
          planer.ViewTaskAll();
        } else {
          alert(data);
        }
      },
      error: (xhr, status, error) => {
        console.error('Ошибка удаления проекта:', status, error);
        alert('Произошла ошибка при удалении проекта');
      },
    });
  }

  postForm10() {
    // Подготавливаем дату
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const data_create = yyyy + '-' + mm + '-' + dd;

    // Сохраняем данные формы
    const formData = {
      type: 'Form1_AddProject',
      remind: '',
      remind_time: '', // Добавляем если нужно
      remind_date: data_create,
      name: document.getElementById('Form10_name').value,
      id_project: '0',
      description: '',
      type_project: '16',
      status: '1',
      tag: '',
      data_create: data_create,
      UserName: user.UserName,
      UserHash: user.UserHash,
    };

    $.ajax({
      url: 'https://api.allfilmbook.ru/project_api.php',
      type: 'POST',
      data: formData,
      timeout: TIMEREQUEST,
      success: (data) => {
        if (data.success === true) {
          const newItem = { ...formData };
          delete newItem.UserName;
          delete newItem.UserHash;

          // Добавляем ID (временный, если сервер не возвращает)
          // if (!newItem.id) {  newItem.id = Date.now(); }
          planer.PlanerData.unshift(newItem);
          //  if (this.Form10_id_project.value > 0) planer.Form1_Run_once = 0;
          this.resetForm10();
          planer.ViewTaskAll();
        } else {
          alert(data);
        }
      },
      error: (xhr, status, error) => {
        console.error('Ошибка отправки формы:', status, error);
        alert('Произошла ошибка при отправке данных');
      },
    });
  }

  showHideDescription(id) {
    const descriptionElement = document.getElementById('Description_' + id);

    if (descriptionElement.classList.value == 'dropdown-Description') {
      descriptionElement.classList.toggle('show');

      if ((planer.RazdelId == 15 || planer.RazdelId == 1) && document.getElementById('ProjectList_' + id) == null) {
        TaskInProjectList(id);
      }
    } else {
      const dropdowns = document.getElementsByClassName('dropdown-Description');

      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
}

const formDataHandler = new FormDataHandler();

function GetProjectList() {
  if (planer.Form1_Run_once == 0) {
    $.ajaxSetup({ timeout: TIMEREQUEST });
    $.post('https://api.allfilmbook.ru/project_api.php', {
      type: 'ProjectDeloList',
      UserName: user.UserName,
      UserHash: user.UserHash,
    }).done(function (data) {
      json = JSON.parse(data);
      formDataHandler.Form1_id_project.innerHTML = "<option  value='0'>Проект</option>";
      formDataHandler.Form2_id_project.innerHTML = "<option  value='0'>Проект</option>";
      json.forEach(function (item, i, json) {
        var id = item['id'];
        ProjectList[id] = item['name'];
        formDataHandler.Form1_id_project.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + '</option>';
        formDataHandler.Form2_id_project.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + '</option>';
      });
    });
  }
  planer.Form1_Run_once = 1;
}

function getFilesFrom() {
  var fileList = CopyPastDate.split(';');

  fileList.forEach(function (fileUrl) {
    fileUrl = 'http://allfilmbook.ru/project/' + fileUrl;
    const isImage = fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png');
    let lastIndex = fileUrl.lastIndexOf('/');
    let remaining = fileUrl.substring(lastIndex + 1);
    const tag = isImage ? `<img src="${fileUrl}" alt="${remaining}" align="none">` : ` <a href="${fileUrl}">${remaining}</a>`;

    if (nicEditors.findEditor('Form2_description')) {
      nicEditors.findEditor('Form2_description').setContent(nicEditors.findEditor('Form2_description').getContent() + '<br>' + tag + '<br>');
    }

    if (nicEditors.findEditor('Form1_description')) {
      nicEditors.findEditor('Form1_description').setContent(nicEditors.findEditor('Form1_description').getContent() + '<br>' + tag + '<br>');
    }
  });

  return files;
}

function FilePut() {
  document.getElementById('filePutModal').style.display = 'block';
  document.getElementById('filePutOverlay').style.display = 'block';
}

function closeFilePut() {
  document.getElementById('filePutModal').style.display = 'none';
  document.getElementById('filePutOverlay').style.display = 'none';
  const fileInfo = (document.getElementById('fileInput').value = '');
}

function submitFilePut() {
  const fileInfo = document.getElementById('fileInput').value;
  getFilesFrom(fileInfo);
  closeFilePut();
}

/*
const observer = new IntersectionObserver((entries) => {
    if ((window.scrollY > document.body.scrollHeight - 1500) && window.scrollY > 5000) {
        planer.offset++;
        DiaryList(planer.offset);
        let dd = document.getElementById('load-more-button');
        observer.observe(dd);
    }
}, {
    root: null,
    threshold: 1.0,
});

let dd = document.getElementById('load-more-button');
setTimeout(() => observer.observe(dd), 5000);

*/
function ShowMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove('casementHide');
  ModalWindowView.classList.add('casementView');
}

function HideMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove('casementView');
  ModalWindowView.classList.add('casementHide');
}
