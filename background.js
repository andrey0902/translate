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


function start() {
    var url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${'en'}&tl=${'ru'}&dt=t&q=${'hello world'}`;


    $.ajax({
        type: "get",
        url: url,
        success: function (res) {
            console.log(res);
        }
    });
    
    // Initializes the client with the API key and the Translate API.
    gapi.client.init({
        'apiKey': 'key',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/translate/v2/rest'],
    }).then(function() {
        // Executes an API request, and returns a Promise.
        // The method name `language.translations.list` comes from the API discovery.
        return gapi.client.language.translations.list({
            q: 'hello world',
            source: 'en',
            target: 'de',
        });
    }).then(function(response) {
        console.log(response.result.data.translations[0].translatedText);
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
};

// Loads the JavaScript client library and invokes `start` afterwards.
gapi.load('client', start);


chrome.contextMenus.create({
    'title': 'Тесе с page', /* Текст пунтка меню */
    'contexts':['page'], /* Тип пункта меню */
    'onclick': function() {} /* Запомните это место, вместо этой функции мы будем вставлять код перевода */
});