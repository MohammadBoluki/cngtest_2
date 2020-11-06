var stuff_list_array = [];


function disableAll(){
    $(document).find('.btn','button','a').attr('disabled',true).prop('disabled',true).off()

}
function enableAll(){
    $(document).find('.btn','button','a').attr('disabled',false).prop('disabled',false).on()

}

// open insert form
$(document).on('click', '#insert-new-stuff-pack-button', function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    disableAll();
    $('#content-box').html('بارگذاری...').load('open-insert-form', function (xhr) {

    });

    $('#insert-new-stuffpack-save-btn').hide();
    enableAll();
})

//add to list
$(document).on('click','#add-to-stuffs-list-btn',  function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    console.log($(this));
    let stuff_name = $('#stuff-select-input :selected').text();
    let stuff_id = $('#stuff-select-input :selected').val();
    let stuff_num = $('#stuff-number-input').val();

    checkForExists(stuff_id, stuff_name, stuff_num);

    if (stuff_list_array.length == 0) {
        $('p#stuff-pack-list').show();
        $('#insert-new-stuffpack-save-btn').hide();
    } else {
        $('p#stuff-pack-list').hide();
        $('#stuff-list-table').fadeIn(300);
        $('#insert-new-stuffpack-save-btn').show();
        refreshTable();
    }

})


function checkForExists(stuff_id, stuff_name, stuff_num) {
    breakOut = false;
    $.each(stuff_list_array, function (ind, item) {

        if (item.id === stuff_id) {
            console.log('stuff: ' + stuff_list_array[ind]);
            stuff_list_array[ind] = {
                id: stuff_id,
                name: stuff_name,
                num: stuff_num
            };
            breakOut = true;
            return false;
        }
    })

    if (breakOut) return false;

    stuff_list_array.push({
        id: stuff_id,
        name: stuff_name,
        num: stuff_num
    });
    return false;
}


function removeFromList(e) {
    console.log($(e).attr('data-stuff-id'));
    let stuff_id = $(e).attr('data-stuff-id');
    console.log('stuff id for delete: ' + stuff_id);
    stuff_list_array.splice(stuff_id, 1);
    refreshTable();
}


function refreshTable() {
    disableAll();
    let stuff_list_table_body = $('#stuff-list-table tbody');
    stuff_list_table_body.html('');
    if (!stuff_list_array.length) {
        $('#stuff-list-table').hide();
        $('p#stuff-pack-list').show();
        $('#insert-new-stuffpack-save-btn').hide();
    }

    var sum = 0;
    $.each(stuff_list_array, function (ind, item) {
        sum += parseInt(item.num);
        stuff_list_table_body.append(
            `
                <tr>
                    <td>
                        ${ind + 1}
                    </td>
                    <td>
                        ${item.name}
                    </td>
                    <td>
                        ${parseInt(item.num)}
                    </td>
                    <td>
                        <button
                        class="btn btn-danger text-light btn-sm"
                        data-stuff-id=${ind}
                        title='حذف از لیست'
                        onclick='removeFromList(this);'
                        >
                        <i class='fas fa-trash '></i>
                        <span class="hidden">${ind}</span>
                        </button>
                    </td>
                </tr>
            `
        );
    })
    stuff_list_table_foot = $('#stuff-list-table tfoot');
    stuff_list_table_foot.html(
        `
            <tr class="table-info">
                <td colspan="2">
                    جــمع کـل:
                </td>
                <td colspan="2">
                    ${parseInt(sum)}
                </td>
            </tr>
        `
    );
    $('#stuff-number-input').val(1);
    $('#stuff-select-input option:eq(0)').attr('selected', true);
    enableAll();
}


$(document).on('click','#insert-new-stuffpack-back-btn',function(e){
    e.stopImmediatePropagation();
    e.preventDefault();
    disableAll();
    if ( $('#define-stuff-pack') )
        $('#define-stuff-pack').get(0).click();
    enableAll();
})


$(document).on('click', '#insert-new-stuffpack-save-btn',
function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    if (!stuff_list_array.length) {
        $('#insert-new-stuffpack-response')
            .addClass('alert-danger')
            .removeClass('hidden')
            .html("")
            .html('لیست نباید خالی باشد.')
        return false;
    }
    $('#insert-new-stuffpack-response')
        .html('<span class="spinner-border text-info"></span>' + 'ذخیره اطلاعات ...')
        .addClass('alert-info')
        .removeClass('alert-danger','alert-success')
    $.ajax({
        url: 'insert-new-stuffpack',
        type: 'POST',
        responseType: 'json',
        data: {
            code: $('input#stuff-pack-code-input').val(),
            name: $('input#stuff-pack-name-input').val(),
            serial: $('input#stuff-pack-serial-input').val(),
            description: $('textarea#insert-new-stuffpack-description').val(),
            list: stuff_list_array,
        },
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        complete: c => {

            if (typeof c.responseJSON != 'undefined' && c.responseJSON.errors) {
                $('#insert-new-stuffpack-response').html('')
                    .removeClass('alert-success', 'alert-info')
                    .addClass('alert-danger')

                $.each(c.responseJSON.errors, function (key, value) {
                    $.each(value, function (k, v) {
                        $('#insert-new-stuffpack-response').html('')
                            .append(
                                `
                                <li>
                                    ${v}
                                </li>
                                `
                            );
                    })

                })

            }
            else if (c.responseJSON && c.responseJSON.status) {
                console.log(c.responseJSON);
                $('#insert-new-stuffpack-response')
                .removeClass( 'alert-danger' , 'alert-info')
                .addClass ( 'alert-success')
                .html('مجموعه کالا ذخیره شد.')

                $('#stuff-pack-code-input').val('');
                $('#stuff-pack-name-input').val('');
                $('#stuff-pack-serial-input').val('');
                $('select#stuff-select-input option:eq(0)').attr('selected',true).prop('selected',true);
                $('#stuff-number-input').val('1');
                $('#insert-new-stuffpack-description').val('');

                stuff_list_array = []
                refreshTable();
            }
            else {
                console.log(c);
            }
        }
    })
})
