Form1_Run_once = 0
var UserHash = getCookie("user_hash") || '';
var UserName = getCookie("user_name") || '';
var OutList=new Array();


if (!UserHash || !UserName) { // Если не авторизован
	document.getElementById('Avtorization_link').innerHTML = '<li><a href="#" onclick=\'Avtorization_ShowHide()\'>Войти</a></li>';
 

}
var offset=0;
Form1_GetProjectList()
RunLast()
function RunLast() { // Задачи на выполнения
	var results = document.cookie.match(/UserPage=(.+?)(;|$)/);
	if (results !== null) {
		UserPage = results[1]
		eval(UserPage + "()")
	}
	else
		PerformList();
}

function PerformList(offset = 0) { // Задачи на выполнения
	document.cookie = "UserPage=PerformList"
	Razdel_id = 9;

	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Выполнить</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML=''; UserName: UserName,UserHash: UserHash
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'PerformList', ViewClose: ViewClose, ViewHide: ViewHide, UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}



function TaskList(offset = 0) { // Проекты
	document.cookie = "UserPage=TaskList"
	Razdel_id = 15;
	var TaskHtml;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Дело</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'TaskList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})
}

function TaskInProjectList(id) { // Проекты
	$.ajaxSetup({ timeout: 3000 });
	var liLast = '';
	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'TaskInProjectList', id: id, UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		json.forEach(function (item, i, json) {
			liLast = liLast + "<p>&nbsp &nbsp &nbsp &nbsp<input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='ShowHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></p>"
		})
		let Des = document.getElementById('Description_' + id)
		let p1 = document.createElement('p');
		p1.id = "ProjectList_" + id;
		p1.innerHTML = liLast;
		Des.prepend(p1);

		//id_project=document.getElementById('Description_"+id)	  
	})


}






function ProjectList(offset = 0) { // Проекты
	document.cookie = "UserPage=ProjectList"
	Razdel_id = 1;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Проекты</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'ProjectList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}


function DiaryList(offset = 0) { // Дневник
	document.cookie = "UserPage=DiaryList"
	Razdel_id = 13;
	var ViewPort = document.getElementById('ViewPort');
	if (offset == 0) {
		ViewPort.innerHTML = '';
		OutList=[];
		var ViewPort0 = document.getElementById('HeadShop');
		ViewPort0.innerHTML = "<h3>Дневник</h3><input type='text' id='search' value=''>"
	}
	


	document.getElementById("search").addEventListener("input", function() {
		
		renderTable (Razdel_id,OutList,document.getElementById("search").value)
	  });

	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'DiaryList', UserName: UserName,UserHash: UserHash ,offset: offset}).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}

function renderTable (Razdel_id,OutList0,search=''){
	var ViewPort = document.getElementById('ViewPort');
	if (search.length>1){
		ViewPort.innerHTML = '';
	}
	json.forEach(function (item, i, OutList0) {
		if (search.length>1){
			if (item.name.toLowerCase().includes(search.toLowerCase())){
				let liLast = document.createElement('tr');
				if (Razdel_id == 1 || Razdel_id == 10||Razdel_id == 11 || Razdel_id == 12 ||Razdel_id == 15) liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='ShowHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>"
				if (Razdel_id == 9) liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='ShowHideDescription(" + item['id'] + ")' >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/pluse1day.png'  onclick='Pluse1Day(" + item['id'] + ")' style='width: 24px;display: unset;'  title='+ 1 День'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'>Проект: " + ProjectList[item['id_project']] + "<hr>" + item['description'] + "</div></td>"
				if (Razdel_id == 13 || Razdel_id == 14) liLast.innerHTML = "<td ><label onclick='ShowHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>"
				if (Razdel_id == 16) liLast.innerHTML = "<td ><label >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></td>";
				ViewPort.append(liLast); // вставить liLast в конец <ol>	
			}
		}
		else {
		let liLast = document.createElement('tr');
		if (Razdel_id == 1 || Razdel_id == 10||Razdel_id == 11 || Razdel_id == 12 ||Razdel_id == 15) liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='ShowHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>"
		if (Razdel_id == 9) liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='ShowHideDescription(" + item['id'] + ")' >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/pluse1day.png'  onclick='Pluse1Day(" + item['id'] + ")' style='width: 24px;display: unset;'  title='+ 1 День'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'>Проект: " + ProjectList[item['id_project']] + "<hr>" + item['description'] + "</div></td>"
		if (Razdel_id == 13 || Razdel_id == 14) liLast.innerHTML = "<td ><label onclick='ShowHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>"
		if (Razdel_id == 16) liLast.innerHTML = "<td ><label >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='Form2_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='Form5_ShowHide(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></td>";
		ViewPort.append(liLast); // вставить liLast в конец <ol>			
	}
	})
}


function WishesList(offset = 0) { // Желания
	document.cookie = "UserPage=WishesList"
	Razdel_id = 10;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Желания</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'WishesList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}

function IdeaList(offset = 0) { //Идеи
	document.cookie = "UserPage=IdeaList"
	Razdel_id = 12;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Идеи</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'IdeaList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}

function LifestyleList(offset = 0) { // Образ жизни
	Razdel_id = 11;
	document.cookie = "UserPage=LifestyleList"
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Образ жизни</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'LifestyleList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}

function ReferenceList(offset = 0) { // Справочные данные
	document.cookie = "UserPage=ReferenceList"
	Razdel_id = 14;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Справочные данные</h3>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'ReferenceList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}


function StatisticList(offset = 0) { // Справочные данные
	document.cookie = "UserPage=StatisticList"
	Razdel_id = 16;
	var ViewPort = document.getElementById('ViewPort');
	ViewPort.innerHTML = '';
	var ViewPort0 = document.getElementById('HeadShop');
	ViewPort0.innerHTML = "<h3>Статистика данные</h3><br><input id='Form10_name'  style='width: 80%;' type='text' size='40'><input type='hidden' id='Form10_id_project' value='0'><input type='hidden' id='Form10_type_project' value='16'><input type='hidden' id='Form10_status' value='1'><button onclick='Form10Post()' style='width: 15%;' type='submit'>Добавить</button>"
	$.ajaxSetup({ timeout: 10000 });

	////--------------------------	ViewPort.innerHTML='';
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'StatisticList', UserName: UserName,UserHash: UserHash }).done(function (data) {
		json = JSON.parse(data);
		OutList=OutList.concat(json);
		renderTable (Razdel_id,OutList);
	})


}





function Done(id) {

	$.ajaxSetup({ timeout: 10000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Done', id: id, UserName: UserName,UserHash: UserHash }).done(function (data) {
		if (data === "Ok") {
			RunLast()
		}
		else
			alert(data)
	})
}



function Pluse1Day(id) {

	$.ajaxSetup({ timeout: 10000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Pluse1Day', id: id, UserName: UserName,UserHash: UserHash }).done(function (data) {
		if (data === "Ok") {
			RunLast()
		}
		else
			alert(data)
	})
}





/****** выпадающее меню***** Когда пользователь нажимает на кнопку, переключаться раскрывает содержимое */
var how = 0
function SettingsPanelHide(id) {
	if (how == 0) {
		document.getElementById("myDropdown").classList.toggle("show")
		how = 1
	} else {
		var dropdowns = document.getElementsByClassName("dropdown-content")
		var i
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i]
			if (openDropdown.classList.contains("show")) {
				openDropdown.classList.remove("show")
			}
		}
	}

	how = 0
}






function Form1_ShowHide() { // Активировать Form1 Добавление Проекта
	Form1_GetProjectList()
	
	document.getElementById('Form1_name').value = "";
	document.getElementById('Form1_id_project').value = 0;
	document.getElementById('Form1_type_project').value = "";
	document.getElementById('Form1_tag').value = "";
	document.getElementById('Form1_remind').value = "";
	document.getElementById('Form1_data_create').value = "";
	document.getElementById('Form1_remind_date').value = "";
	document.getElementById('Form1_status').value = 1;
	document.getElementById('Form1_remind_time').value = "";
	nicEditors.findEditor('Form1_description').setContent('');


	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	document.getElementById('Form1_data_create').value = yyyy + "-" + mm + '-' + dd;
	var ModalWindowView = document.getElementById('Modal1_Head');
	if (ModalWindowView.classList.value == "dm-overlay") {
		document.getElementById('Form1_type_project').value = Razdel_id
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');
	}
	else {
		ModalWindowView.classList.remove("dm-overlayV");
		ModalWindowView.classList.add("dm-overlay")
	}
}


function Form1Post() {
	var name = document.getElementById('Form1_name').value
	var id_project = document.getElementById('Form1_id_project').value
	var description = nicEditors.findEditor('Form1_description').getContent();
	var type_project = document.getElementById('Form1_type_project').value
	var status0 = document.getElementById('Form1_status').value
	var remind_date = document.getElementById('Form1_remind_date').value
	var tag = document.getElementById('Form1_tag').value
	var data_create = document.getElementById('Form1_data_create').value
	var remind = document.getElementById('Form1_remind').value
	var remind_time = document.getElementById('Form1_remind_time').value
	$.ajaxSetup({ timeout: 10000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form1_AddProject', remind: remind,remind_time:remind_time, remind_date: remind_date, name: name, id_project: id_project, description: description, type_project: type_project, status: status0, tag: tag, data_create: data_create, UserName: UserName,UserHash: UserHash }).done(function (data) {
		if (data === "Ok") {
			if (id_project > 0) Form1_Run_once = 0 // Обновить список проектов
			Form1_ShowHide()
			RunLast();
		}
		else
			alert(data)
	})

}


function Form10Post() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	data_create = yyyy + "-" + mm + '-' + dd;
	var name = document.getElementById('Form10_name').value
	var id_project = document.getElementById('Form10_id_project').value
	var type_project = document.getElementById('Form10_type_project').value
	var status0 = document.getElementById('Form10_status').value
	$.ajaxSetup({ timeout: 10000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form1_AddProject', remind: '', remind_date: '', name: name, id_project: id_project, description: '', type_project: type_project, status: status0, tag: '', data_create: data_create, UserName: UserName,UserHash: UserHash }).done(function (data) {
	
		if (data === "Ok") {
			if (id_project > 0) Form1_Run_once = 0 // Обновить список проектов
		//	Form1_ShowHide()
			RunLast();
		}
		else
			alert(data)
	})

}


function ShowHideDescription(id) {

	if (document.getElementById("Description_" + id).classList.value == "dropdown-Description") {
		document.getElementById("Description_" + id).classList.toggle("show")
		if (Razdel_id == 15 & document.getElementById('ProjectList_' + id) == null) TaskInProjectList(id);
		if (Razdel_id == 1 & document.getElementById('ProjectList_' + id) == null) TaskInProjectList(id);

	} else {
		var dropdowns = document.getElementsByClassName("dropdown-Description")
		var i
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i]
			if (openDropdown.classList.contains("show")) {
				openDropdown.classList.remove("show")
			}
		}
	}


}


///----------------------------Рудактировать Проект/заметку---------------------------------
function Form2_ShowHide(id0) { // Активировать Form2 Редактировать обьявление
	Form1_GetProjectList()

	var ModalWindowView = document.getElementById('Modal2_Head');
	if (ModalWindowView.classList.value == "dm-overlay") {
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');


		$.post('https://api.allfilmbook.ru/project_api.php', { type: 'ProjectView', id: id0, UserName: UserName,UserHash: UserHash }).done(function (data) {
			json = JSON.parse(data);
			document.getElementById('Form2_name').value = json['name']
			document.getElementById('Form2_id').value = id0
			document.getElementById('Form2_id_project').value = json['id_project']

// Получаем ссылку на объект NicEdit

nicEditors.findEditor('Form2_description').setContent(json['description']);

// Получаем содержимое редактора
//var content = nicInstance.getContent();

// Устанавливаем содержимое редактора
//nicInstance.setContent(content);


			document.getElementById('Form2_description').innerHTML = json['description'];
			document.getElementById('Form2_type_project').value = json['type_project']
			document.getElementById('Form2_status').value = json['status']
			document.getElementById('Form2_remind_date').value = json['remind_date']
			document.getElementById('Form2_tag').value = json['tag']
			document.getElementById('Form2_remind').value = json['remind']
			document.getElementById('Form2_remind_time').value = json['remind_time']
			
			var tmp = json['data_create'].split(' ')[0]
			document.getElementById('Form2_data_create').value = tmp


		})





	}
	else {
		ModalWindowView.classList.remove("dm-overlayV");
		ModalWindowView.classList.add("dm-overlay")
	}
}


function Form2Post(id) {
	var name = document.getElementById('Form2_name').value
	var id_project = document.getElementById('Form2_id_project').value
	var remind_date = document.getElementById('Form2_remind_date').value
	var remind = document.getElementById('Form2_remind').value
	var description = nicEditors.findEditor('Form2_description').getContent();
	var type_project = document.getElementById('Form2_type_project').value
	var status0 = document.getElementById('Form2_status').value
	var tag = document.getElementById('Form2_tag').value
	var data_create = document.getElementById('Form2_data_create').value
	var id = document.getElementById('Form2_id').value
	var remind_time = document.getElementById('Form2_remind_time').value

	$.ajaxSetup({ timeout: 4000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form2_EditProject', remind: remind, remind_time: remind_time,remind_date: remind_date, id: id, name: name, id_project: id_project, description: description, type_project: type_project, status: status0, tag: tag, data_create: data_create, UserName: UserName,UserHash: UserHash }).done(function (data) {
		if (data === "Ok") {
			if (id_project > 0) Form1_Run_once = 0 // Обновить список проектов
			Form2_ShowHide()
			RunLast()
		}
		else
			alert(data)
	})

}




///хххххххххххххххххххххххххххх-Рудактировать Проект/заметкухххххххххххххххххххххххххххх





///----------------------------Добавляем  Пользователя---------------------------------
function Form3_ShowHide() { // Активировать Form3 Добавление обьявление

	var ModalWindowView = document.getElementById('Modal3_Head');
	if (ModalWindowView.classList.value == "dm-overlay") {
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');
		SettingsPanelHide()
	}
	else {
		ModalWindowView.classList.remove("dm-overlayV");
		ModalWindowView.classList.add("dm-overlay")
	}
}

function Form3Post() { // Отправить запрос

	var login = document.getElementById('Form3_login').value
	var password = document.getElementById('Form3_password').value



	$.ajaxSetup({ timeout: 3000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form3_RegistrationUser', login: login, password: password }).done(function (data) {

		if (data === "Ok") {
			Form3_ShowHide()
			Form4_ShowHide()
		}
		else
			alert(data)
	})

}
///ххххххххххххххххххххххххххххххДобавляем  Пользователяххххххххххххххххххххххххххххххххххх

///----------------------------Авторизируемся---------------------------------
function Form4_ShowHide() { // Активировать Form4 

	var ModalWindowView = document.getElementById('Modal4_Head');
	if (ModalWindowView.classList.value == "dm-overlay") {
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');
		SettingsPanelHide()
	}
	else {
		ModalWindowView.classList.remove("dm-overlayV");
		ModalWindowView.classList.add("dm-overlay")
	}
}

function Form4Post() { // Отправить запрос
	var login = document.getElementById('Form4_login').value
	var password = document.getElementById('Form4_password').value
	$.ajaxSetup({ timeout: 3000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form4_Authorization', login: login, password: password }).done(function (data) {

		if (data === "Ok")
			location.reload();
		else
			alert(data)
	})

}
///ххххххххххххххххххххххххххххххДобавляем  Пользователяххххххххххххххххххххххххххххххххххх




function Form1_GetProjectList() {

	if (Form1_Run_once == 0) {
		///-----------------Добавляем  списки форм добавления магазина------------------------

		$.ajaxSetup({ timeout: 3000 });
		$.post('https://api.allfilmbook.ru/project_api.php', { type: 'ProjectDeloList', UserName: UserName,UserHash: UserHash }).done(function (data) {
			var ModalWindow = document.getElementById('Form1_id_project');
			var ModalWindow1 = document.getElementById('Form2_id_project');
			json = JSON.parse(data);
			ModalWindow.innerHTML = "<option  value='0'>-</option>";
			ModalWindow1.innerHTML = "<option  value='0'>-</option>";
			json.forEach(function (item, i, json) {
				id = item['id']
				name = item['name']
				ProjectList[id] = name;
				ModalWindow.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + "</option>";
				ModalWindow1.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + "</option>";
			})
		})


		///хххххххххххххххххххххххххххххххххххххДобавляем  списки форм добавления магазина-хххххххххххххххххххххххххххххххххх		
	}
	Form1_Run_once = 1
}

///----------------------------Удалить проект---------------------------------
function Form5_ShowHide(id0) { // Активировать Form5 

	var ModalWindowView = document.getElementById('Modal5_Head');
	if (ModalWindowView.classList.value == "dm-overlay") {
		ModalWindowView.classList.remove("dm-overlay");
		ModalWindowView.classList.add('dm-overlayV');
		document.getElementById('Form5_id').value = id0
	}
	else {
		ModalWindowView.classList.remove("dm-overlayV");
		ModalWindowView.classList.add("dm-overlay")
	}
}

function Form5Post() {
	var id = document.getElementById('Form5_id').value
	$.ajaxSetup({ timeout: 3000 });
	$.post('https://api.allfilmbook.ru/project_api.php', { type: 'Form5_DeleteProject', id: id, UserName: UserName,UserHash: UserHash }).done(function (data) {
		if (data === "Ok") {
			Form5_ShowHide()
			RunLast()
		}
		else
			alert(data)
	})

}
///хххххххххххххххххххххххххххххххУдалить проектхххххххххххххххххххххххххххххххх


function FileMenegerHide() {
if(document.getElementById('file-manager-container').style.display == 'block')
	document.getElementById('file-manager-container').style.display = 'none'
else
	document.getElementById('file-manager-container').style.display = 'block'
}


function getFilesFrom() {

// Разделение строки на элементы массива
var fileList = CopyPastDate.split(';');

// Перебор значений
fileList.forEach(function(fileUrl) {
	fileUrl='http://allfilmbook.ru/project/'+fileUrl;
	const isImage = fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png');
	let lastIndex = fileUrl.lastIndexOf("/");
    let remaining = fileUrl.substring(lastIndex + 1);
	const tag = isImage ? `<img src="${fileUrl}" alt="${remaining}" align="none">` : ` <a href="${fileUrl}">${remaining}</a>`;

	nicEditors.findEditor('Form2_description').setContent(nicEditors.findEditor('Form2_description').getContent()+'<br>'+tag+'<br>');
	nicEditors.findEditor('Form1_description').setContent(nicEditors.findEditor('Form1_description').getContent()+'<br>'+tag+'<br>');

});
 /*

	// Парсим JSON данные
	let jsonData;
	try {
	  jsonData = JSON.parse(cookieData);
	} catch (e) {
	  console.error('Invalid JSON data in cookie');
	  return;
	}
  
	// Проверяем, что данные получены верно
	if (!jsonData || !jsonData['application/file-explorer-clipboard'] || jsonData['application/file-explorer-clipboard'].type !== 'copy') {
	  console.error('Invalid data format');
	  return;
	}
  
	const data = jsonData['application/file-explorer-clipboard'];
  
	// Получаем путь к папке
	const path = data.path.map(([id, name]) => name).join('/');
	const folderPath = `${data.group.replace('/php-filemanager/', '/upload/')}${path}/`;
  
	// Получаем список файлов
	const files = data.ids.map(id => {
	  const fileUrl = `${folderPath}${id}`;
	  const isImage = id.endsWith('.jpg') || id.endsWith('.png');
	  const tag = isImage ? `<img src="${fileUrl}" alt="${id}" align="none">` : ` <a href="${fileUrl}">${id}</a>`;

	  nicEditors.findEditor('Form2_description').setContent(nicEditors.findEditor('Form2_description').getContent()+'<br>'+tag+'<br>');
	  nicEditors.findEditor('Form1_description').setContent(nicEditors.findEditor('Form1_description').getContent()+'<br>'+tag+'<br>');
	  return [fileUrl, tag];
	});
  
*/


	return files;
  }


  function FilePut() {
    document.getElementById('filePutModal').style.display = 'block';
    document.getElementById('filePutOverlay').style.display = 'block';
}

function closeFilePut() {
    document.getElementById('filePutModal').style.display = 'none';
    document.getElementById('filePutOverlay').style.display = 'none';
	const fileInfo = document.getElementById('fileInput').value='';
}

function submitFilePut() {
    const fileInfo = document.getElementById('fileInput').value;
    getFilesFrom(fileInfo);
    closeFilePut();
}

function setCookieMy(name,data) {
    setCookie(name, data, {
        expires: new Date(Date.now() + 86400 * 1000 * 30 * 12),
        path: '/'
    })
    
    }

	const observer = new IntersectionObserver((entries) => {
		if ((window.scrollY > document.body.scrollHeight - 1500)&& window.scrollY > 5000 ) {
		   
			offset++;
			DiaryList(offset);
		//	ListFilm(year,list,tag); // Позвать функцию здесь
			let dd = document.getElementById('load-more-button')
			observer.observe(dd);
		}
	  }, {
		root: null, // Использовать все окно как корневой элемент
		threshold: 1.0,
	  });
	  let dd = document.getElementById('load-more-button')

	  setTimeout(observer.observe(dd), 5000);