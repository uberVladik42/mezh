
$(document).ready(function () {
        $("test").click(function (e) {

            var buttonId = $(this).attr('name');
            $.ajax({
                url: '/view_record/',
                type: 'GET',
                data: {
                    'id': buttonId,
                },
                success: function (data) {
                },
                failure: function (data) {
                    console.log(data);
            }
        });
    });
});