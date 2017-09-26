chrome.contextMenus.create({
    'title': 'Перевести с Translator', /* Текст пунтка меню */
    'contexts':['selection'], /* Тип пункта меню */
    'onclick': function(info, tab) {
        console.log(info, tab, 11111111);
        let query = encodeURI(info.selectionText);
        start()
    } /* Запомните это место, вместо этой функции мы будем вставлять код перевода */
});
var key = 'AIzaSyC6FeD_75cJvJmImBB3kJpnuVuF2YGIS54';


// Loads the JavaScript client library and invokes `start` afterwards.



chrome.contextMenus.create({
    'title': 'Тесе с page', /* Текст пунтка меню */
    'contexts':['page'], /* Тип пункта меню */
    'onclick': function() {} /* Запомните это место, вместо этой функции мы будем вставлять код перевода */
});
function getCurrentPage(callback) {
    let params = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(params, (pag) => {
        let page = pag[0];
        let url = page.url;

        callback(url);
    })
}

function saveCurrentText(url, text) {
    let item = {};
    item[url] = text;

    chrome.storage.sync.set(item, () => {
        console.log('item', item);
    })
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender, sendResponse);

        if (request.msg === "something_completed") {
            console.log(request.data.text);
            let text = request.data.text;
            getCurrentPage((url) => {
                saveCurrentText(url, text);
            })
        }
    }
);