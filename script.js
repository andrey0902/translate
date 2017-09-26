$(function(){
    var username = 'Andree';
    $(".bmenu_inner").append(
        '<a class="my-link" href="/users/' + username + '/topics/">топики</a>'+
        '<a class="my-link" href="/users/' + username + '/qa/questions/">вопросы</a>'+
        '<a class="my-link" href="/users/' + username + '/comments/">комментарии</a>'
    );
});