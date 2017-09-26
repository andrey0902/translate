document.addEventListener('mouseup', () => {
    console.log('selected text');
});
document.addEventListener('click', (e) => {
    console.log('selected text');
        console.log(selectElementText(), selectElementText().length);
        chrome.runtime.sendMessage({msg: "something_completed", data: {text: selectElementText()}});
});

function selectElementText(){
    return window.getSelection().toString();
}
document.addEventListener('DOMContentLoaded', () => {

});