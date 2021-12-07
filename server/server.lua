QBCore = nil 
Players = {}
TriggerEvent('QBCore:GetObject', function(obj) QBCore = obj end)

QBCore.Functions.CreateCallback('vlast-mdw:get-reports', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM mdw_reports ORDER BY created_at DESC;", function(result)
        if result[1] ~= nil then
            cb(result)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-citizens', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM players;", function(result)
        if result[1] ~= nil then
            data = {}
            for k,player in pairs(result) do
                table.insert(data, {citizenid = player.citizenid, charinfo = player.charinfo, job = player.job, image_url = player.metadata.mdwimageurl or "https://cdn.discordapp.com/attachments/833463851550769222/833547585590788136/blank-profile-picture-973460_1280.png", money = player.money})
            end
        
            cb(data)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-images', function(source, cb)
    exports['ghmattimysql']:execute("SELECT * FROM mdw_images", {
    }, function(result)
        if result[1] ~= nil then 
            cb(result)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-cars', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM player_vehicles;", function(result)
        if result[1] ~= nil then 
            cb(result)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-wanteds', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM mdw_wanteds ORDER BY created_at DESC;", function(result)
        if result[1] ~= nil then 
            cb(result)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-evidences', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM mdw_evidences ORDER BY created_at DESC;", function(result)
        if result[1] ~= nil then 
            cb(result)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-self', function(source, cb)
    Player = QBCore.Functions.GetPlayer(source)
    QBCore.Functions.ExecuteSql(false, "SELECT citizenid, charinfo, job, money FROM players WHERE citizenid=\"".. Player.PlayerData.citizenid .."\";", function(result)
        if result[1] ~= nil then
            cb(result[1])
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback('vlast-mdw:get-fines', function(source, cb)
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM fines;", function(result)
        if result[1] ~= nil then 
            cb(result)
        else
            cb(nil)
        end
    end)
end)

function RefreshPlayers()
    QBCore.Functions.ExecuteSql(false, "SELECT * FROM players;", function(result)
        if result[1] ~= nil then
            Players = result
        end
    end)
end

RegisterServerEvent('vlast-mdw:new-report')
AddEventHandler('vlast-mdw:new-report', function(data)
    exports['ghmattimysql']:execute("INSERT INTO mdw_reports (title, description, suspects, polices, crimes, photo_url) VALUES (@title, @description, @suspects, @polices, @crimes, @photo_url)", {
        ['@title'] = data.title,
        ['@description'] = data.content,
        ['@suspects'] = json.encode(data.criminals),
        ['@polices'] = json.encode(data.cops),
        ['@crimes'] = json.encode(data.crimes),
        ['@photo_url'] = data.image_url
    })
end)

RegisterServerEvent('vlast-mdw:new-evidence')
AddEventHandler('vlast-mdw:new-evidence', function(data)
    exports['ghmattimysql']:execute("INSERT INTO mdw_evidences (serial_number, note, report_id) VALUES (@serial_number, @note, @report_id)", {
        ['@serial_number'] = data.serial_number,
        ['@note'] = data.note,
        ['@report_id'] = data.report_id
    }, function(data)
		print(json.encode(data))
	end)
end)

RegisterServerEvent('vlast-mdw:set-profile-image')
AddEventHandler('vlast-mdw:set-profile-image', function(citizenid, url)
    if citizenid ~= nil and url ~= nil then
        exports['ghmattimysql']:execute("INSERT INTO mdw_images (citizenid, image_url) VALUES (\"".. citizenid .. "\", \"" .. url .."\") ON DUPLICATE KEY UPDATE image_url=\"".. url .."\"", {
        }, function(result)
        end)
    end
end)

RegisterServerEvent('vlast-mdw:delete-evidence')
AddEventHandler('vlast-mdw:delete-evidence', function(id)
    if id ~= nil then
        exports['ghmattimysql']:execute("DELETE FROM mdw_evidences WHERE id=".. id .. ";", {
        }, function(result)
        end)
    end
end)

RegisterServerEvent('vlast-mdw:delete-report')
AddEventHandler('vlast-mdw:delete-report', function(id)
    if id ~= nil then
        exports['ghmattimysql']:execute("DELETE FROM mdw_reports WHERE id=".. id .. ";", {
        }, function(result)
        end)
    end
end)

RegisterServerEvent('vlast-mdw:set-wanted')
AddEventHandler('vlast-mdw:set-wanted', function(citizenid, val)
    print(citizenid, val)
    if citizenid ~= nil and val ~= nil then
        if val == true then
            exports['ghmattimysql']:execute("INSERT INTO mdw_wanteds (citizenid) VALUES (\"" .. citizenid .. "\")", {
            }, function(result)
            end)
        else
            exports['ghmattimysql']:execute("DELETE FROM mdw_wanteds WHERE citizenid=\"" .. citizenid .. "\"", {
            }, function(result)
            end)
        end
    end
end)