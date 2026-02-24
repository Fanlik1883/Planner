const TIME1DAY = 86400000;
const TIMEREQUEST = 5000;
var ViewClose = 0;
var ViewHide = 0;
var ProjectList = [];


const planer = new Planer();
const visualpanel = new VisualPanel();



var errorCount = 0;




const formDataHandler = new FormDataHandler();
const fileHandler = new FileHandler();

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

