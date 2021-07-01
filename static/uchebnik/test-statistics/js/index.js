// let data = {
//     'title': 'Random Test',
//     'time': normalize_time(3600),
//     'creator': 'Xleb',
//     'creation_date': '27.06.228',
//     'limit_of_tries': 3,
//     'tested_pupils':
//     [
//         {
//             'name': 'Vasya',
//             'tries':
//             [
//                 {
//                     'wasted_time': 3600,
//                     'mark': 2,
//                     'progress': 10,
//                     'id': 1
//                 }
//             ]
//         },
//         {
//             'name': 'Petya',
//             'tries':
//             [
//                 {
//                     'wasted_time': 2400,
//                     'mark': 3,
//                     'progress': 54,
//                     'id': 2
//                 },
//                 {
//                     'wasted_time': 2700,
//                     'mark': 5,
//                     'progress': 99,
//                     'id': 3
//                 }
//             ]
//         }
//     ]
// };

window.onload = function()
{
    fill_params();
    fill_pupils_results();
    provide_permission();
}

let show_res_button = document.querySelector("#show-res");

function fill_params()
{
    let params = document.getElementById("params").children;
    let ind = 0;  // Пока по старинке
    for (key in data)
    {
        let val = data[key];
        if (key == 'time') val = normalize_time(val);  // немного костыля
        if (typeof data[key] != "object")
            params[ind++].innerText += ' ' + val;
    }
}


function fill_pupils_results()
{
    let results = document.getElementById("tested-pupils");
    let scores_sum = 0, times_sum = 0, max_score = -1, min_time = Math.pow(10,7);
    let passings_cnt = 0;
    for (let i = 0; i < data['tested_pupils'].length; i++)
    {
        let pupil = data['tested_pupils'][i];
        results.innerHTML +=
        `
            <p>${pupil.name}</p>
            прохождений: ${pupil.tries.length}
            <ol id="pupil-${i}-results">
            </ol>
        `;
        let tries_ol = document.getElementById(`pupil-${i}-results`);
        for (let j = 0; j < pupil.tries.length; j++)
        {
            let passing = pupil.tries[j];
            tries_ol.innerHTML += `<li> <a href="../../uchebnik/view_pupil_results/${passing.id}">прохождение ${passing.id}</a> : оценка: ${passing.mark}, балл: ${passing.progress}%, время: ${normalize_time(passing.wasted_time)};</li>`;
            scores_sum += passing.progress;
            times_sum += passing.wasted_time;
            max_score = Math.max(max_score, passing.progress);
            min_time = Math.min(min_time, passing.wasted_time);
            passings_cnt++;
        }
    }
    document.getElementById("average-score").innerText += ' ' + Math.round(scores_sum/passings_cnt) + '%';
    document.getElementById("average-time").innerText += ' ' + normalize_time(Math.round(times_sum/passings_cnt));
    document.getElementById("top-score").innerText += ' ' + max_score + '%';
    document.getElementById("top-time").innerText += ' ' + normalize_time(min_time);
    document.getElementById("passings").innerText += ' ' + passings_cnt;
}

function normalize_time(time)
{
    return `${(time / 60 < 10 ? '0' : '') + Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + (time % 60)}`;
}

function provide_permission()
{
    let button_redact = null;
    if (creator_permission == true)
    {
        button_redact = document.createElement('button');
        button_redact.innerText = 'изменить тест';
        button_redact.addEventListener('click', function (event)
        {
            console.log(window.location.href);
            let id = `${window.location}`.split('/');
            id = id[id.length - 1]
            window.location.href = "../../uchebnik/redact_exercise/" + id;
        });
        document.body.append(button_redact);
    }
}

show_res_button.addEventListener('click', function (event)
{
    let res = document.getElementById("tested-pupils");
    let status = '';
    if (res.style.display == 'none')
    {
        status = 'initial';
        show_res_button.innerText = 'скрыть';
    }
    else
    {
        status = 'none';
        show_res_button.innerText = 'показать';
    }
    res.style.display = status;
});

// document.querySelector('button').addEventListener('click', function (event) {
//     fill_params();
// });
