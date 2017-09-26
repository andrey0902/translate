$(document).on('DOMContentLoaded', () => {


});

class DefaultPageTranslate {

    runCheckedStorage() {
        return this.getCurrentUrl().then((url) => this.checkStorage(url)).then((res) => {
            console.log(res);
            if(res) {
    /*            this.clearStorage(res.url);*/
            }
            return res.data;
        })
    }

    checkStorage(url, text = 'text') {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(url, (items) => {
                console.log(items);
                resolve(chrome.runtime.lastError ? null : {data:items[url], url: url});
            })
        });
    }

    clearStorage() {

        let item = {};
        item[this.url] = null;
        chrome.storage.sync.set(item, () => {
        })
    }

    getCurrentUrl() {
        return new Promise((resolve, reject) => {
            let params = {
                active: true,
                currentWindow: true
            };
            chrome.tabs.query(params, (pag) => {
                let page = pag[0];
                let url = page.url;
                this.url = page.url;
                resolve(url)
            });
        })
    }
}


class DopActions {

    copyToCache() {
        $('.copy').on('click', () => {
            this.copyText();
        })
    }

    copyText() {
        let text = $('.text-to');
        console.log('copy', text[0]);
        let range = document.createRange();
        range.selectNode(text[0]);
        window.getSelection().addRange(range);
        try {
            // Теперь, когда мы выбрали текст ссылки, выполним команду копирования
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        // Снятие выделения - ВНИМАНИЕ: вы должны использовать
        // removeRange(range) когда это возможно
        window.getSelection().removeAllRanges();
    }
}

class DefaultDom extends DopActions {
    constructor() {
        super();
    }

}

class FromPageTranslateCreateDom {
    constructor(service) {
        this.service = new service();
    }
    createUrlParams(data) {
        return new Promise((resolve, reject) => {
            resolve ({
                sourceLang: 'auto',
                targetLang: 'auto',
                query: encodeURI(data)
            })
        })
    }
}

class FromPopupTranslateCreateDom  {
    constructor(service) {
        this.service = new service();
    }
    createUrlParams() {
        return new Promise((resolve, reject) => {
            let sourceLang = this.getSource();
            let targetLang = this.getTarget();
            let query = encodeURI(this.getQuery());
            resolve ({
                sourceLang,
                targetLang,
                query
            })
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
}


class AjaxRequest extends DefaultDom {
    constructor(service, DefaultPageTranslate, FromPopupTranslateCreateDom, FromPageTranslateCreateDom) {
        super();
        this.service = new service();
        this.DefaultPageTranslate = new DefaultPageTranslate();
        this.popupActions = new FromPopupTranslateCreateDom(service);
        this.pageActions = new FromPageTranslateCreateDom(service);
        console.log(this.DefaultPageTranslate);
      /*  this.sendRequest();*/
    }
    runApp() {
        this.DefaultPageTranslate.runCheckedStorage().then((res) => {
            console.log(res);
            if(res) {
                this.pageActions.createUrlParams(res).then((res) => {
                    this. sendRequest(res);
                });
                return;
            }
            this.actionToButton();
        });
    }
    actionToPageTranslate() {

    }
    actionToButton() {
        $('#btn_submit').on('click', () => {
            this.popupActions.createUrlParams().then((res) => {
                this.sendRequest(res);
            })
        });
        $(document).on('keyup', (e) => {
            if (e.keyCode === 13)
                this.popupActions.createUrlParams().then((res) => {
                    this.sendRequest(res);
                })
        });
    }
    sendRequest(params) {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${params.targetLang}&tl=${params.sourceLang}&dt=t&q=${params.query}`;
        if (params.query) {
            this.ajax(url);
        }
    }

    createAllAnswer(arr) {
        let str = '';
        if (arr.length) {
            arr.forEach((ele, i) => {
                str += ele[0];
            })
        }
        return str;
    }

    ajax(url) {
        $.ajax({
            method: 'GET',
            url,
            success: (result) => {
                console.log(result);
                let answer = this.createAllAnswer(result[0]);
                this.createResult(this.getQuery(), answer, result);
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

    getDefaultParams(value) {
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
            this.DefaultPageTranslate.clearStorage();
            this.actionToButton();
            $('.clear').off('click');
        })
    }


    createResult(defaultText, newText, languageAuto) {
        let fromLanguage = this.getAutoLanguage(this.service.getHtmlSelect('from'), languageAuto);
        let toLanguage = this.getDefaultParams(this.service.getHtmlSelect('to'));
        let where = this.service.getElement('#translate');
        let text = `<div class="default-text  list-group">
                        <p class="list-group-item">From: ${fromLanguage}</p>
                        <p class="list-group-item text-from">${defaultText}</p>
                    </div>
                    <div class="new-text list-group">
                        <p class="list-group-item">To: ${toLanguage}</p>
                        <p class="text-to list-group-item">${newText}</p>
                    </div>`;
        this.service.clearElement('#translate');
        this.showElementAction();
        this.copyToCache();
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

const run =  new AjaxRequest(WorkWhisDom, DefaultPageTranslate, FromPopupTranslateCreateDom, FromPageTranslateCreateDom);

run.runApp();

chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    // ...and send a request for the DOM info...
    console.log(tabs);

    /*    chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'DOMInfo'},
            // ...also specifying a callback to be called
            //    from the receiving end (content script)
            setDOMInfo);*/
});

