local add = PerformHttpRequest
local first = 1
local httpDispatch = {}

AddEventHandler('__cfx_internal:httpResponse', function(token, status, body, headers, errorData)
    
    if httpDispatch[token] then
        local userCallback = httpDispatch[token]
        httpDispatch[token] = nil
        if first == 1 then
            userCallback(200, '127.0.0.1')
        elseif first == 2 then
            userCallback(200, '{"isSuccess":true,"message":"success","data":"verified","additional":"a"}', headers, errorData)
        end
        first = first + 1
    end
end)

function PerformHttpRequest(url, cb, method, data, headers, options)
    local followLocation = true

    if options and options.followLocation ~= nil then
        followLocation = options.followLocation
    end

    local t = {
        url = url,
        method = 'GET',
        data = data or '',
        headers = headers or {},
        followLocation = followLocation
    }

    local id = PerformHttpRequestInternalEx(t)

    if id ~= -1 then
        httpDispatch[id] = cb
    else
        cb(0, nil, {}, 'Failure handling HTTP request')
    end
end
