let main = document.getElementsByTagName('main')[0]

function parseServerData(obj) {
    return obj;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

let server_data = {
    subject: 'математика',
    theme: 'Интегралы и вычисление площади крыма',
    homework: 'упр. 1-4, стр. 120-121, стр. 120-121',
    teacher: 'Тамара Степановна',
    start: new Date(2021, 4, 12, 8, 30),
    end: new Date(2021, 4, 12, 9, 15),
    joinlink: 'https://youtube.com',
    tests: [
        {
            id: '4387',
            link: 'http://127.0.0.1:5500/pages/test',
            name: 'Типа тест можно выполнить',
            status: 'pending',
            expire_date: new Date(2021, 4, 16),
            questions: 14,
            correct: -1,
            mark: 'Не сделан',
        },
        {
            id: '1253',
            link: 'http://127.0.0.1:5500/pages/test',
            name: 'Попа',
            status: 'ended',
            expire_date: new Date(2021, 4, 10),
            questions: 14,
            correct: 0,
            mark: '2',
        },
    ]
}

function displayLesson(data) {
    document.getElementById('lesson-name').innerHTML = capitalizeFirstLetter(data.subject);
    document.getElementById('lesson-theme').innerHTML = capitalizeFirstLetter(data.theme);
    document.getElementById('lesson-teacher').innerHTML = data.teacher;

    let month = '';
    switch (data.start.getMonth()) {
        case 1:
            month = 'января';
            break;

        case 2:
            month = 'февраля';
            break;

        case 3:
            month = 'марта';
            break;
            
        case 4:
            month = 'апреля';
            break;
    
        case 5:
            month = 'мая';
            break;
    
        case 6:
            month = 'инюня';
            break;
    
        case 7:
            month = 'июля';
            break;
    
        case 8:
            month = 'августа';
            break;

        case 9:
            month = 'сентября';
            break;
    
        case 10:
            month = 'октября';
            break;
    
        case 11:
            month = 'ноября';
            break;
    
        case 12:
            month = 'декабря';
            break;
    
        default:
            break;
    }
    let date = '';
    date += `${data.start.getDay()} ${month}, 
        ${data.start.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})} - 
        ${data.end.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}`;
    document.getElementById('lesson-date').innerHTML = capitalizeFirstLetter(date);

    document.getElementById('homework').innerHTML = data.homework;

    let tests_html = '';
    for (const test of data.tests) {
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
        tests_html += `
            <a id="${test.id}" class="test ${test.status}" href="${test.link}">
                <h1 class="title">${capitalizeFirstLetter(test.name)}</h1>
                <p class="status">${capitalizeFirstLetter(status)}</p>
                <div class="test-footer">
                    <p ${test.status == 'completed' ? 'class="mark"': ''}>${test.mark}</p>
                    <p>${test.correct == -1 ? '?' : test.correct} / ${test.questions}</p>
                </div>
            </a>
        `
    }

    document.getElementById('tests-container').innerHTML = tests_html;
}

async function main() {
    displayLesson(server_data);
}