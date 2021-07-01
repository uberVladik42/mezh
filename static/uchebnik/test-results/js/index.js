//let got = 40, max = 60, time = "7:25";
let got = server_data['total_score'], max = server_data['max_total_score'], time = server_data['wasted_time'];
function out_of(got, max){
    let ret = Math.floor(got/max*5);
    if (ret < 2){
        return 2;
    }
    return ret;
}
//let mark = out_of(got, max);
let mark = server_data['mark'];
let percent = server_data['progress'];
console.log(Math.round((mark-2)/3*100));
console.log(885-(885*(Math.round((mark-2)/3))));
console.log(mark);
// в строчке 139 код думает что что 80% это 100%, по этому я сделал самую гениальную идею.... 100-20.
// Это работает, не красиво, но работает ( и некрасиво)...
// Также тут не может быть меньше 20% (19-20=-1), но меньше 20% вам не нужно тк это 2 :thumbsup:

// не знаю и не понимаю как stroke-dashray работает (нет инфы в интернете) :man_facepalming:
//document.getElementById("circlem").style.transform = "rotate(270deg)";
document.getElementById("circle").setAttribute("stroke-dasharray", `${224 * Math.PI * ((100 - percent)/100)} ${224 * Math.PI} `);
//document.getElementById("circle").style = "position: absolute; transform: rotate(270deg) rotateZ(330deg);"
//document.getElementById("circle").style.transform = "rotate(180deg) rotateZ(330deg);";
//document.getElementById("circlem").setAttribute('style', 'position: absolute; transform: rotate((${224 * Math.PI * 0.1})deg) rotateZ(90deg);')
document.getElementById("mark").innerHTML= mark;
document.getElementById("percent").innerHTML = percent + "%";
document.getElementById("time").innerHTML = "Завершен за " + time + " сек";
document.getElementById("test-title").innerHTML = server_data['exercise_data']['title'];
document.getElementById("out-of").innerHTML = 'Вы набрали ' + got + " из " + max + " баллов";
