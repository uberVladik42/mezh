"use strict";

let now = new Date();

//# Поменять тему
document.body.style.transition = ``;
document.querySelector('header').style.transition = ``;

function setTheme(to) {
    //Сохранить в кэш дабы при перезаходе не сбрасывалось
    localStorage.setItem('theme', to);

    document.body.classList = '';
    document.body.classList.add(`${to}-theme`);

    if (theme != to) {
        document.body.style.transition = `
            color .64s cubic-bezier(0.215, 0.610, 0.355, 1), 
            background-color .64s cubic-bezier(0.215, 0.610, 0.355, 1), 
            border-color .64s cubic-bezier(0.215, 0.610, 0.355, 1)
        `;

        document.querySelector('header').style.transition = `
            height .16s cubic-bezier(0.215, 0.610, 0.355, 1), 
            background-color .64s cubic-bezier(0.215, 0.610, 0.355, 1)
        `;

        setTimeout(() => {
            document.body.style.transition = ``;
            document.querySelector('header').style.transition = ``;
        }, 640);
    }

    document.getElementById('logo').setAttribute('href', `/static/res/logo-${to}.png`);

    theme = to;
}

//# Проверить есть ли что в кэше, и если нету, то поставить дефолтную тему (светлую потому что я ненавижу учеников)
let theme = localStorage.getItem('theme');
if (theme == undefined) {
    if (now.getHours() < 7 || now.getHours() >= 20) {
        theme = 'dark';
        localStorage.setItem('theme', 'dark');
    } else {
        theme = 'light';
        localStorage.setItem('theme', 'light');
    }
}

setTheme(theme)

//# Кнопка смены темы
let theme_switcher_el = document.getElementById('theme-switch');
theme_switcher_el.addEventListener('click', () => {
    if (theme == 'light') {
        setTheme('dark');
        theme_switcher_el.innerHTML = 'Темная тема';
    } else {
        setTheme('light');
        theme_switcher_el.innerHTML = 'Светлая тема';
    }
});

//# Проверить на сколько прокрутили страницу, и в завимисости от этого уменьшить / увеличить хедер
function updateHeader() {
    if (window.scrollY > 64) {
        document.querySelector('body').classList.add('header-minimized');
    } else {
        document.querySelector('body').classList.remove('header-minimized');
    }
}

document.addEventListener('scroll', updateHeader);
updateHeader()


async function request({url, method = "POST", headers = {}, body}) {
    const res = await fetch(url, {
        method: method,
        mode: 'same-origin',
        headers: {
            ...headers,
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then(res => res.text());
    console.log('ok');
    return res;
}


//. Выход

document.getElementById('logout').addEventListener('click', async () => {
    const res = await request({
        url: '/api/auth_logout',
        headers: {
            'X-CSRFToken': csrf_token,
        },
    })
    if (res == 'success') {
        window.location = '/auth';
    } else {
        alert(res)
    }
});


//. Вход

// document.getElementById('login').addEventListener('click', () => {
//     window.location = '/auth';
// });
