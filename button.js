var ConvertApi = {}

ConvertApi.dataset = document.currentScript.dataset

ConvertApi.init = function() {
    ConvertApi.secret = ConvertApi.dataset.secret
    ConvertApi.apiKey = ConvertApi.dataset.apikey
    ConvertApi.token = ConvertApi.dataset.token
    ConvertApi.buttonSelector = ConvertApi.dataset.selector ? ConvertApi.dataset.selector : '.convertapi-btn'
    ConvertApi.progressClass = ConvertApi.dataset.progressclass ? ConvertApi.dataset.progressclass : 'convertapi-progress'
    ConvertApi.errorClass = ConvertApi.dataset.errorclass ? ConvertApi.dataset.errorclass : 'convertapi-error'

    let elButtons = document.querySelectorAll(ConvertApi.buttonSelector)
    for (var i = 0; i < elButtons.length; i++) elButtons[i].onclick = ConvertApi.onClick
}

ConvertApi.onClick = function() {
    var elBtn = this
    let fileName = elBtn.dataset.filename ? elBtn.dataset.filename : 'page'
    let format = elBtn.dataset.format ? elBtn.dataset.format : 'pdf'
    let view = elBtn.dataset.view === 'true'
    let params = elBtn.dataset.params ? elBtn.dataset.params : ''

    var done = function(url){
        elBtn.classList.remove(ConvertApi.progressClass);
        window.location = url + (view ? '?download=inline' : '')
    }

    var fail = function(){
        elBtn.classList.remove(ConvertApi.progressClass);
        elBtn.classList.add(ConvertApi.errorClass);
    }

    this.classList.add(ConvertApi.progressClass);
    ConvertApi.convert(fileName, format, params, done, fail)
}

ConvertApi.absolutizeUrl = function(url) {
  let link = document.createElement('a')
  link.href = url
  return link.protocol + '//' + link.host + link.pathname + link.search + link.hash
};

ConvertApi.absolutizeDom = function() {
    [].forEach.call(document.querySelectorAll('[href], [src]'), function (el) {
        if (el.hasAttribute('href')) el.href = ConvertApi.absolutizeUrl(el.href)
        if (el.hasAttribute('src')) el.src = ConvertApi.absolutizeUrl(el.src)
    });
}

ConvertApi.convert = function(fileName, format, params, done, fail){
    ConvertApi.absolutizeDom()

    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                done(JSON.parse(this.responseText).Files[0].Url)
            } else {
                fail()
            }
        }
    }

    let authParams = ConvertApi.secret ? '?secret=' + ConvertApi.secret : '?'
    authParams += ConvertApi.token ? 'token=' + ConvertApi.secret : ''
    authParams += ConvertApi.apiKey ? '&apikey=' + ConvertApi.apiKey : ''

    xhttp.open('POST', 'https://v2.convertapi.com/html/to/' + format + authParams + '&filename=' + fileName + '&storefile=true&' + params, true)
    xhttp.setRequestHeader('Content-Type', 'application/octet-stream')
    xhttp.setRequestHeader('Content-Disposition', 'inline; filename="pdfbuttonpage.html"')
    xhttp.send(document.documentElement.outerHTML)
}

window.onload = function(){
    ConvertApi.init()
}