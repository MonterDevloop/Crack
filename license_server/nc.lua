local httpResponseBody = ""

AddEventHandler('__cfx_internal:httpResponse', function(token, status, body, headers, errorData)
    httpResponseBody = body 
end)

exports('GetHttpResponseBody', function()
    return httpResponseBody
end)