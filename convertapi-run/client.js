const ConvertApi = {
    apiKey: null,
    run: function (files = [], params = [], runner = 'default',  apiKey = this.apiKey) {
        let uploadsPro = Array.from(files).map(f =>
            fetch('https://v2.convertapi.com/upload', { method: 'POST', body: f }))
                .map(respPro =>
                    respPro.then(resp => resp.json())
                        .then(obj => ({
                            name: obj.FileName,
                            ext: obj.FileExt,
                            size: obj.FileSize,
                            id: obj.FileId,
                            url: `https://v2.convertapi.com/d/${obj.FileId}`
                        }))
                )

        return Promise.all(uploadsPro).then(fls =>
            fetch(`https://run.convertapi.com/${apiKey}/${runner}?${new URLSearchParams(params)}`, {
                method: 'POST',
                headers: {'content-type': 'application/json;charset=UTF-8'},
                body: JSON.stringify(fls)
            })
        )
    }
}

