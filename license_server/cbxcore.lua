local p = PerformHttpRequestInternalEx
function PerformHttpRequestInternal(...)
    local args = {...}

    local t = {
        url = 'https://localhost',
        method = method or 'GET',
        data = data or '',
        headers = headers or {},
        followLocation = followLocation
    }

    local ids = p(t)

    SetTimeout(100, function() 
        TriggerEvent('__cfx_internal:httpResponse' , ids , 200 , '{"status_script":"sm20_success_","version_now":"1.1.3","username_":"Lexza#0"}')
    end)

    return ids
end
