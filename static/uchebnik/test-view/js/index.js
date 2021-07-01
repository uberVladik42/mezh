'use strict';

// Инфа о тесте (призодит с сервера в виде json)
// let data = {
//    title: 'Подгодовка к ОГЭ. Производные',
//    time: 600,
//    questions: [
//        {
//            body: 'Что такое производная',
//            option_type: 'textbox',
//        },
//        {
//            body: 'А теперь, что такое производная',
//            option_type: 'radiobutton',
//            value: ['Да', 'Нет', 'Сани ответ'],
//        },
//        {
//            body: 'А теперь, что такое производная(Адаптивно)',
//            option_type: 'radiobutton',
//            value: ['Да', 'Нет', 'Сани ответ', 'Да', 'Нет', 'Сани ответ'],
//        },
//        {
//            body: 'Ну все же, что такое производная',
//            option_type: 'checkbox',
//            value: ['Да', 'Нет', 'Сани ответ'],
//        },
//        {
//            body: 'Вычислите производную <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmklguo.ru%2Fwp-content%2Fuploads%2Fzadachi-na-proizvodnuyu_70.jpg&f=1&nofb=1" alt="Если у вас не отображается картинка, напишите учителю."> В ответ запищите <b>ТОЛЬКО</b> коэфициенты',
//            option_type: 'textbox',
//        },
//        {
//            body: 'Вычислите производную <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmklguo.ru%2Fwp-content%2Fuploads%2Fzadachi-na-proizvodnuyu_91.jpg&f=1&nofb=1" alt="Если у вас не отображается картинка, напишите учителю."> В ответ запищите <b>ТОЛЬКО</b> коэфициенты',
//            option_type: 'textbox',
//        },
//        {
//            body: 'Вычислите производную <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmklguo.ru%2Fwp-content%2Fuploads%2Fzadachi-na-proizvodnuyu_70.jpg&f=1&nofb=1" alt="Если у вас не отображается картинка, напишите учителю."> В ответ запищите <b>ТОЛЬКО</b> коэфициенты',
//            option_type: 'textbox',
//        },
//    ],
// };


let data = {};

function parseServerData(_server_data) {
    let new_data = {
        title: _server_data.title,
        time: _server_data.time,
        questions: []
    };

    for (const server_question of _server_data.questions) {
        let question = {
            body: server_question.text,
            option_type: server_question.answers[0].type,
            valid_input: server_question.answers[0].valid_input,
            value: []
        }

        for (const answer of server_question.answers) {
            question.value.push(answer.text)
        }

        new_data.questions.push(question);
    }

    return new_data;
}

//# Переменные
let test_name_el = document.getElementById('test-name');
let time_remaining_el = document.getElementById('time-remaining');
let time_remaining = data.time;
let timer = null;
let on_question = 0;
let path;

//# Инфа о тесте (призодит с сервера в виде json)
async function getData() {
    let id = `${window.location}`.split('/');
    id = id[id.length - 1]
    data = await request({
        url: 'https://mezh-dxd.ml/api/get_exercise_data/' + id,
        headers: {
            'X-CSRFToken': csrf_token,
        },
    });

    data = parseServerData(JSON.parse(data));
    path = 'https://mezh-dxd.ml/api/view_exercise/' + id;

    generateTest();
}

getData();


//# Генерация теста
function generateTest() {
    // Заполнение верхней панели (со временем и названием)
    test_name_el.innerHTML = data.title;
    time_remaining = data.time;
    time_remaining_el.innerHTML = `<span>Осталось:</span> ${(time_remaining / 60 < 10 ? '0' : '') + Math.floor(time_remaining / 60)}:${(time_remaining % 60 < 10 ? '0' : '') + (time_remaining % 60)}`;
    time_remaining--;
    timer = setInterval(() => {
        time_remaining_el.innerHTML = `<span>Осталось:</span> ${(time_remaining / 60 < 10 ? '0' : '') + Math.floor(time_remaining / 60)}:${(time_remaining % 60 < 10 ? '0' : '') + (time_remaining % 60)}`;
        time_remaining--;
    }, 1000);

    // Сгенерировать вопросы
    generateQuestions();
}

//# Генерация вопросов
function generateQuestions() {
    let questions_list_el = document.getElementById('questions-list');
    let nav_list_el = document.getElementById('test-nav');

    // Очистить все переключатели вопросов (которые типа 1, 2, 3...)
    questions_list_el.innerHTML = '';
    let tmpHTML = '';

    // Добавить кнопку "на предыдущий вопрос" (стрелочка влево которая)
    nav_list_el.innerHTML = `<div id="back-button" class="list-el list-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="14.414" height="10.828" viewBox="0 0 14.414 10.828">
            <g id="Component_6_1" data-name="Component 6 – 1" transform="translate(1 1.414)">
                <path id="Path_477" data-name="Path 477" d="M16539.912,2851.6l4,4,4-4" transform="translate(2863.596 -16539.912) rotate(90)" fill="none" stroke="var(--text)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity="1"/>
                <path id="Path_476" data-name="Path 476" d="M16539.912,2851.6l4,4,4-4" transform="translate(2855.596 -16539.912) rotate(90)" fill="none" stroke="var(--text)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity="1"/>
            </g>
        </svg>
    </div>`;

    // Добавить каждый вопрос (который типа 1, 2, 3...)
    for (let i = 0; i < data.questions.length; i++) {
        let question = data.questions[i];

        // Сам вопрос
        if (question.option_type == 'textbox') {
            tmpHTML += `<div class="question toleft">
                <div class="question-body">
                    ${question.body}
                </div>

                <form class="question-answer" id="answer-field-${i}" data-type="text">
                    <input data-type="text" type="text" class="answer-field maximized" placeholder="Ваш ответ">
                    <input id="answer-submit-${i}" type="submit" class="submit-button unactive" value="${i == data.questions.length - 1 ? 'Завершить' : 'Далее'}">
                </form>
            </div>`;
        } else if (question.option_type == 'checkbox') {
            tmpHTML += `<div class="question toleft">
                <div class="question-body">
                    ${question.body}
                </div>

                <form class="question-answer">
                <div class="complex-answer" id="answer-field-${i}" data-type="checkbox">`;
            for (let j = 0; j < question.value.length; j++) {
                tmpHTML += `<label class="answer-box" for="answer-field-${i}-${j}">
                    <input name="answer-field-${i}" id="answer-field-${i}-${j}" data-type="checkbox" type="checkbox" name="ans" value="ans-${i}-${j}" class="answer-checkbox maximized">
                    <span class="checkmark"></span>
                    ${question.value[j]}
                </label>`;
            }
            tmpHTML += `</div>
                <input id="answer-submit-${i}" type="submit" class="submit-button unactive" value="${i == data.questions.length - 1 ? 'Завершить' : 'Далее'}">
                </form>
            </div>`;
        } else if (question.option_type == 'radio') {
            tmpHTML += `<div class="question toleft">
                <div class="question-body">
                    ${question.body}
                </div>

                <form class="question-answer">
                <div class="complex-answer" id="answer-field-${i}" data-type="radio">`;
            for (let j = 0; j < question.value.length; j++) {
                tmpHTML += `<label class="answer-box" for="answer-field-${i}-${j}">
                    <input name="answer-field-${i}" id="answer-field-${i}-${j}" data-type="radio" type="radio" name="ans" value="ans-${i}-${j}" class="answer-radio maximized">
                    <span class="checkmark"></span>
                    ${question.value[j]}
                </label>`;
            }
            tmpHTML += `</div>
                <input id="answer-submit-${i}" type="submit" class="submit-button unactive" value="${i == data.questions.length - 1 ? 'Завершить' : 'Далее'}">
                </form>
            </div>`;
        }

        // Ссылка на вопрос (сверху которая с цифоркой)
        nav_list_el.innerHTML += `<div id="questions-nav-${i}" class="list-el list-num">${i + 1}</div>`;
    }

    questions_list_el.innerHTML += tmpHTML;

    // Добавить подтверждение отправки результатов к перечню опросов
    questions_list_el.innerHTML += `<div class="question end-question toright">
        <div class="question-body">
            Завершить прохождение теста?
        </div>

        <div class="qustion-answer">
            <input id="end-test" type="button" class="submit-button" value="Завершить">
            <input id="goback-test" type="button" class="end-button" value="Вернуться">
        </div>
    </div>`;

    // Добавить пустую ссылку на финальный вопрос (который подтверждение отправки результатов)
    nav_list_el.innerHTML += `<div id="questions-nav-end" class="list-el list-num" style="display: none;">...</div>`;

    // Добавить кнопку "на следующий вопрос" (стрелочка вправо которая)
    nav_list_el.innerHTML += `<div id="next-button" class="list-el list-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="14.414" height="10.828" viewBox="0 0 14.414 10.828">
            <g id="Component_7_1" data-name="Component 7 – 1" transform="translate(1.414 1.414)">
            <path id="Path_478" data-name="Path 478" d="M16539.912,2851.6l4,4,4-4" transform="translate(-2851.596 16547.912) rotate(-90)" fill="none" stroke="var(--text)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity="1"/>
            <path id="Path_479" data-name="Path 479" d="M16539.912,2851.6l4,4,4-4" transform="translate(-2843.596 16547.912) rotate(-90)" fill="none" stroke="var(--text)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity="1"/>
            </g>
        </svg>
    </div>`;

    // Добавить листенеры (ну, функционал)
    attachListeners();

    // Отркыть нужный вопрос (первый по дефолту)
    showQuestion(on_question);
}

//# Добавить слушатели
function attachListeners() {
    for (let i = 0; i < data.questions.length; i++) {
        let input_el = document.getElementById(`answer-field-${i}`);
        let submit_el = document.getElementById(`answer-submit-${i}`);
        let nav_el = document.getElementById(`questions-nav-${i}`);

        // Если мы имеем дело с текстовым полем
        if (input_el.dataset.type == 'text') {
            let element = input_el.children[0];
            element.addEventListener('input', () => {
                updateCompletedNav();
                if (element.value.length > 0) {
                    submit_el.className = 'submit-button';
                } else {
                    submit_el.className = 'submit-button unactive';
                }
            });

        // Если мы имеем дело с радио или чекбоксами
        } else if (input_el.dataset.type == 'radio' || input_el.dataset.type == 'checkbox') {

            // По скольку их много, пройтись по всем и навешать слушатель на каждый
            for (const element of input_el.children) {
                let input = element.querySelector('input');
                input.addEventListener('input', () => {
                    updateCompletedNav();

                    // Если хотябы один выбран
                    if ([...input_el.children].some(el => { return el.children[0].checked })) { // оно страшно, но все что оно делает, так это декоструирует коллекцию, запихивая все обхекты в новый массив тем самым неявно кастя в обычнчй js массив, потом просто вызввается функция с предикатом, проверяющим выбрано ли поле, и запускает этот предикат на каждом элементе нового массива. если хоть какой то колбек возваращает истину, значит хоть один инпут выбран. изичка
                        submit_el.className = 'submit-button';
                    } else {
                        submit_el.className = 'submit-button unactive';
                    }
                });
            }
        }


        // Кнопка делее. типа просто показать следующий вопрос
        submit_el.addEventListener('click', (e) => {
            e.preventDefault();
            if (input_el.dataset.type == 'text') {
                let element = input_el.children[0];

                if (element.value.length == 0) return;
                console.log(element.value);

            // Если мы имеем дело с радио или чекбоксами
            } else if (input_el.dataset.type == 'radio' || input_el.dataset.type == 'checkbox') {

                if (![...input_el.children].some(el => { return el.children[0].checked })) return;
            }

            if (on_question == data.questions.length - 1) {
                on_question++;
                showQuestion(on_question);

            } else if (on_question == data.questions.length) {
                console.log('submiting');

            } else {
                on_question++;
                showQuestion(on_question);
            }
        });

        // Сделать так, чтобы когда ты сверзу на цифорку вопроса нажимал, тебе показывало его
        nav_el.addEventListener('click', () => {
            on_question = i;
            showQuestion(on_question);
        });
    }

    // Показать предудущий вопрос
    document.getElementById('back-button').addEventListener('click', () => {
        if (on_question == 0) return;
        on_question--;
        showQuestion(on_question);
    });

    // Показать первый вопрос (просто шоб кнопка отрабатывала свой хлеб)
    document.getElementById('goback-test').addEventListener('click', () => {
        on_question = 0;
        showQuestion(on_question);
    });

    // Показать следующий вопрос
    document.getElementById('next-button').addEventListener('click', () => {
        if (on_question == data.questions.length - 1) return;
        on_question++;
        showQuestion(on_question);
    });

    // завершить прохождение, отправить данные на сервер
    document.getElementById('end-test').addEventListener('click', () => {
        sendData();
    });
}

// Показать нужный вопрос по его индексу
function showQuestion(num) {
    let questions_list_el = document.querySelectorAll('#questions-list .question');
    let nav_list_el = document.querySelectorAll('#test-nav .list-num');

    for (let i = 0; i < num; i++) {
        questions_list_el[i].classList.add('toleft');
        questions_list_el[i].classList.remove('toright');
        nav_list_el[i].className = 'list-el list-num';
        let answer = questions_list_el[i].querySelector(`#answer-field-${i}`);
        if (answer != null && answer.dataset.type == 'textbox') {
            answer.children[0].blur();
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const child of answer.children) {
                let input = child.querySelector('input');
                input.blur();
            }
        }
    }

    questions_list_el[num].classList.remove('toleft');
    questions_list_el[num].classList.remove('toright');
    nav_list_el[num].className = 'list-el list-num current';
    if (num < questions_list_el.length - 1) {
        let answer = questions_list_el[num].querySelector(`#answer-field-${num}`);
        if (answer != null && answer.dataset.type == 'text') {
            answer.children[0].blur();
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const child of answer.children) {
                let input = child.querySelector('input');
                input.blur();
            }
        }
    }

    for (let i = num + 1; i < nav_list_el.length; i++) {
        questions_list_el[i].classList.remove('toleft');
        questions_list_el[i].classList.add('toright');
        nav_list_el[i].className = 'list-el list-num';
        let answer = questions_list_el[i].querySelector(`#answer-field-${i}`);
        if (answer != null && answer.dataset.type == 'text') {
            answer.children[0].blur();
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const child of answer.children) {
                let input = child.querySelector('input');
                input.blur();
            }
        }
    }

    updateCompletedNav();
}

//# Панель выбора вопроса (котрая сверху), а именно, шобы оно пройденные и нынещний выделяло
function updateCompletedNav() {
    let questions_list_el = document.querySelectorAll('#questions-list .question');
    let nav_list_el = document.querySelectorAll('#test-nav .list-num');

    for (let i = 0; i < questions_list_el.length; i++) {
        let answer = document.querySelectorAll('#questions-list .question')[i].querySelector(`#answer-field-${i}`);
        if (answer != null && answer.dataset.type == 'text') {
            let el = answer.children[0];
            if (el && el.value.length > 0 && on_question != i) {
                nav_list_el[i].className = 'list-el list-num completed';
            }
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const el of answer.children) {
                if (el && [...answer.children].some(el => { return el.children[0].checked }) && on_question != i) {
                    nav_list_el[i].className = 'list-el list-num completed';
                }
            }
        }
    }
}

// Сгенерировать тест
generateTest();

async function sendData() {
//    data =
//        {
//            'time': <<время прохождения>>
//            'answers':
//                [
//                    ['текст, если тип ответа textbox'],
//                    [0, 1, 2]      # порядковый(ые) номер(а) выбранных ответов
//                ]
//        }
//    console.log(data);

    let len = $('.question-answer').length;
    let answers = [];

    for (let i = 0; i < len; i++)
    {
        let answers_list = $('#answer-field-'+i).children();
        let answers_form = $('#answer-field-'+i);
        // console.log(answers_form.children('[type=text]').length);

        if (answers_form.children('[type=text]').length)
        {
            answers.push(answers_list[0].value);
        }
        else
        {
            answers.push([]);
            for (let j = 0; j < answers_list.length; j++)
            {
                let complex_el = answers_list[j].children;
                if (complex_el[0].checked) answers[i].push(j);
            }
        }
    }

    let send_data = {
        'time': data.time - time_remaining,
        'answers': answers
    }

    console.log(send_data);

    await request(
        {
            url:path,
            headers: {
                'X-CSRFToken': csrf_token,
            },
            body:send_data,
        }
    );
}
