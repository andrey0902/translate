
class DOMHelper {

    static  removeModal(){
        $('#my-modal').remove();
    }

    static selectElementText() {
        return window.getSelection().toString();
    }
    getImg() {
        let image = document.createElement("img");
        image.src = chrome.runtime.getURL('translate.png');
        return  image;
    }
    appendModal() {
        $('body').append(this.createModal());
    }
    positionCalculation() {
        this.posX = this.e.clientX ;
        this.posY = this.e.clientY ;

    }
    createModal() {
        console.log('CREATE MODAL')
        return $(`<div id="my-modal" style="   top: ${this.posY}px; left:${this.posX}px"></div>`).append(this.getImg());
    }
}

class ModalHelper extends DOMHelper {

    constructor(e) {
        super();
        this.e = e;
        this.posX = 0;
        this.posY = 0;
        this.positionCalculation();
    }

    run() {
        console.log(this.e);
    }








}

document.addEventListener('mouseup', (e) => {
    console.log('selected text');
    chrome.runtime.sendMessage({msg: "something_completed", data: {text: DOMHelper.selectElementText()}});

    DOMHelper.removeModal();
    console.log('REMOVE MODAL11');

    if (DOMHelper.selectElementText()) {
        console.log('ned show overlay');
        let modal = new ModalHelper(e);
        modal.run();
        modal.appendModal();
        return;
    }
    DOMHelper.removeModal();
    console.log('REMOVE MODAL222');
});
document.addEventListener('click', (e) => {

    if (!(DOMHelper.selectElementText())) {
        DOMHelper.removeModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {

});


