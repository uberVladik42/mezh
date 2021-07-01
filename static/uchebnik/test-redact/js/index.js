'use strict';

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
let path = '';

//# Инфа о тесте (призодит с сервера в виде json)
async function getData() {
    let id = `${window.location}`.split('/');
    id = id[id.length - 1]

    if (id == 'create_exercise')
    {
        let test_data = {
            title: '',
            time: 600,
            questions: [
                {
                    text: '',
                    answers: [
                        {
                            text: '',
                            type: 'textbox',
                            valid_input: ''
                        }
                    ]
                }
            ]
        }

        data = parseServerData(test_data);
        path = 'https://mezh-dxd.ml/api/create_exercise';
    }
    else
    {
        data = await request({
            url: 'https://mezh-dxd.ml/api/get_exercise_data/' + id,
            headers: {
                'X-CSRFToken': csrf_token,
            },
        });

        data = parseServerData(JSON.parse(data))
        path = 'https://mezh-dxd.ml/api/redact_exercise/' + id;
        console.log(data);
    }

    generateTest();
}

getData();


//# Генерация теста
function generateTest() {
    // Заполнение верхней панели (со временем и названием)
    test_name_el.value = data.title;
    test_name_el.placeholder = 'Введите название упражнения';
    // test_name_el.innerHTML = data['title'];
//    time_remaining = data.time;
//    time_remaining_el.innerHTML = `<span>Осталось:</span> ${(time_remaining / 60 < 10 ? '0' : '') + Math.floor(time_remaining / 60)}:${(time_remaining % 60 < 10 ? '0' : '') + (time_remaining % 60)}`;
//    time_remaining--;
//    timer = setInterval(() => {
//        time_remaining_el.innerHTML = `<span>Осталось:</span> ${(time_remaining / 60 < 10 ? '0' : '') + Math.floor(time_remaining / 60)}:${(time_remaining % 60 < 10 ? '0' : '') + (time_remaining % 60)}`;
//        time_remaining--;
//    }, 1000);

    // Сгенерировать вопросы
    generateQuestions();
}

function generateAnswerField(type, value, question_num, answer_num = 0) {
    // console.log(`generating for ${question_num}-${answer_num}`);

    if (type == 'checkbox') {
        return `<label class="answer-box" for="answer-field-${question_num}-${answer_num}" data-question="${question_num}" data-num="${answer_num}">
            <input name="answer-field-${question_num}" id="answer-field-${question_num}-${answer_num}" data-type="checkbox" type="checkbox" name="ans" value="ans-${question_num}-${answer_num}" class="answer-checkbox maximized">
            <span class="checkmark"></span>
            <input type="text" value="${value}" class="answer-field" placeholder="Вариант ответа">
        </label>`;
    } else if (type == 'radio') {
        return `<label class="answer-box" for="answer-field-${question_num}-${answer_num}" data-question="${question_num}" data-num="${answer_num}">
            <input name="answer-field-${question_num}" id="answer-field-${question_num}-${answer_num}" data-type="radio" type="radio" name="ans" value="ans-${question_num}-${answer_num}" class="answer-radio maximized">
            <span class="checkmark"></span>
            <input type="text" value="${value}" class="answer-field" placeholder="Вариант ответа">
        </label>`;
    } else {
        return `<div class="question-answer" id="answer-field-${question_num}" data-type="text" data-num="${answer_num}">
            <input data-type="text" type="text" class="answer-field maximized" placeholder="Правильный ответ" value="${value}">
        </div>`;
    }
}

function generateQuestion(question_num) {
    let question = data.questions[question_num];
    let tmpHTML = '';

    tmpHTML += `<div class="question toright">
        <div class="question-left">
            <div class="question-body">
                <textarea placeholder="Вопрос">${question.body}</textarea>
            </div>`;

    // Сам вопрос
    tmpHTML += `<div id="question-answer-container-${question_num}">`;
    tmpHTML += generateQuestionAnswer(question_num);
    tmpHTML += `</div>`;

    tmpHTML += `</div>`;

    tmpHTML += `<div class="question-right">`;
    tmpHTML += `<div class="question-type-container" id="question-type-container-${question_num}">
        <label class="answer-box answer-box-right" for="txt-${question_num}">
            <input ${question.option_type == 'textbox' ? 'checked' : ''} type="radio" id="txt-${question_num}" name="question-type-${question_num}" value="text-answer">
            <span class="checkmark"></span>
            Текстовый ответ
            </label>
        <label class="answer-box answer-box-right" for="one-of-${question_num}">
            <input ${question.option_type == 'radio' ? 'checked' : ''} type="radio" id="one-of-${question_num}" name="question-type-${question_num}" value="one-of">
            <span class="checkmark"></span>
            Один из списка
        </label>
        <label class="answer-box answer-box-right" for="many-of-${question_num}">
            <input ${question.option_type == 'checkbox' ? 'checked' : ''} type="radio" id="many-of-${question_num}" name="question-type-${question_num}" value="many-of">
            <span class="checkmark"></span>
            Несколько из списка
        </label>
        <input type="submit" class="submit-button" value="Применить">
    </div>`;
    tmpHTML += `</div>`;

    tmpHTML += `</div>`;

    return tmpHTML;
}

function generateQuestionAnswer(question_num, type = data.questions[question_num].option_type) {
    let tmpHTML = '';
    if (type == 'textbox') {
        let valid_answer_val = data.questions[question_num].valid_input;
        tmpHTML += generateAnswerField('textbox', (valid_answer_val != undefined)? valid_answer_val: '', question_num);
    } else if (type == 'checkbox') {
        tmpHTML += `
            <div class="question-answer">
                <div class="complex-answer" id="answer-field-${question_num}" data-type="checkbox">`;

        for (let answer_num = 0; answer_num < data.questions[question_num].value.length; answer_num++) {
            tmpHTML += generateAnswerField('checkbox', data.questions[question_num].value[answer_num], question_num, answer_num);
        }

        tmpHTML += `</div>`;

        tmpHTML += `<div class="answer-add" id="answer-field-${question_num}-add">
                    <span class="checkmark">+</span>
                    Добавить
                </div>`;

        tmpHTML += `</div>`;
    } else if (type == 'radio') {
        tmpHTML += `
            <div class="question-answer">
                <div class="complex-answer" id="answer-field-${question_num}" data-type="radio">`;

        for (let answer_num = 0; answer_num < data.questions[question_num].value.length; answer_num++) {
            tmpHTML += generateAnswerField('radio', data.questions[question_num].value[answer_num], question_num, answer_num);
        }

        tmpHTML += `</div>`;

        tmpHTML += `<div class="answer-add" id="answer-field-${question_num}-add">
                    <span class="checkmark">+</span>
                    Добавить
                </div>`;

        tmpHTML += `</div>`;
    }
    console.log(tmpHTML);
    return tmpHTML;
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
    </div>
    <div id="question-links"></div>`;

    // Добавить каждый вопрос (который типа 1, 2, 3...)
    for (let question_num = 0; question_num < data.questions.length; question_num++) {
        // let question = data.questions[question_num];

        tmpHTML += generateQuestion(question_num);

        // Ссылка на вопрос (сверху которая с цифоркой)
        document.getElementById('question-links').innerHTML += `<div id="questions-nav-${question_num}" class="list-el list-num" data-num=${question_num}>${question_num + 1}</div>`;
    }

    questions_list_el.innerHTML += tmpHTML;

    // Добавить кнопку "добавить вопрос" (котораяс плюсиком)
    nav_list_el.innerHTML += `<div id="add-button" class="list-el list-button">
        +
    </div>`;

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

const remove_hold_time = 500;
function attachQuestionLinkListeners(i) {
    const nav_el = document.getElementById(`questions-nav-${i}`)

    // Сделать так, чтобы когда ты сверзу на цифорку вопроса нажимал, тебе показывало его
    nav_el.addEventListener('click', e => {
        let nav_el_local = e.currentTarget;
        let i_local = parseInt(nav_el_local.dataset.num);

        if (on_question != i_local) {
            on_question = i_local;
            showQuestion(on_question);
        }
    });

    let hold_interval = null;
    let hold_time = 0;

    let hold_ready = false;

    nav_el.addEventListener('mousedown', e => {
        let nav_el_local = e.currentTarget;
        let i_local = parseInt(nav_el_local.dataset.num);

        if (on_question == i_local) {
            if (hold_ready) {
                hold_interval = setInterval(() => {
                    let progress = hold_time / remove_hold_time;
                    document.getElementById('hold-circle').setAttribute('stroke-dasharray', `${(Math.PI * 16) * progress} ${Math.PI * 16}`)

                    hold_time += 10;
                    if (hold_time > remove_hold_time) {
                        hold_time = 0;
                        clearInterval(hold_interval);
                        removeQuestion(i_local);
                    }
                }, 10);
            }
        }
    });

    nav_el.addEventListener('mouseup', e => {
        if (hold_interval) clearInterval(hold_interval);
        if (document.getElementById('hold-circle'))
            document.getElementById('hold-circle').setAttribute('stroke-dasharray', `0 ${Math.PI * 16}`)
        hold_time = 0;
    });

    nav_el.addEventListener('mouseleave', e => {
        if (hold_interval) clearInterval(hold_interval);
        if (document.getElementById('hold-circle'))
            document.getElementById('hold-circle').setAttribute('stroke-dasharray', `0 ${Math.PI * 16}`)
        hold_time = 0;
    });

    // Удаление вопроса
    nav_el.addEventListener('mouseenter', e => {
        let nav_el_local = e.currentTarget;
        let i_local = parseInt(nav_el_local.dataset.num);

        if (on_question == i_local) {
            nav_el_local.innerHTML = `<svg style="position: absolute; z-index: -1; transform: rotate(-135deg);" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle id="hold-circle" cx="16" cy="16" r="8" fill="none" stroke="var(--accent-brighter)" rotate="" stroke-width="16" stroke-dasharray="0 ${Math.PI * 16}"/>
            </svg>
            +`;
            nav_el_local.style.transform = 'rotate(45deg)';
            nav_el_local.classList.add('completed');
            hold_ready = true;
        }
    });

    nav_el.addEventListener('mouseleave', e => {
        let nav_el_local = e.currentTarget;
        let i_local = parseInt(nav_el_local.dataset.num);

        if(on_question == i_local) {
            nav_el_local.innerText = i_local + 1;
            nav_el_local.style.transform = 'rotate(0deg)';
            nav_el_local.classList.remove('completed');
            hold_ready = false;
        }
    });
}

function attachQuestionListeners(i) {
    let input_el = document.getElementById(`answer-field-${i}`);

    // Если мы имеем дело с текстовым полем
    if (input_el.dataset.type == 'text') {
        let element = input_el.children[0];
        element.addEventListener('input', () => {
            updateCompletedNav();
        });

        // Связывание поля ввода с value
        let input = document.getElementById(`answer-field-${i}`).children[0];
        input.addEventListener('input', e => {
            data.questions[i].value = input.value;
        });

        // Если мы имеем дело с радио или чекбоксами
    } else if (input_el.dataset.type == 'radio' || input_el.dataset.type == 'checkbox') {
        // По скольку их много, пройтись по всем и навешать слушатель на каждый
        for (const element of input_el.getElementsByClassName('answer-box')) {
            let input = element.querySelector('input');
            input.addEventListener('input', () => {
                updateCompletedNav();
            });
        }
    }

    // Смена типа вопроса
    let to_txt_type = document.getElementById(`txt-${i}`);
    let to_rd_type = document.getElementById(`one-of-${i}`);
    let to_cb_type = document.getElementById(`many-of-${i}`);
    to_txt_type.addEventListener('click', () => {
        if (data.questions[i].option_type != 'textbox') {
            data.questions[i].value = '';
        }
        data.questions[i].option_type = 'textbox';
        let container = document.getElementById(`question-answer-container-${i}`);
        container.innerHTML = generateQuestionAnswer(i, 'textbox');

        let input = document.getElementById(`answer-field-${i}`).children[0];
        input.addEventListener('input', e => {
            data.questions[i].value = input.value;
        });
    });

    to_rd_type.addEventListener('click', () => {
        if (data.questions[i].option_type == 'textbox') {
            data.questions[i].value = [];
        }
        data.questions[i].option_type = 'radio';
        let container = document.getElementById(`question-answer-container-${i}`);
        container.innerHTML = generateQuestionAnswer(i, 'radio');
        attachInputListeners();
        attachTypeDependantLiseteners();
    });

    to_cb_type.addEventListener('click', () => {
        if (data.questions[i].option_type == 'textbox') {
            data.questions[i].value = [];
        }
        data.questions[i].option_type = 'checkbox';
        let container = document.getElementById(`question-answer-container-${i}`);
        container.innerHTML = generateQuestionAnswer(i, 'checkbox');
        attachInputListeners();
        attachTypeDependantLiseteners();
    });

    let answer_field = document.getElementById(`answer-field-${i}`);
    attachInputListeners();
    function attachInputListeners() {
        // Созранение вариантов вопросов
        let inputs = document.getElementById(`answer-field-${i}`).children;
        for (const el of inputs) {
            if (el.tagName == 'LABEL') {
                if (el.children[2]) {
                    el.children[2].addEventListener('input', () => {
                        let question = el.dataset.question;
                        let answer = el.dataset.num;

                        // data.questions[question].value[answer] = el.children[2].value;
                        data.questions[question].value[answer] = {
                             correct: el.children[0].checked,
                             value: el.children[2].value,
                        };
                    });

                    el.children[0].addEventListener('input', () => {
                        let question = el.dataset.question;
                        let answer = el.dataset.num;

                         data.questions[question].value[answer] = {
                             correct: el.children[0].checked,
                             value: el.children[2].value,
                         };
                    });
                }
            }
        }
    }

    if (data.questions[i].option_type != 'textbox') {
        attachTypeDependantLiseteners();
    }

    // Кнопка добавить есть только на чекбоксах и радио баттонах => они зависят от типа
    function attachTypeDependantLiseteners() {
        // Добавление вариантов
        let add_option = document.getElementById(`answer-field-${i}-add`);
        if (add_option) {
            add_option.addEventListener('click', () => {
                data.questions[i].value = [...data.questions[i].value, ''];
                let container = document.getElementById(`question-answer-container-${i}`);
                container.innerHTML = generateQuestionAnswer(i);

                attachTypeDependantLiseteners();
                attachInputListeners();
            });
        }
    }

    let submit_el = document.getElementById(`question-type-container-${i}`).querySelector('input[type="submit"]');
    submit_el.addEventListener('click', () => {
       sendData();
    })

    attachQuestionLinkListeners(i);
}

function removeQuestion(num) {
    document.getElementById(`questions-nav-${num}`).remove();
    document.getElementById(`questions-list`).children[num].remove();

    data.questions.splice(num, 1);

    for (let i = Math.min(num + 1, data.questions.length); i < data.questions.length + 1; i++) {
        let el =  document.getElementById(`questions-nav-${i}`);
        if (!el) continue;
        el.innerText = i;
        el.id = `questions-nav-${i - 1}`;
        el.dataset.num = i - 1;
    }

    showQuestion(Math.min(num, data.questions.length - 1));
}

//# Добавить слушатели
function attachListeners() {
    for (let i = 0; i < data.questions.length; i++) {
        attachQuestionListeners(i);
    }

    // Показать предудущий вопрос
    document.getElementById('back-button').addEventListener('click', () => {
        if (on_question == 0) return;
        on_question--;
        showQuestion(on_question);
    });

    // Показать следующий вопрос
    document.getElementById('next-button').addEventListener('click', () => {
        if (on_question == data.questions.length - 1) return;
        on_question++;
        showQuestion(on_question);
    });

    // Добавить вопрос
    document.getElementById('add-button').addEventListener('click', async () => {
        data.questions = [
            ...data.questions,
            {
                body: '',
                option_type: 'textbox',
            },
        ];
        document.getElementById('questions-list').insertAdjacentHTML('beforeend', generateQuestion(data.questions.length - 1));

        // Ссылка на вопрос (сверху которая с цифоркой)
        document.getElementById('question-links').insertAdjacentHTML('beforeend', `<div id="questions-nav-${data.questions.length - 1}" class="list-el list-num" data-num=${data.questions.length - 1}>${data.questions.length}</div>`);

        let nav_el = document.getElementById(`questions-nav-${data.questions.length - 1}`);
        nav_el.addEventListener('click', (e) => {
            // console.log(e.currentTarget.id.split('questions-nav-')[1]);
            on_question = parseInt(e.currentTarget.id.split('questions-nav-')[1]);
            showQuestion(on_question);
        });

        attachQuestionListeners(data.questions.length - 1);

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 25);
        });
        on_question = data.questions.length - 1;
        showQuestion(on_question);
    });
}

//# Показать нужный вопрос по его индексу
function showQuestion(num) {
    let questions_list_el = document.querySelectorAll('#questions-list .question');
    if (questions_list_el.length == 0) return;
    let nav_list_el = document.querySelectorAll('#test-nav .list-num');

    for (let i = 0; i < num; i++) {
        questions_list_el[i].classList.add('toleft');
        questions_list_el[i].classList.remove('toright');
        nav_list_el[i].className = 'list-el list-num';
        let answer = questions_list_el[i].querySelector(`#answer-field-${i}`);
        if (answer != null && answer.dataset.type == 'text') {
            answer.children[0].blur();
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const child of answer.getElementsByClassName('answer-box')) {
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
            for (const child of answer.getElementsByClassName('answer-box')) {
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
            for (const child of answer.getElementsByClassName('answer-box')) {
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
                nav_list_el[i].className = 'list-el list-num';
            }
        } else if (answer != null && (answer.dataset.type == 'radio' || answer.dataset.type == 'checkbox')) {
            for (const el of answer.children) {
                if (
                    el &&
                    [...answer.children].some((el) => {
                        return el.children[0].checked;
                    }) &&
                    on_question != i
                ) {
                    nav_list_el[i].className = 'list-el list-num';
                }
            }
        }
    }
}

async function sendData() {
//    data =
//        {
//            'exercise_name': data['title'],
//            'time': data['time'],
//            'limit_of_tries': 1,
//            'tag_name': 'test',
//            'questions_info':
//                [
//                    'question_text': ...
//                ],
//            'answers_info':
//                [
//                    'answer_text': ... ,
//                    'answer_type': ... ,
//                    'is_valid': ...    ,   // Для checkbox/radiobutton
//                    'valid_input': ... ,   // Для textbox(хз как он здесь называется, ну ты понял)
//                    'score': 1
//                ]
//        }
    let questions_info = [];
    let questions = $('textarea');
    let answers_info = [];

    for (let i = 0; i < questions.length; i++)
    {
        questions_info.push({'question_text':questions[i].value});

        let answers = $('#answer-field-'+i);
        let answers_list = answers.children();
        answers_info.push([]);

        if (answers_list.length == 1)
        {
            answers_info[i].push(
                {
                    'answer_type': 'textbox',
                    'answer_text': 'input',
                    'valid_input': answers_list[0].value
                }
            )
        }
        else
        {

            for (let j = 0; j < answers_list.length; j++)
            {
                let complex_el = answers_list[j].children;
                answers_info[i].push(
                    {
                        'answer_type': complex_el[0].type,
                        'answer_text': complex_el[2].value,
                        'is_valid': complex_el[0].checked
                    }
                );
            }
        }
    }

    let send_data = {
        'exercise_name': $('#test-name').val(), //data['title'],
        'time': data['time'],
        'limit_of_tries': 1,
        'tag_name': 'test',
        'visible_valid_answers': false,
        'questions_info': questions_info,
        'answers_info': answers_info
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
