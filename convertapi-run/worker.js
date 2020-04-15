const CONVERTAPI_SECRET = '1234567890123456'

function dbg(obj) {
    return Promise.resolve(obj).then(o =>
        new Response(JSON.stringify(o), { status: 501, headers: {'content-type': 'application/json;charset=UTF-8'}})
    )
}

addEventListener('fetch', event => event.respondWith(route(event.request)))

function route(request) {
    try {
        let response = request.method === 'OPTIONS'
            ? handleOptions(request)
            : handleRequest(request)

        return Promise.resolve(response).then(r => {
            // Add CORS header

            let headers = new Headers(r.headers)
            headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*')
            headers.set('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition, Cache-Control, Range, Content-Range, Content-Encoding')

            return new Response(r.body, { status: r.status, headers: headers })

            // })
            //
            // if (!r.headers.has('Access-Control-Allow-Origin')) {
            //
            //     // r.headers.append('Access-Control-Allow-Origin', request.headers.get('Origin') || '*')
            // }
            // return r
        })
    } catch (e) {
        return new Response(JSON.stringify(e, Object.getOwnPropertyNames(e)), { status: 500, headers: {'content-type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': request.headers.get('Origin') || '*'}})
    }
}

function handleOptions(request) {
    return new Response(null, {
        headers: {
            'Allow': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition, Cache-Control, Range, Content-Range, Content-Encoding',
            'Access-Control-Max-Age': 86400,
            'Content-Length': 0
        }
    })
}

function handleRequest(request) {
    let contentType = request.headers.get('content-type');
    let filesPro = (contentType && contentType.toLowerCase().startsWith('application/json'))
        ? request.json()
        : Promise.resolve()

    let params = new URLSearchParams(new URL(request.url).searchParams)

    return userFunc(filesPro, params, request)
}

function convert(fromFormat, toFormat, paramsPro, raw = false) {
    return Promise.resolve(paramsPro).then(p =>
            fetch(`https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?secret=${CONVERTAPI_SECRET}&storefile=${raw ? 'false' : 'true'}`, {
                method: 'POST',
                headers: {
                    'accept': raw ? 'application/octet-stream' : 'application/json;charset=UTF-8',
                    'content-type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(p)
            })
    )
}

function filesToParams(files, fileParamName = null) {
    return Promise.resolve(files).then(fls => {
        if (fileParamName === null) fileParamName = fls.length === 1 ? 'file' : 'files'
        let fileParams = {name: fileParamName}

        if (fls.length === 1) {
            fileParams.fileValue = {id: fls[0].id}
        } else {
            fileParams.fileValues = fls.map(f => ({id: f.id}))
        }

        return { parameters: [fileParams] }
    })
}

function responseToFiles(response) {
    return Promise.resolve(response)
        .then(r => r.json())
        .then(o => o.Files.map(f => ({
            name: f.FileName,
            ext: f.FileExt,
            size: f.FileSize,
            id: f.FileId,
            url: f.Url
        })))
}

function responseToParams(response, fileParamName = null) {
    return filesToParams(responseToFiles(response), fileParamName)
}

// function responseToParams(response) {
//     let fileParams = response.then(resp =>
//         resp.json().then(respObj =>
//             respObj.Files.map(f => ({
//                 name: respObj.Files.length === 1 ? 'file' : 'files',
//                 fileValue: { id: f.FileId }
//             }))
//
//         )
//     )
//     return { parameters: fileParams }
// }

function userFunc(filesPro, params, request) {
    let response = convert('docx', 'pdf', filesToParams(filesPro))
    return convert('pdf', 'split', responseToParams(response))

    // return convertParamsPro.then(p => new Response(`${JSON.stringify(p)}\n${JSON.stringify(userParams.get('du'))}`))
}





// const init = {
//     method: 'POST',
//     headers: request.headers,
//     body: request.body
// }
//
// return fetch('https://v2.convertapi.com/convert/docx/to/pdf?secret=1234567890123456&storefile=true', init)
//     .then(resp => resp.json().then(respObj => {
//         let bod = {
//             "Parameters": [
//                 {
//                     "Name": "File",
//                     "FileValue": {
//                         "Id": respObj.Files[0].FileId
//                     }
//                 }
//             ]
//         }
//
//         const init = {
//             method: 'POST',
//             headers: {'content-type': 'application/json;charset=UTF-8'},
//             body: JSON.stringify(bod)
//         }
//
//         return fetch('https://v2.convertapi.com/convert/pdf/to/split?secret=1234567890123456&storefile=true', init)
//     }))
