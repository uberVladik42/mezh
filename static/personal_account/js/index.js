let data = {};
let path = '';

async function getData() {
    data = await request({
        url: 'https://mezh-dxd.ml/api/view_personal_account',
        headers: {
            'X-CSRFToken': csrf_token,
        },
    });

    path = 'https://mezh-dxd.ml/api/set_account_data';
    data = JSON.parse(data);

    fill_blank();
}

function fill_blank()
{
    document.getElementById("klass").innerHTML = data['klass'];
}


async function sendData()
{
     let send_data = {
        'username': '',
        'email': '',
        'old_password': '',
        'new_password': ''
     }

    console.log(send_data);

    await request(
        {
            url:path,
            headers: {
                'X-CSRFToken': csrf_token,
            },
            body: send_data,
        }
    );
}

document.getElementById("mainpage-button").addEventListener('click', () => {
    sendData();
})