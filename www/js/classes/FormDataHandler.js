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
    planer.GetProjectList();
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
    planer.GetProjectList();

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
