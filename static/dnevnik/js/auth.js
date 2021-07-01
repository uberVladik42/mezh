"use strict";
let forms_container = document.querySelector('.forms');
let forms = document.querySelectorAll('.forms > div');
let selected = 0;

//# Открыть нужную по счету форму (от 0 до кол-ва форм)
function selectForm(index) {
    for (let i = 0; i < forms.length; i++) {
        if (i < index) {
            forms[i].classList.remove('toright');
            forms[i].classList.add('toleft');
        } else if (i > index) {
            forms[i].classList.add('toright');
            forms[i].classList.remove('toleft');
        } else {
            forms[i].classList.remove('toright');
            forms[i].classList.remove('toleft');
        }
    }
}

selectForm(selected);
let pg_switcher_1 = document.querySelectorAll('#pg-1');
pg_switcher_1.forEach((el) => {
    el.addEventListener('click', () => {
        selected = 0
        selectForm(selected);
    });
})


let pg_switcher_2 = document.querySelectorAll('#pg-2');
pg_switcher_2.forEach((el) => {
    el.addEventListener('click', () => {
        selected = 1
        selectForm(selected);
    });
})


//# у нас пока нет верификации, поэтому пусть весит без дела
let pg_switcher_3 = document.querySelectorAll('#pg-3');
pg_switcher_3.forEach((el) => {
    el.addEventListener('click', () => {
        selected = 2
        selectForm(selected);
    });
})
//# Шобы крутилось кароч для теста
// setInterval(() => {
//    selectForm(selected);
//  selected = (selected + 1) % 3
//}, 1000)


document.getElementById('login-submit').addEventListener('click', async (e) => {
    e.preventDefault()

    let username = document.getElementById('login-username-input')
    let password = document.getElementById('login-password-input')

    if (!(username.value.length) || !(password.value.length)) {
        alert('empty credentials')
    } else {
        const res = await request({
            url: '/api/auth_login',
            headers: {
                'X-CSRFToken': csrf_token,
            },
            body: {
                username: username.value,
                password: password.value,
                dataType: "JSON",
            },
        })
        if (res == 'success') {
            window.location = '/'
        } else {
            alert(res)
        }
    }
});

document.getElementById('register-submit').addEventListener('click', async (e) => {
    e.preventDefault()

    let username = document.getElementById('register-username-input')
    let email = document.getElementById('register-email-input')
    let password1 = document.getElementById('register-password-input1')
    let password2 = document.getElementById('register-password-input2')

    if (!(username.value.length) || !(password1.value.length) || !(password2.value.length)) {
        alert('empty credentials')
    } else {
        const res = await request({
            url: '/api/auth_register',
            headers: {
                'X-CSRFToken': csrf_token,
            },
            body: {
                username: username.value,
                email: email.value,
                password1: password1.value,
                password2: password2.value,
                dataType: "JSON",
            },
        })
        if (res == 'success') {
            window.location = '/'
        } else {
            alert(res)
        }
    }
});
