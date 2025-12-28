
function AvtorizationPost() { 
    var login = document.getElementById('Avtorization_login').value
    var password = document.getElementById('Avtorization_password').value
    $.ajaxSetup({timeout: 3000});
    $.get('https://api.allfilmbook.ru/user/Authorization/mobile1.php', {login: login, password: password}).done(function (data) {

      dates = JSON.parse(data);
        if(dates.answer === 'Ok') {
            setCookieMy("UserId",1)
            setCookieMy("user_hash",dates.hash)
            setCookieMy("user_name",login)
            location.reload();
        
        }
        else
            alert(data)
    })

}


    
    
