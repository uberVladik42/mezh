'use strict';

let server_data = {
    stats: {
        class: '10И',

        lessons: [
            { id: '1', name: 'Математика' },
            { id: '2', name: 'Русский язык' },
            { id: '3', name: 'Информатика' },
            { id: '4', name: 'Физическая культура' },
            { id: '5', name: 'Проектная деятельность' },
        ],

        scores: [
            {
                day: '1',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '2', score: '5+', name: 'Ответ в классе' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                    { id: '5', score: '4', name: 'Ответ в классе' },
                ],
            },
            { day: '2', lessons: [{ id: '1', score: '5+', name: 'Домашнаяя работа' }] },
            {
                day: '3',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Ответ в классе' },
                    { id: '5', score: '4', name: 'Домашнаяя работа' },
                ],
            },

            {
                day: '4',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '2', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                ],
            },

            { day: '5', lessons: [{ id: '3', score: '4', name: 'Домашнаяя работа' }] },

            {
                day: '6',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                ],
            },

            { day: '7', lessons: [{ id: '3', score: '4', name: 'Домашнаяя работа' }] },

            {
                day: '8',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                ],
            },

            {
                day: '9',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '2', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                    { id: '4', score: '5+', name: 'В классе' },
                ],
            },

            {
                day: '10',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '2', score: '5+', name: 'Домашнаяя работа' },
                ],
            },

            {
                day: '11',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '5+', name: 'Домашнаяя работа' },
                ],
            },

            {
                day: '12',
                lessons: [
                    { id: '2', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                ],
            },

            {
                day: '13',
                lessons: [
                    { id: '1', score: '5+', name: 'Домашнаяя работа' },
                    { id: '2', score: '5+', name: 'Домашнаяя работа' },
                    { id: '3', score: '4', name: 'Домашнаяя работа' },
                ],
            },
        ],
    },
};

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

let schedule_container = document.getElementById('schedule-container');
let stats_container = document.getElementById('stats-container');

//# Сгенерировать все уроки на все дни
function generateMainPage() {
    // Удалить то что уже есть
    schedule_container.innerHTML = server_data.stats.class;
    stats_container.innerHTML = '';

    let stats_html = '';
    stats_html += `
        <div class="stats_header">Успеваемость</div>
        <div class="stats_body">
    `;
    stats_html += '<table>';
    // Дни
    stats_html += '<tr>';
    stats_html += '<th></th>';
    for (let days = 0; days < server_data.stats.scores.length; days++) {
        let day = server_data.stats.scores[days].day;
        stats_html += `
            <th id='day-${days}'>${day}</th>
        `;
    }
    stats_html += '</tr>';
    // Уроки
    for (let lessons = 0; lessons < server_data.stats.lessons.length; lessons++) {
        stats_html += '<tr>';
        let lesson_id = server_data.stats.lessons[lessons].id;
        stats_html += `
            <th id='lesson-${lessons}' style='text-align: left;'>${server_data.stats.lessons[lessons].name}</th>
        `;
        for (let days = 0; days < server_data.stats.scores.length; days++) {
            let day = server_data.stats.scores[days].day;
            let score = '';
            let name = '';
            for (let lesson2 = 0; lesson2 < server_data.stats.scores[days].lessons.length; lesson2++) {
                if (server_data.stats.scores[days].lessons[lesson2].id == lesson_id) {
                    score = server_data.stats.scores[days].lessons[lesson2].score;
                    name = server_data.stats.scores[days].lessons[lesson2].name;
                }
            }
            if (score == '') {
                stats_html += `
                    <td id='lesson-${lessons}-day-${days}'>${score}</td>
                `;
            } else {
                stats_html += `
                    <td id='good-lesson-${lessons}-day-${days}' class='notempty' title='${name}'>${score}</td>
                `;
            }
        }
        stats_html += '</tr>';
    }

    stats_html += '</table></div>';
    stats_html += `
        <div id='score-detail' class='score-detail'></div>
    `;
    stats_container.innerHTML = stats_html;
    stats_container.onmouseover = stats_container.onmouseout = mousehandler;
}

function getCoords(elem) {
    let box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset,
    };
}

function mousehandler(event) {
    if (!event.target.id.includes('good-lesson-')) return;
    let score_detail = document.getElementById('score-detail');
    let box = event.target.getBoundingClientRect();

    if (event.type == 'mouseover') {
        score_detail.innerHTML = event.target.title;
        score_detail.style.position = 'fixed';
        score_detail.style.left = box.right + 1 + 'px';
        score_detail.style.top = box.top + 1 + 'px';
        score_detail.style.height = event.target.style.height - 2;
        score_detail.style.hidden = false;
    }
    if (event.type == 'mouseout') {
        score_detail.innerHTML = '';
        score_detail.style.hidden = true;
        score_detail.style.left = '999999px';
        score_detail.style.top = '999999px';
    }
}

generateMainPage();
