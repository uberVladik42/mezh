"use strict";

let now = new Date();

//# Поменять тему
function setTheme(to) {
    //Сохранить в кэш дабы при перезаходе не сбрасывалось
    localStorage.setItem('theme', to);

    document.querySelector('body').classList.remove(`${theme}-theme`);
    document.querySelector('body').classList.add(`${to}-theme`);

    document.getElementById('logo').setAttribute('href', `/res/logo-${to}.png`);

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

//. Выход

document.getElementById('logout').addEventListener('click', () => {
    window.location = '/pages/auth';
});