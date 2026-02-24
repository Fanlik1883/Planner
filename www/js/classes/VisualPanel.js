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
    if (Razdel_id == 9 || Razdel_id == 10) checkboxHtml = " <button class='BottonDone' type='button'  onclick='planer.DoneTask(" + item['id'] + ")'>Выполнить</button>";
    AdddataHtml += "<label class='NameRecord' onclick='formDataHandler.showHideDescription(" + item['id'] + ")'>" + item['name'] + '</label>';
    AdddataHtml += "<div  class='dropdown-Description' id='Description_" + item['id'] + "'>" + item['remind_date'] + checkboxHtml + " <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'><hr>" + item['description'] + '</div></td>';
    liLast.innerHTML = AdddataHtml;

    visualpanel.ViewPort.append(liLast);
  }

 ShowMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove('casementHide');
  ModalWindowView.classList.add('casementView');
}

 HideMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove('casementView');
  ModalWindowView.classList.add('casementHide');
}


}