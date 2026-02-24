class Planer {
  constructor() {
    this.RazdelId = Number(cookie.getCookie('UserPage')) || 9;
    this.platform = window.cordova && window.cordova.platformId ? window.cordova.platformId : 'browser';
    this.Form1_Run_once = 0;
    this.offset = 0;
    this.TaskAllJson();
    this.PlanerData = new Array();
    this.OutList = new Array();
    this.GetProjectList();
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
    cookie.setCookieMy('UserPage', RazdelId);
    planer.RazdelId = RazdelId;
    visualpanel.ViewPort.innerHTML = '';
    visualpanel.ViewPortHead.innerHTML = '<h3>' + visualpanel.HeadDates[RazdelId].title + visualpanel.HeadDates[RazdelId].includes + '</h3>';
    planer.OutList = this.filterProjectsByType(planer.RazdelId, ViewClose, ViewHide);
    visualpanel.renderTable(RazdelId);
  }

 DoneTask(id) {
  $.ajaxSetup({ timeout: TIMEREQUEST });
  $.post('https://api.allfilmbook.ru/project_api.php', {
    type: 'Done',
    id: id,
    UserName: user.UserName,
    UserHash: user.UserHash,
  }).done(function (data) {
    if (data.success === true) {
      planer.replacePlannerItemById(id, data.data);
      planer.ViewTaskAll();
    } else {
      alert(data);
    }
  });
}

 Pluse1Day(id) {
  $.ajaxSetup({ timeout: TIMEREQUEST });
  $.post('https://api.allfilmbook.ru/project_api.php', {
    type: 'Pluse1Day',
    id: id,
    UserName: user.UserName,
    UserHash: user.UserHash,
  }).done(function (data) {
    if (data.success === true) {
      planer.replacePlannerItemById(id, data.data);
      planer.ViewTaskAll();
    } else {
      alert(data);
    }
  });
}
 replacePlannerItemById(id, newData) {
  const index = planer.PlanerData.findIndex((item) => Number(item.id) === id);
  if (index !== -1) {
    planer.PlanerData[index] = { ...newData };
    return true;
  }

  return false;
}


 GetProjectList() {
  if (this.Form1_Run_once == 0) {
    $.ajaxSetup({ timeout: TIMEREQUEST });
    $.post('https://api.allfilmbook.ru/project_api.php', {
      type: 'ProjectDeloList',
      UserName: user.UserName,
      UserHash: user.UserHash,
    }).done(function (data) {
      let json = JSON.parse(data);
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
  this.Form1_Run_once = 1;
}


}