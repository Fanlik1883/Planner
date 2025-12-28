const TIME1DAY = 86400000;
const TIMEREQUEST = 5000;
var ViewClose = 0;
var ViewHide = 0
		//var Razdel_id = 9;
var ProjectList = [];


var OutList = new Array();

class User {
    constructor() {
        this.UserHash = getCookie("user_hash") || '';
        this.UserName = getCookie("user_name") || '';
    }
}

const user = new User();

if (!user.UserHash || !user.UserName) {
    document.getElementById('Avtorization_link').innerHTML = '<li><a href="#" onclick=\'ShowMessage("Avtorization_Head")\'>Войти</a></li>';
}

var offset = 0;

class Planer {
    constructor() {
        this.RazdelId = Number(getCookie('UserPage')) || 9;
        this.platform = (window.cordova && window.cordova.platformId) ? window.cordova.platformId : 'browser';
        this.Form1_Run_once = 0;
    }
}

class VisualPanel {
    constructor() {
        this.HeadDates = {
            9: { title: 'Выполнить', name: 'PerformList', includes: "" },
            15: { title: 'Дело', name: 'TaskList', includes: "" },
            1: { title: 'Проекты', name: 'ProjectList', includes: "" },
            13: { title: "Дневник", includes: "<input type='text' id='search' oninput='renderTable()' value=''>", name: 'DiaryList' },
            10: { title: 'Желания', name: 'WishesList', includes: "" },
            12: { title: 'Идеи', name: 'IdeaList', includes: "" },
            11: { title: 'Образ жизни', name: 'LifestyleList', includes: "" },
            14: { title: 'Справочные данные', name: 'ReferenceList', includes: "" },
            16: { title: "Статистика данные", includes: "<br><input id='Form10_name'  style='width: 80%;' type='text' size='40'><input type='hidden' id='Form10_id_project' value='0'><input type='hidden' id='Form10_type_project' value='16'><input type='hidden' id='Form10_status' value='1'><button onclick='formDataHandler.postForm10()' style='width: 15%;' type='submit'>Добавить</button>", name: 'StatisticList' },
        };
        this.ViewPort = document.getElementById('ViewPort');
        this.ViewPortHead = document.getElementById('HeadShop');
    }
}

const planer = new Planer();
const visualpanel = new VisualPanel();

GetProjectList();
TaskAll();

var errorCount = 0;

function TaskAll(RazdelId = 0, offset = 0) {
    if (RazdelId == 0) RazdelId = planer.RazdelId;
    setCookieMy('UserPage', RazdelId);
    planer.RazdelId = RazdelId;
    visualpanel.ViewPort.innerHTML = '';
    visualpanel.ViewPortHead.innerHTML = "<h3>" + visualpanel.HeadDates[RazdelId].title + "</h3>" + visualpanel.HeadDates[RazdelId].includes;
    
    $.ajaxSetup({ timeout: TIMEREQUEST });
    $.post('https://api.allfilmbook.ru/project_api.php', { 
        type: visualpanel.HeadDates[RazdelId].name, 
        ViewClose: ViewClose, 
        ViewHide: ViewHide, 
        UserName: user.UserName, 
        UserHash: user.UserHash 
    }).done(function (data) {
        json = JSON.parse(data);
        OutList = OutList.concat(json);
        renderTable(RazdelId);
    }).fail(function () {
        errorCount++;
        if (errorCount < 3) {
			if (confirm('Не удалось загрузить данные. Повторить запрос?')) {
                TaskAll(RazdelId, offset);
            }
            
        } else {
            errorCount = 0;
            alert('Нет доступа в интернет.');
        }
    });
}

function renderTable(Razdel_id = 0) {
    Razdel_id = planer.RazdelId;
    var search = document.getElementById('search')?.value || "";

    if (search.length > 2) {
        visualpanel.ViewPort.innerHTML = '';
    }
    
    json.forEach(function (item, i, OutList) {
        if (search.length > 2) {
            if (item.name.toLowerCase().includes(search.toLowerCase())) {
                addTableRow(item, Razdel_id);
            }
        } else {
            addTableRow(item, Razdel_id);
        }
    });
}

function addTableRow(item, Razdel_id) {
    let liLast = document.createElement('tr');
    
    if (Razdel_id == 1 || Razdel_id == 10 || Razdel_id == 11 || Razdel_id == 12 || Razdel_id == 15) {
        liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='formDataHandler.showHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>";
    } else if (Razdel_id == 9) {
        liLast.innerHTML = "<td ><input type='checkbox' onclick='Done(" + item['id'] + ")'> <label onclick='formDataHandler.showHideDescription(" + item['id'] + ")' >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/pluse1day.png'  onclick='Pluse1Day(" + item['id'] + ")' style='width: 24px;display: unset;'  title='+ 1 День'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'>Проект: " + ProjectList[item['id_project']] + "<hr>" + item['description'] + "</div></td>";
    } else if (Razdel_id == 13 || Razdel_id == 14) {
        liLast.innerHTML = "<td ><label onclick='formDataHandler.showHideDescription(" + item['id'] + ")'>" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></label><div class='dropdown-Description' id='Description_" + item['id'] + "'><hr>" + item['description'] + "</div></td>";
    } else if (Razdel_id == 16) {
        liLast.innerHTML = "<td ><label >" + item['name'] + " " + item['remind_date'] + "  <img src='img/baseline_edit_black_24dp.png'  onclick='formDataHandler.showHideForm2(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Редактировать'><img src='img/baseline_delete_black_24dp.png'  onclick='formDataHandler.showHideForm5(" + item['id'] + ")' style='width: 24px;display: unset;'  title='Удалить'></td>";
    }
    
    visualpanel.ViewPort.append(liLast);
}

function Done(id) {
    $.ajaxSetup({ timeout: TIMEREQUEST });
    $.post('https://api.allfilmbook.ru/project_api.php', { 
        type: 'Done', 
        id: id, 
        UserName: user.UserName, 
        UserHash: user.UserHash 
    }).done(function (data) {
        if (data === "Ok") {
            TaskAll();
        } else {
            alert(data);
        }
    });
}

function Pluse1Day(id) {
    $.ajaxSetup({ timeout: TIMEREQUEST });
    $.post('https://api.allfilmbook.ru/project_api.php', { 
        type: 'Pluse1Day', 
        id: id, 
        UserName: user.UserName, 
        UserHash: user.UserHash 
    }).done(function (data) {
        if (data === "Ok") {
            TaskAll();
        } else {
            alert(data);
        }
    });
}

var how = 0;

function SettingsPanelHide(id) {
    if (how == 0) {
        document.getElementById("myDropdown").classList.toggle("show");
        how = 1;
    } else {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
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
        
        // Form10 элементы
        this.Form10_id_project = document.getElementById('Form10_id_project');
        this.Form10_type_project = document.getElementById('Form10_type_project');
        this.Form10_status = document.getElementById('Form10_status');
        
        // Авторизация элементы
        this.Avtorization_login = document.getElementById('Avtorization_login');
        this.Avtorization_password = document.getElementById('Avtorization_password');


    }
    
    resetForm1() {
        this.Form1_name.value = "";
        this.Form1_id_project.value = 0;
        this.Form1_type_project.value = "";
        this.Form1_tag.value = "";
        this.Form1_remind.value = "";
        this.Form1_data_create.value = "";
        this.Form1_remind_date.value = "";
        this.Form1_status.value = 1;
        this.Form1_remind_time.value = "";
        
        if (nicEditors.findEditor('Form1_description')) {
            nicEditors.findEditor('Form1_description').setContent('');
        }
    }
    
    resetForm2() {
        this.Form2_name.value = "";
        this.Form2_id.value = "";
        this.Form2_id_project.value = 0;
        this.Form2_type_project.value = "";
        this.Form2_tag.value = "";
        this.Form2_remind.value = "";
        this.Form2_data_create.value = "";
        this.Form2_remind_date.value = "";
        this.Form2_status.value = 1;
        this.Form2_remind_time.value = "";
        
        if (nicEditors.findEditor('Form2_description')) {
            nicEditors.findEditor('Form2_description').setContent('');
        }
    }
    
    
    resetForm4() {
        this.Form4_login.value = "";
        this.Form4_password.value = "";
    }
    
    resetForm10() {
        document.getElementById('Form10_name').value = "";
        this.Form10_id_project.value = 0;
        this.Form10_type_project.value = 16;
        this.Form10_status.value = 1;
    }
    
    
    Form1Post() {
        $.ajaxSetup({ timeout: TIMEREQUEST });
        $.post('https://api.allfilmbook.ru/project_api.php', { 
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
            UserHash: user.UserHash 
        }).done((data) => {
            if (data === "Ok") {
                if (this.Form1_id_project.value > 0) planer.Form1_Run_once = 0;
                this.showHideForm1();
                TaskAll();
            } else {
                alert(data);
            }
        });
    }
    
    showHideForm1() {
        GetProjectList();
        this.resetForm1();
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        
        this.Form1_data_create.value = yyyy + "-" + mm + '-' + dd;
        
        var ModalWindowView = document.getElementById('Modal1_Head');
        if (ModalWindowView.classList.value == "casementHide") {
            this.Form1_type_project.value = planer.RazdelId;
            ModalWindowView.classList.remove("casementHide");
            ModalWindowView.classList.add('casementView');
        } else {
            ModalWindowView.classList.remove("casementView");
            ModalWindowView.classList.add("casementHide");
        }
    }
    
    postForm2() {
        $.ajaxSetup({ timeout: TIMEREQUEST });
        
        $.post('https://api.allfilmbook.ru/project_api.php', { 
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
            UserHash: user.UserHash 
        }).done((data) => {
            if (data === "Ok") {
                if (this.Form2_id_project.value > 0) planer.Form1_Run_once = 0;
                this.showHideForm2();
                TaskAll();
            } else {
                alert(data);
            }
        });
    }
    
    showHideForm2(id0 = null) {
        GetProjectList();
        
        const ModalWindowView = document.getElementById('Modal2_Head');
        
        if (ModalWindowView.classList.value == "casementHide") {
            ModalWindowView.classList.remove("casementHide");
            ModalWindowView.classList.add('casementView');
            
            if (id0) {
                $.post('https://api.allfilmbook.ru/project_api.php', { 
                    type: 'ProjectView', 
                    id: id0, 
                    UserName: user.UserName,
                    UserHash: user.UserHash 
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
            ModalWindowView.classList.remove("casementView");
            ModalWindowView.classList.add("casementHide");
        }
    }
    
 

      
    showHideForm5(id0 = null) {
        var ModalWindowView = document.getElementById('Modal5_Head');
        if (ModalWindowView.classList.value == "casementHide") {
            ModalWindowView.classList.remove("casementHide");
            ModalWindowView.classList.add('casementView');
            
            if (id0) {
                this.Form5_id.value = id0;
            }
        } else {
            ModalWindowView.classList.remove("casementView");
            ModalWindowView.classList.add("casementHide");
        }
    }
    
    postForm5() {
        $.ajaxSetup({ timeout: TIMEREQUEST });
        $.post('https://api.allfilmbook.ru/project_api.php', { 
            type: 'Form5_DeleteProject', 
            id: this.Form5_id.value, 
            UserName: user.UserName,
            UserHash: user.UserHash 
        }).done((data) => {
            if (data === "Ok") {
                this.showHideForm5();
                TaskAll();
            } else {
                alert(data);
            }
        });
    }
    
    postForm10() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var data_create = yyyy + "-" + mm + '-' + dd;
        
        $.ajaxSetup({ timeout: TIMEREQUEST });
        $.post('https://api.allfilmbook.ru/project_api.php', { 
            type: 'Form1_AddProject', 
            remind: '', 
            remind_date: '', 
            name: document.getElementById('Form10_name').value, 
            id_project: this.Form10_id_project.value, 
            description: '', 
            type_project: this.Form10_type_project.value, 
            status: this.Form10_status.value, 
            tag: '', 
            data_create: data_create, 
            UserName: user.UserName,
            UserHash: user.UserHash 
        }).done((data) => {
            if (data === "Ok") {
                if (this.Form10_id_project.value > 0) planer.Form1_Run_once = 0;
                this.resetForm10();
                TaskAll();
            } else {
                alert(data);
            }
        });
    }
    
    showHideDescription(id) {
        const descriptionElement = document.getElementById("Description_" + id);
        
        if (descriptionElement.classList.value == "dropdown-Description") {
            descriptionElement.classList.toggle("show");
            
            if ((planer.RazdelId == 15 || planer.RazdelId == 1) && document.getElementById('ProjectList_' + id) == null) {
                TaskInProjectList(id);
            }
        } else {
            const dropdowns = document.getElementsByClassName("dropdown-Description");
            
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains("show")) {
                    openDropdown.classList.remove("show");
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
            UserHash: user.UserHash 
        }).done(function (data) {

            json = JSON.parse(data);
            formDataHandler.Form1_id_project.innerHTML = "<option  value='0'>-</option>";
            formDataHandler.Form2_id_project.innerHTML = "<option  value='0'>-</option>";
            json.forEach(function (item, i, json) {
				var id= item['id'];
                ProjectList[id] = item['name'];
                formDataHandler.Form1_id_project.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + "</option>";
                formDataHandler.Form2_id_project.innerHTML += "<option value='" + item['id'] + "'>" + item['name'] + "</option>";
            });
        });
    }
    planer.Form1_Run_once = 1;
}


function getFilesFrom() {
    var fileList = CopyPastDate.split(';');
    
    fileList.forEach(function(fileUrl) {
        fileUrl = 'http://allfilmbook.ru/project/' + fileUrl;
        const isImage = fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png');
        let lastIndex = fileUrl.lastIndexOf("/");
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
    const fileInfo = document.getElementById('fileInput').value = '';
}

function submitFilePut() {
    const fileInfo = document.getElementById('fileInput').value;
    getFilesFrom(fileInfo);
    closeFilePut();
}



const observer = new IntersectionObserver((entries) => {
    if ((window.scrollY > document.body.scrollHeight - 1500) && window.scrollY > 5000) {
        offset++;
        DiaryList(offset);
        let dd = document.getElementById('load-more-button');
        observer.observe(dd);
    }
}, {
    root: null,
    threshold: 1.0,
});

let dd = document.getElementById('load-more-button');
setTimeout(() => observer.observe(dd), 5000);


function ShowMessage(name) {
  var ModalWindowView = document.getElementById(name);
		ModalWindowView.classList.remove("casementHide");
		ModalWindowView.classList.add('casementView');
}

function HideMessage(name) {
  var ModalWindowView = document.getElementById(name);
  ModalWindowView.classList.remove("casementView");
  ModalWindowView.classList.add("casementHide")
}
