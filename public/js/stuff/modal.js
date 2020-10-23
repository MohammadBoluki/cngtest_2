var ch = $('input[name="has_unique_serial"]');

function openModal(e, targetModal, msg) {
    e.preventDefault();
    $('#response').addClass('hidden');
    $('#' + targetModal[0].id).modal('show');
    $('.form-horizontal').show();
    $('.modal-title').text(msg);
    $('#' + targetModal[0].id).on('hidden.bs.modal', function () {
        let active_item = $('.side-menu a.active');
        $('#' + active_item[0].id)[0].click();
    })
}

// insert new stuff

$(document).on('click', '#insert-new-stuff-button', function (e) {

    openModal(e, $('#insert-new-stuff-modal'), 'کالای جدید')
    //function add stuff
    $('button#add').on('click', function () {
        $('#response').html("");
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'POST',
            url: 'insert-new-stuff',
            data: {
                '_token': $('input[name="_token"]').val(),
                'name': $('input[name="name"]').val(),
                'code': $('input[name="code"]').val(),
                'latin_name': $('input[name="latin_name"]').val(),
                'unit_id': $('#unit_id :selected').val(),
                'has_unique_serial': ch.is(':checked') ? 1 : 0,
                'description': $('textarea#description').val(),
            },
            cache: false,
            success: function (d) {
                $('#response').removeClass('hidden').html("");

                if (d.errors) {
                    try {

                        if (d.errors.code == "23000") {
                            d.errors.message = "کالا با این نام قبلا ثبت شده است"
                            $('#response').append('<li>' + d.errors.message + '</li>')
                            return
                        }
                        else {
                            console.log(d.errors)
                            $.each(d.errors, function (keyobj, valueobj) {
                                $('#response').append('<li>' + valueobj + '</li>')
                                $('#'+keyobj).addClass('error');
                            })
                             return
                        }
                    } catch (e) {
                        $('#response').append('<li>error:' + d.errors + '</li>')
                        return
                    }
                }
                else {
                    $('#response').text('کالا ثبت شد')
                    $('#insert-new-stuff-form input[type="text"]').val("")
                    $('#insert-new-stuff-form textarea').val("")
                    $('#insert-new-stuff-form select option:eq(0)').attr('selected','selected')
                    $('#response').removeClass('alert-danger', 'hidden').addClass('alert-success')
                }
            }
        })
    })
})


//select stuff

$(document).on('click', '#btnStuffEdit', function (e) {

    e.preventDefault();
    console.log('btn stuff edit clicked.');
    $('#selectResponse').addClass('hidden');
    $('#edit-stuff-modal').modal('show');
    $('.form-horizontal').show();
    $('.modal-title').text('ویرایش کالا');
    $('#edit').on('hidden.bs.modal', function () {

    })
    $('.preloader').addClass('hidden');
    id = $(e.currentTarget).attr('data-id');

    $.ajax({
        type: 'GET',
        url: 'selectStuff',
        data: {
            'id': id,
        },
        success: function (data) {
            $('#selectResponse').text("")
            $('#selectResponse').removeClass('hidden')
            if (!data.stuff) {
                console.log('stuff does not exist.')
                try {
                    if (data.errors.code == "23000") {
                        data.errors.message = "کالایی با این نام کد ثبت شده است"
                        $('#selectResponse').append('<li>' + data.errors.message + '</li>')
                        return
                    }
                    else {
                        $.each(data.errors, function (keyobj, valueobj) {
                            $('#selectResponse').append('<li>' + valueobj + '</li>')
                            return
                        })
                    }

                } catch (e) {
                    $('#selectResponse').append('<li>' + data.errors + '</li>')
                }


            }
            else {
                try {
                    console.log(data);
                    $('form#edit-stuff-form input#code').val(data.stuff[0]['code']).attr('placeholder', 'کد جدید کالا')
                    $('form#edit-stuff-form input#name').val(data.stuff[0]['name']).attr('placeholder', 'نام جدید کالا')
                    $('form#edit-stuff-form input#latin_name').val(data.stuff[0]['latin_name']).attr('placeholder', 'نام لاتین جدید کالا')
                    $('form#edit-stuff-form input#has_unique_id').prop('checked',data.stuff[0]['has_unique_serial']);
                    $('form#edit-stuff-form select#unit_id').val(data.stuff[0]['unit_id']);
                    $('form#edit-stuff-form textarea#description').text(data.stuff[0]['description']);


                } catch (error) {
                    // console.log(error)
                }

            }
        }
    })

    /**
     * ********************
     * UPDATE SQL
     * ********************
     */
    $('button#edit').on('click', function (e) {
        console.log(e);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'POST',
            url: 'editStuff',
            data: {
                '_token': $('input[name="_token"]').val(),
                'code': ($('#code').val()),
                'name': ($('#name').val()),
                'latin_name': $('#latin_name').val(),
                'has_unique_serial': ch.is(':checked') ? 1 : 0,
                'id': id,
                'description': $('#description').val(),
                'unit_id': $('#unit_id').val(),
            },
            success: function (data) {

                if (data.errors) {
                    try {

                        $('#selectResponse').removeClass('hidden').text("")
                        if (data.errors.code == "23000") {
                            data.errors.message = "کاربری با این نام قبلا ثبت شده است"
                            $('#selectResponse').append('<li>' + data.errors.message + '</li>')
                            return
                        }
                        else {
                            $.each(data.errors, function (keyobj, valueobj) {
                                $('#selectResponse').append('<li>' + valueobj + '</li>')
                                return
                            })
                        }

                    } catch (e) {
                        $('#selectResponse').append('<li>' + data.errors + '</li>')
                    }


                }
                else {
                    $('#selectResponse').text('تغییرات جدید ثبت شد')
                    $('#selectResponse').removeClass('alert-danger', 'hidden').addClass('alert-success')
                }
            }

        })

    })
    /**
     * END OF UPDATE

    */


})


/**
     * START OF DELETE USER
     *
     */

$(document).on('click', '#btnDelete', function (e) {

    //select user

    e.preventDefault();
    id = $(e.currentTarget).attr('data-id');
    if (id == 1)
        return;
    $('#deleteResponse').addClass('hidden');
    $('#deleteModal').modal('show');
    $('.form-horizontal').show();
    $('.modal-title').text('حذف کاربر');
    $('#deleteModal').on('hidden.bs.modal', function () {

    })

    del_id = $(e.currentTarget).attr('data-id');
    var del_role;
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: 'selectUser',
        data: {
            'id': del_id,
        },
        success: function (data) {
            console.log(data.user[0]['username']);
            if (data.user) {
                $('#deleteResponse').removeClass('hidden');
                $('#sureDeleteUsername').text(" " + data.user[0]['username'] + " ")
                $('#sureDeleteRole').text(" " + data.user[0]['title'] + " ")
                del_role = data.user[0]['role'];
            }
            else {
                $('#deleteResponse').removeClass('hidden');
                $('#selectResponse').val(data.errors['message'])
            }
        }
    })

    $('#modalBtnDelete').on('click', function (e) {

        console.log(del_id);
        $.ajax(
            {
                type: 'POST',
                url: '/deleteUser',
                data: { 'id': del_id, 'role': del_role },
                success: function (d) {
                    if (d.errors) {
                        console.log(d);

                    }
                    else {
                        $('#deleteResponse').text('کاربر حذف شد.');
                        $('#modalBtnDelete').fadeOut(300);
                        $('#deleteCancel').text('بستن');
                    }
                }
            }
        )
    })

})

// Insert new workshop

$(document).on('click', '#insert-new-workshop-modal-btn', function (e) {
    e.preventDefault();
    $.ajax({
        type: "GET",
        url: 'insertNewWorkshopForm',
        data: { r: Math.random() },
        success: function (d) {
            $('.ajax-content').css('opacity', '0');
            $('#preloader').show();
            $('.ajax-content').first().html(d);
            $('.ajax-content').css('opacity', '1');;
        }
    });

})

// Insert new contractor

$(document).on('click', '#new-temp-modal-opener-btn', function (e) {
    e.preventDefault();
    $.ajax({
        type: "GET",
        url: 'insert_new_contractor_form',
        data: { r: Math.random() },
        success: function (d) {
            $('.ajax-content').css('opacity', '0');
            $('#preloader').show();
            $('.ajax-content').first().html(d);
            $('.ajax-content').css('opacity', '1');;
        }
    });

})


// insert new contractor
$(document).on('click', '#insert-new-contractor-form-show-btn', function (e) {
    e.preventDefault();

})
