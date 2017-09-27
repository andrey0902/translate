const language = `Afrikaans af Irish ga
Albanian sq Italian it
Arabic ar Japanese ja
Azerbaijani az Kannada kn
Basque eu Korean ko
Bengali bn Latin la
Belarusian be Latvian lv
Bulgarian bg Lithuanian lt
Catalan ca Macedonian mk
Chinese-Simplified zh-CN Malay ms
Chinese-Traditional zh-TW Maltese mt
Croatian hr Norwegian no
Czech cs Persian fa
Danish da Polish pl
Dutch nl Portuguese pt
English en Romanian ro
Esperanto eo Russian ru
Estonian et Serbian sr
Filipino tl Slovak sk
Finnish fi Slovenian sl
French fr Spanish es
Galician gl Swahili sw
Georgian ka Swedish sv
German de Tamil ta
Greek el Telugu te
Gujarati gu Thai th
Haitian-Creole ht Turkish tr
Hebrew iw Ukrainian uk
Hindi hi Urdu ur
Hungarian hu Vietnamese vi
Icelandic is Welsh cy
Indonesian id Yiddish yi`;

$(document).on('DOMContentLoaded', () => {
    let run = new AjaxRequest(DefaultPageTranslate, FromPopupTranslateCreateDom, FromPageTranslateCreateDom);
    run.runApp();
});


class DefaultPageTranslate {

    runCheckedStorage() {
        return this.getCurrentUrl().then((url) => this.checkStorage(url)).then((res) => {
            return res.data;
        })
    }

    checkStorage(url, text = 'text') {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(url, (items) => {
                console.log(items);
                resolve(chrome.runtime.lastError ? null : {data: items[url], url: url});
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

    constructor() {
        this.service = new DOMHelper();
        this.language_object = this.createLanguageObject();
        this.option_list = this.createListLanguage();
    }

    copyToCache() {
        $('.copy').on('click', () => {
            this.copyText();
        })
    }

    copyText() {
        let text = $('.text-to');
        console.log('copy1111', text[0]);
        let range = document.createRange();
        range.selectNodeContents(text[0]);
        let selection = window.getSelection(); // get Selection object from currently user selected text
        selection.removeAllRanges(); // unselect any user selected text (if any)
        selection.addRange(range);
        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg, successful);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        window.getSelection().removeAllRanges();
    }

    getQuery(textFromPage) {
        console.log(textFromPage);
        return textFromPage ? textFromPage : this.service.getElement('#input').val();
    }

    createLanguageObject() {
        let resObj = {};
        let data = language.replace(/\r\n|\r|\n/g, ' ').split(' ');
        for (let i = 1; i < data.length; i += 2) {
            resObj[data[i]] = data[i - 1];
        }
        return resObj;
        //    this.languages = resObj;
    }

    getLanguage(anyLanguage) {
        return this.language_object[anyLanguage];
    }

    showElementActions() {
        this.service.addClass('.copy', 'show');
        this.service.addClass('.clear', 'show');
    }

    hideElementActions() {
        this.service.removeClass('.copy', 'show');
        this.service.removeClass('.clear', 'show');
    }

    hideMainBlock(classCss) {
        this.service.addClass('#content', classCss);
    }

    showMainBlock(classCss) {
        this.service.removeClass('#content', classCss);
    }

    setDefaultState() {
        this.showMainBlock('hide');
        this.service.clearElement('#translate');
    }

    createAnswerTemplate(data) {
        return `
        <div class="default-text  list-group">
            <p class="list-group-item">From: ${data.fromLanguage}</p>
            <p class="list-group-item text-from">${data.defaultText}</p>
        </div>
        <div class="new-text list-group">
            <p class="list-group-item">To: ${data.toLanguage}</p>
            <p class="text-to list-group-item">${data.newText}</p>
        </div>`;
    }

    getDefaultParams(value) {
        return (value === 'Choice...') ? 'Auto' : value;
    }

    getAutoLanguage(value, languageServer) {
        return (value === 'Choice...') ? this.getLanguage(languageServer[2]) : value;
    }
    createListLanguage() {
        // this.languages
        let result = '';
        for (let key in this.language_object) {
            result += `<option value="${key}">${this.language_object[key]}</option>`;
        }
        return result;
    }
    appendOptionsInSelect() {
        let elem = this.service.getElement('#from');
        console.log('FROM ELEMENMT', elem, $('#from') );

        this.service.appendElement(this.option_list, this.service.getElement('#from'));
        this.service.appendElement(this.option_list, this.service.getElement('#to'))
    }
}

class FromPageTranslateCreateDom {
    constructor() {
        this.service = new DOMHelper();
    }

    createUrlParams(data) {
        return new Promise((resolve, reject) => {
            resolve({
                sourceLang: 'auto',
                targetLang: 'auto',
                query: encodeURI(data)
            })
        })
    }
}

class FromPopupTranslateCreateDom extends DopActions {

    createUrlParams() {
        return new Promise((resolve, reject) => {
            let sourceLang = this.getSource();
            let targetLang = this.getTarget();
            let query = encodeURI(this.getQuery());
            resolve({
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
}


class AjaxRequest extends DopActions {
    constructor(DefaultPageTranslate, FromPopupTranslateCreateDom, FromPageTranslateCreateDom) {
        super();
        this.DefaultPageTranslate = new DefaultPageTranslate();
        this.popupActions = new FromPopupTranslateCreateDom();
        this.pageActions = new FromPageTranslateCreateDom();
        this.appendOptionsInSelect();
    }

    runApp() {

        this.DefaultPageTranslate.runCheckedStorage().then((res) => {
            this.textPage = res;
            if (res) {
                this.pageActions.createUrlParams(res).then((res) => {
                    this.sendRequest(res);
                });
                return;
            }
            this.actionToButton();

        });
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
                this.createResult(this.getQuery(this.textPage), answer, result);
            }
        })
    }

    setActionToDefaultState() {
        $('.clear').on('click', () => {
            this.hideElementActions();
            this.setDefaultState();
            this.DefaultPageTranslate.clearStorage();
            this.textPage = null;
            this.actionToButton();
            $('.clear').off('click');
        })
    }

    createResult(defaultText, newText, languageAuto) {
        let fromLanguage = this.getAutoLanguage(this.service.getHtmlSelect('from'), languageAuto);
        let toLanguage = this.getDefaultParams(this.service.getHtmlSelect('to'));
        let where = this.service.getElement('#translate');
        let text = this.createAnswerTemplate({fromLanguage, toLanguage, defaultText, newText});
        this.service.clearElement('#translate');
        this.showElementActions();
        this.copyToCache();
        this.hideMainBlock('hide');
        this.setActionToDefaultState();
        this.service.appendElement(text, where);
    }

    get textPage() {
        return this.textFromPage;
    }

    set textPage(value) {
        this.textFromPage = value;
    }
}

class DOMHelper {
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

    getHtmlSelect(selector) {
        return $(`#${selector} option:selected`).text();
    }

    toggleClass(selector, classCss) {
        $(selector).toggleClass(classCss)
    }

    addClass(selector, classCss) {
        $(selector).addClass(classCss);
    }

    removeClass(selector, classCss) {
        $(selector).removeClass(classCss);
    }
}

