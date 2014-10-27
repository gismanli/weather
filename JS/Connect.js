/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function connect(url, params, success, error) {
    $.ajax({
        url: url,
        type: "POST",
        data: params,
        success: success,
        error: function(ret) {
            alert(ret);
        }
    });
}