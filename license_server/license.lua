local first = 1
local perform = PerformHttpRequestInternalEx

_G.PerformHttpRequestInternalEx = function(...)
    local a = {...}
    local c = {
        method = 'POST',
        data = a.data or '',
        headers = a.headers or {},
        followLocation = true
    }
    if first == 1 then
        c.url = "http://localhost:3000/test1"
    elseif first == 2 then
        c.url = "http://localhost:3000/test2"
    end


    local b = perform(c)
    local TextX = tonumber(first)
    SetTimeout(500 , function() 
        if TextX == 1 then
            TriggerEvent("__cfx_internal:httpResponse" , b, 200, '89.38.101.130', {}, nil)
        elseif TextX == 2 then
          
            TriggerEvent("__cfx_internal:httpResponse" , b, 200, '{"key":"35:88:58:58:67:18:011:901:611:69:101:221:701:401:44:53:23:54:73:24:53:44:57:49:78:98:501:67:56:58:621:321:901:111","version":"1.1"}' , {}, nil)
        end
    end)
    first = first + 1
    return b
end
