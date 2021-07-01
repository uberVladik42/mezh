"use strict";

// let server_data = {
//     days: [
//         {
//             date: new Date(2021, 4, 10),
//             lessons: []
//         },
//         {
//             date: new Date(2021, 4, 11),
//             lessons: []
//         },
//         {
//             date: new Date(2021, 4, 12),
//             lessons: [
//                 {
//                     subject: 'математика',
//                     theme: 'Интегралы и вычисление площади крыма',
//                     homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
//                     start: new Date(2021, 4, 12, 8, 30),
//                     end: new Date(2021, 4, 12, 9, 15),
//                     joinlink: 'https://youtube.com',
//                     tests: [
//                         {
//                             id: '4387',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Типа тест можно выполнить',
//                             status: 'pending',
//                             expire_date: new Date(2021, 4, 16),
//                             questions: 14,
//                             correct: -1,
//                             mark: 'Не сделан',
//                         },
//                         {
//                             id: '1253',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Попа',
//                             status: 'ended',
//                             expire_date: new Date(2021, 4, 10),
//                             questions: 14,
//                             correct: 0,
//                             mark: '2',
//                         },
//                     ]
//                 },
//                 {
//                     subject: 'испанский',
//                     theme: 'Как достать Педро из ада',
//                     homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
//                     start: new Date(2021, 4, 12, 9, 30),
//                     end: new Date(2021, 4, 12, 10, 15),
//                     joinlink: 'https://youtube.com',
//                     tests: [
//                         {
//                             id: '234',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Типа тест можно выполнить',
//                             status: 'completed',
//                             expire_date: new Date(2021, 4, 16),
//                             questions: 14,
//                             correct: 13,
//                             mark: '5+',
//                         },
//                     ]
//                 },
//             ],
//         },
//         {
//             date: new Date(2021, 4, 13),
//             lessons: [
//                 {
//                     subject: 'математика',
//                     theme: 'Интегралы и вычисление площади кавказа',
//                     homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
//                     start: new Date(2021, 4, 13, 8, 30),
//                     end: new Date(2021, 4, 13, 9, 15),
//                     joinlink: 'https://youtube.com',
//                     tests: [
//                         {
//                             id: '123',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Типа тест можно выполнить',
//                             status: 'pending',
//                             expire_date: new Date(2021, 4, 16),
//                             questions: 14,
//                             correct: -1,
//                             mark: 'Не сделан',
//                         },
//                         {
//                             id: '321',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Попа',
//                             status: 'completed',
//                             expire_date: new Date(2021, 4, 10),
//                             questions: 14,
//                             correct: 8,
//                             mark: '3',
//                         },
//                     ]
//                 },
//                 {
//                     subject: 'математика',
//                     theme: 'Интегралы и вычисление площади кавказа',
//                     homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
//                     start: new Date(2021, 4, 13, 9, 30),
//                     end: new Date(2021, 4, 13, 10, 15),
//                     joinlink: 'https://youtube.com',
//                     tests: []
//                 },
//                 {
//                     subject: 'испанский',
//                     theme: 'Как засунуть Педро обратно',
//                     homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
//                     start: new Date(2021, 4, 13, 10, 30),
//                     end: new Date(2021, 4, 13, 11, 15),
//                     joinlink: 'https://youtube.com',
//                     tests: [
//                         {
//                             id: '123434',
//                             link: 'http://127.0.0.1:5500/pages/test',
//                             name: 'Типа тест можно выполнить',
//                             status: 'ended',
//                             expire_date: new Date(2021, 4, 8),
//                             questions: 14,
//                             correct: -1,
//                             mark: 'Не сделан',
//                         },
//                     ]
//                 },
//             ],
//         },
//         {
//             date: new Date(2021, 4, 14),
//             lessons: []
//         },
//     ],
// }



function getWeekDates(current) {
    let week= [];
    // Starting Monday not Sunday
    current.setDate((current.getDate() - current.getDay() +1));
    for (let i = 0; i < 7; i++) {
        week.push(
            new Date(current)
        );
        current.setDate(current.getDate() +1);
    }
    return week;
}

async function main() {
    const res = await request({
        url: '/api/get_schedule',
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
        },
    })
    console.log(res);

    if (res == 'student not found') {
        let days = []
        for (const day_date of getWeekDates(new Date(Date.now()))) {
            days = [...days, {
                date: day_date,
                lessons: []
            }]
        }

        server_data = {
            days
        }
    } else {
        server_data = parseServerData(res);
    }

    generateMainPage();
}


function parseServerData(data) {

    data = JSON.parse(data);
    for (const day of data.days) {
        day.date = new Date(day.start);
        for (const lesson of day.lessons) {
            lesson.start = new Date(lesson.start)
            lesson.end = new Date(lesson.end)
        }
    }
    return data
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

let schedule_container = document.getElementById('schedule-container');
let days_container = document.getElementById('days-container');

//# Сгенерировать все уроки на все дни
function generateMainPage() {
    // Удалить то что уже есть
    schedule_container.innerHTML = '';
    days_container.innerHTML = '';

    // Сгенерировать все дни (в функции потому что так понятнее)
    for (let i = 0; i < server_data.days.length; i++) {
        generateDay(i, server_data.days[i]);
    }

    // Плавно открыть все уроки и назначить функционал
    let cntr = 0;
    for (let i = 0; i < server_data.days.length; i++) {
        for (let j = 0; j < Math.max(server_data.days[i].lessons.length, 1); j++) {
            let lesson_container = document.getElementById(`day-${i}-lesson-${j}`);

            // Показать через какое то время
            setTimeout(() => {
                lesson_container.classList.remove('hidden');
            }, cntr * 100);
            cntr++;

            // Функционал
            addListenersToLesson(lesson_container);
        }
    }
}

//# Сгенерировать день и дать ему id
function generateDay(id, day) {

    // Сгенерировать панельку слева
    let schedule_html = '';
    schedule_html += `
    <div class="day-schedule">
    `
    if (day.lessons.length == 0) {
        schedule_html += `
            <div class="lesson-time no-lessons">
            </div>
            `
    } else {
        for (const lesson of day.lessons) {
            schedule_html += `
            <div class="lesson-time">
                <p class="time">
                ${lesson.start.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            })}
                </p>
                <div class="line"></div>
                <p class="time">
                    ${lesson.end.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            })}
                </p>
            </div>
            `
        }
    }
    schedule_html += `
    </div>
    `

    schedule_container.innerHTML += schedule_html;

    // Сгенерировать штуку справа
    let day_html = '';
    day_html += `
    <div id="day-${id}" class="day-container">
        <div class="day-header">
            <p class="date">${day.date.getDate()}</p>
            <p class="name">${capitalizeFirstLetter(day.date.toLocaleDateString('ru-RU', {weekday: 'long'}))}</p>
        </div>
    `

    // Уроки
    if (day.lessons.length == 0) { // Уроков нету
        day_html += `
        <div id="day-${id}-lesson-0" class="lesson-container hidden no-lessons">
            <div class="lesson-description">
                <div class="name">Уроков нету!</div>
                <div class="topic">мдааа....</div>
            </div>
        </div>
        `
    } else { // Уроки есть
        for (let i = 0; i < day.lessons.length; i++) {
            let lesson = day.lessons[i];
            let lesson_is_now = lesson.start < now && lesson.end > now;
            let lesson_is_over = lesson.end <= now;
            day_html += `
            <div id="day-${id}-lesson-${i}" class="lesson-container hidden ${lesson_is_now ? 'current' : ''} ${lesson_is_over ? 'ended' : ''}">
                <div class="lesson-description">
                    <div class="name">${capitalizeFirstLetter(lesson.subject)}</div>
                    <div class="topic">${lesson.theme}</div>
                    <div class="homework">${lesson.homework}</div>
                    <div class="join-button" data-join="${lesson.joinlink}">
                        ${lesson_is_over ? 'Запись занятия' : lesson_is_now ? 'Присоединиться' : 'Ссылка на занятие'}
                    </div>
                </div>
            `

            // Показать все прикрепленные тесты
            day_html += `
                <div class="lesson-tests">
            `
            for (const test of lesson.tests) {
                let status;
                switch (test.status) {
                    case 'completed':
                        status = 'Выполнен'
                        break;

                    case 'pending':
                        status = 'Сделать до ' + test.expire_date.toLocaleDateString().replace(/\//g, '.')
                        break;

                    case 'ended':
                        status = 'Завершен'
                        break;

                    default:
                        status = ''
                        break;
                }
                day_html += `
                    <a id="${test.id}" class="test ${test.status}" href="${test.link}">
                        <h1 class="title">${capitalizeFirstLetter(test.name)}</h1>
                        <p class="status">${capitalizeFirstLetter(status)}</p>
                        <div class="test-footer">
                            <p ${test.status == 'completed' ? 'class="mark"' : ''}>${test.mark}</p>
                            <p>${test.correct == -1 ? '?' : test.correct} / ${test.questions}</p>
                        </div>
                    </a>
                `
            }
            day_html += `
                </div>
            </div>
            `
        }
    }
    day_html += `
    </div>
    `

    days_container.innerHTML += day_html;
}

//# Навесить слушателей на нужный урок
function addListenersToLesson(lesson_container) {
    if (!lesson_container.classList.contains('no-lessons')) {
        let join_button = lesson_container.querySelector('.join-button');
        join_button.addEventListener('click', () => {
            let link = join_button.dataset.join;
            console.log(link);
        });
    }
}

main()

