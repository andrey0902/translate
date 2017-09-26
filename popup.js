$(document).on('DOMContentLoaded', () => {
    $('#btn_submit').on('click', () => {
        action();
    });
    $(document).on('keyup', (e) => {
        if(e.keyCode === 13)
            action();
    });
});

function action() {
    let query = $('#input').value;
    console.log('llll', query);
    new AjaxRequest(WorkWhisDom)
}

class AjaxRequest {
    constructor(service) {
        this.service = new service();
        this.sendRequest();
    }

    sendRequest() {
        let sourceLang = this.getSource();
        let targetLang = this.getTarget();
        let query = encodeURI(this.getQuery());
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${targetLang}&tl=${sourceLang}&dt=t&q=${query}`;
        if(query) {
            this.ajax(url);
        }
    }
    ajax(url) {
        $.ajax({
            method: 'GET',
            url,
            success: (result) => {
                console.log(result);
                this.createResult(this.getQuery(), result[0][0][0], result);
            }
        })
    }

    /*Language the default 'auto' */
    getSource() {
        return this.service.getElement('#to').val()
    }

    /*Language to translate*/
    getTarget() {
        return this.service.getElement('#from').val()
    }

    getQuery() {
        return this.service.getElement('#input').val();
    }
    getDefultParams(value) {
        return (value === 'Choice...') ? 'Auto' : value;
    }
    getAutoLanguage(value, languageServer) {
        return (value === 'Choice...') ? languageServer[2] : value;
    }
    showElementAction() {
        this.service.toggleClass('.copy', 'show');
        this.service.toggleClass('.clear', 'show');
    }
    showHideMainBlock(classCss) {
        this.service.toggleClass('#content', classCss);
    }
    setDefaultState() {
        this.showHideMainBlock('hide');
        this.service.clearElement('#translate');
    }
    setActionToDefaultState() {
        $('.clear').on('click', () => {
            this.showElementAction();
            this.setDefaultState();
        })
    }

    createResult(defaultText, newText, languageAuto) {
        let fromLanguage = this.getAutoLanguage(this.service.getHtmlSelect('from'), languageAuto);
        let toLanguage = this.getDefultParams(this.service.getHtmlSelect('to'));
        let where = this.service.getElement('#translate');
        let text = `<div class="default-text">
                        <p>From: ${fromLanguage}</p>
                        <p class="text-from">${defaultText}</p>
                    </div>
                    <div class="new-text">
                        <p>To: ${toLanguage}</p>
                        <p class="text-to">${newText}</p>
                    </div>`;
        this.service.clearElement('#translate');
        this.showElementAction();
        this.showHideMainBlock('hide');
        this.setActionToDefaultState();
        this.service.appendElement(text, where);
    }
}

class WorkWhisDom {
    getElement(selector) {
        return $(selector);
    }

    createElement(element) {
        return $(element);
    }

    appendElement(that, where) {
        where.append(that);
    }

    clearElement(selector) {
        $(selector).empty();
    }

    addText(element, text) {
        return element.html(text);
    }

    getHtmlSelect(selector) {
        return $(`#${selector} option:selected`).text();
    }
    toggleClass(selector, classCss) {
        $(selector).toggleClass(classCss)
    }
}