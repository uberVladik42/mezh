var api;
var start;
var global_link;


function watch(link, lesson_name) {
    global_link = link
    var domain = "meet.jit.si";
    var options = {
        roomName: link,
        width: document.width,
        height: document.height,
        parentNode: undefined,
        configOverwrite: {},
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'hangup',
                'chat', 'settings', 'raisehand',
                'videoquality', 'shortcuts',
                'tileview', 'videobackgroundblur',
                'sharedvideo',
            ],
        }
    }
    api = new JitsiMeetExternalAPI(domain, options);
    api.executeCommand('subject', lesson_name)
}

function record() {
    api.addEventListener('videoConferenceJoined', start_recording);
}

function start_recording() {
    start = new Date().getTime();
    api.executeCommand('startRecording', {
        mode: 'file', //recording mode, either `file` or `stream`.
        dropboxToken: '35YOZaqu6woAAAAAAAAAAfSp-5agXgdSnb3jdf50-zd3NlNdIVEx73GGA4YquohO', //dropbox oauth2 token.
        shouldShare: true
    });

    // небольшой костыль, он отказывался хранить два ивентлисенера
    api.removeEventListener('videoConferenceJoined');
    api.addEventListener('videoConferenceLeft', stop_recording);
}

function stop_recording() {
    // апишка конечно тут не очень местами, после окончания еще секунд 30 пустого экрана будет
    const end = new Date().getTime();
    api.executeCommand('stopRecording', 'file');
    /*
    const participantIds = Object.keys(this._participants);
    for(let key in participantIds){
        api.executeCommand('kickParticipant', key);
    }
    */
    api.dispose();
    document.write('Не закрывайте страницу! Подождите, пока конференция загрузится. Это не займет более минуты. После завершения, вы будете перенаправлены на другую страницу.');
    $.ajax({
        url: '/download_conf/',
        type: 'GET',
        data: {
            'time': end - start,
            'link': global_link,
        },
        success: function (data) {
        },
        failure: function (data) {
            console.log(data);
        }
    });
    window.location = "/";
}
