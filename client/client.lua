isOpen = false

local job = {}

Citizen.CreateThread(function() 
    while QBCore == nil do
        TriggerEvent("QBCore:GetObject", function(obj) QBCore = obj end)
        Citizen.Wait(200)
    end

	job = QBCore.Functions.GetPlayerData().job
end)

RegisterCommand("test", function(source, args)
    ToggleTablet()
end)

RegisterNUICallback('close', function()
    ToggleTablet(false)
end)

RegisterNUICallback('set-profile-image', function(data)
    TriggerServerEvent('vlast-mdw:set-profile-image', data.citizenid, data.url)
end)

RegisterNUICallback('get-wanteds', function(data)
	QBCore.Functions.TriggerCallback("vlast-mdw:get-wanteds", function(data)
		SendNUIMessage({type = 'update', content= "wanteds", data = data})
	end)
end)

RegisterNUICallback('set-wanted', function(data)
	TriggerServerEvent('vlast-mdw:set-wanted', data.citizenid, data.val)
end)

RegisterNUICallback('get-cars', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-cars", function(data)
		SendNUIMessage({type = 'update', content= "cars", data = data})
	end)
end)

RegisterNUICallback('get-reports', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-reports", function(data)
		print("reports sent")
		SendNUIMessage({type = 'update', content= "reports", data = data})
	end)
end)

RegisterNUICallback('get-citizens', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-citizens", function(data)
		SendNUIMessage({type = 'update', content = "citizens", data = data})
	end)
end)

RegisterNUICallback('get-images', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-images", function(data)
		SendNUIMessage({type = 'update', content = "images", data = data})
	end)
end)

RegisterNUICallback('get-self', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-self", function(data)
		SendNUIMessage({type = 'update', content = "self", data = data})
	end)
end)

RegisterNUICallback('get-fines', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-fines", function(data)
		SendNUIMessage({type = 'update', content = "fines", data = data})
	end)
end)

RegisterNUICallback('get-evidences', function()
    QBCore.Functions.TriggerCallback("vlast-mdw:get-evidences", function(data)
		SendNUIMessage({type = 'update', content = "evidences", data = data})
	end)
end)

RegisterNUICallback('new-report', function(data)
    TriggerServerEvent('vlast-mdw:new-report', data)
end)

RegisterNUICallback('new-evidence', function(data)
    TriggerServerEvent('vlast-mdw:new-evidence', data)
end)

RegisterNUICallback('delete-evidence', function(data)
    TriggerServerEvent('vlast-mdw:delete-evidence', data.id)
end)

RegisterNUICallback('delete-report', function(data)
    TriggerServerEvent('vlast-mdw:delete-report', data.id)
end)

RegisterNetEvent('vlast-mdw:open')
AddEventHandler('vlast-mdw:open', function()
    ToggleTablet(true)
end)

RegisterNetEvent('vlast-mdw:close')
AddEventHandler('vlast-mdw:close', function()
    ToggleTablet(false)
end)

function ToggleTablet(val)
    if val == nil then 
        if isOpen then 
            val = false
        else
            val = true
        end
    end

    toggle = ""
    if val == true then toggle = "open" else toggle = "close" end

    SetNuiFocus(val , val)
    SendNUIMessage({type = toggle})
    isOpen = val

	if isOpen then
		startAnim()
	else
		stopAnim()
	end
end

local temp = false
function startAnim()
	Citizen.CreateThread(function()
    
      if not temp then
	       RequestAnimDict("amb@world_human_seat_wall_tablet@female@base")
              while not HasAnimDictLoaded("amb@world_human_seat_wall_tablet@female@base") do
                Citizen.Wait(0)
              end
		  attachObject()
		  TaskPlayAnim(GetPlayerPed(-1), "amb@world_human_seat_wall_tablet@female@base", "base" ,8.0, -8.0, -1, 50, 0, false, false, false)
          temp = true
      end
	end)
end

function attachObject()
	tab = CreateObject(GetHashKey("prop_cs_tablet"), 0, 0, 0, true, true, true)
	AttachEntityToEntity(tab, GetPlayerPed(-1), GetPedBoneIndex(GetPlayerPed(-1), 57005), 0.17, 0.10, -0.13, 20.0, 180.0, 180.0, true, true, false, true, 1, true)
end

function stopAnim()
    temp = false
	StopAnimTask(GetPlayerPed(-1), "amb@world_human_seat_wall_tablet@female@base", "base" ,8.0, -8.0, -1, 50, 0, false, false, false)
    DeleteObject(tab)
end

RegisterNUICallback('take-photo', function(data, cb)
    CreateMobilePhone(1)
    CellCamActivate(true, true)
    takePhoto = true
    SetNuiFocus(false, false)

    while takePhoto do
        Citizen.Wait(0)

        if IsControlJustPressed(1, 27) then -- Toogle Mode
            frontCam = not frontCam
            CellFrontCamActivate(frontCam)
        elseif IsControlJustPressed(1, 177) then -- CANCEL
            DestroyMobilePhone()
            CellCamActivate(false, false)
            cb("")
            takePhoto = false
            SetNuiFocus(true, true)
            break
        elseif IsControlJustPressed(1, 176) then -- TAKE.. PIC
            exports['screenshot-basic']:requestScreenshotUpload("", "files[]", function(data)
            local resp = json.decode(data)
            DestroyMobilePhone()
            CellCamActivate(false, false)
            SetNuiFocus(true, true)
            cb(resp.attachments[1].proxy_url)
        end)

        takePhoto = false
    end

  end
end)

function CellFrontCamActivate(activate)
	return Citizen.InvokeNative(0x2491A93618B7D838, activate)
end

local OwnerPedId = nil
local PhoneProp = 0
local PhoneModel = -1038739674
local CurrentStatus = 'out'
local LastDict = nil
local LastAnim = nil
local LastIzFreeze = false

local ANIMS = {
	['cellphone@'] = {
		['out'] = {
			['text'] = 'cellphone_text_in',
			['call'] = 'cellphone_call_listen_base',
		},
		['text'] = {
			['out'] = 'cellphone_text_out',
			['text'] = 'cellphone_text_in',
			['call'] = 'cellphone_text_to_call',
		},
		['call'] = {
			['out'] = 'cellphone_call_out',
			['text'] = 'cellphone_call_to_text',
			['call'] = 'cellphone_text_to_call',
		}
	},
	['anim@cellphone@in_car@ps'] = {
		['out'] = {
			['text'] = 'cellphone_text_in',
			['call'] = 'cellphone_call_in',
		},
		['text'] = {
			['out'] = 'cellphone_text_out',
			['text'] = 'cellphone_text_in',
			['call'] = 'cellphone_text_to_call',
		},
		['call'] = {
			['out'] = 'cellphone_horizontal_exit',
			['text'] = 'cellphone_call_to_text',
			['call'] = 'cellphone_text_to_call',
		}
	}
}

function NewPhoneProp()
	DeletePhone()
	RequestModel(PhoneModel)
	while not HasModelLoaded(PhoneModel) do
		Citizen.Wait(1)
	end
	PhoneProp = CreateObject(PhoneModel, 1.0, 1.0, 1.0, 1, 1, 0)
	local bone = GetPedBoneIndex(OwnerPedId, 28422)
	AttachEntityToEntity(PhoneProp, OwnerPedId, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
end

function DeletePhone ()
	if PhoneProp ~= 0 then
		Citizen.InvokeNative(0xAE3CBE5BF394C9C9 , Citizen.PointerValueIntInitialized(PhoneProp))
		PhoneProp = 0
	end
end

function PhonePlayAnim (status, freeze, force)
	if CurrentStatus == status and force ~= true then
		return
	end

	OwnerPedId = GetPlayerPed(-1)
	local freeze = freeze or false

	local dict = "cellphone@"
	if IsPedInAnyVehicle(OwnerPedId, false) then
		dict = "anim@cellphone@in_car@ps"
	end
	LoadAnimDict(dict)

	local anim = ANIMS[dict][CurrentStatus][status]
	if CurrentStatus ~= 'out' then
		StopAnimTask(OwnerPedId, LastDict, LastAnim, 1.0)
	end
	local flag = 50
	if freeze == true then
		flag = 14
	end
	TaskPlayAnim(OwnerPedId, dict, anim, 3.0, -1, -1, flag, 0, false, false, false)

	if status ~= 'out' and CurrentStatus == 'out' then
		Citizen.Wait(380)
		NewPhoneProp()
	end

	LastDict = dict
	LastAnim = anim
	LastIzFreeze = freeze
	CurrentStatus = status

	if status == 'out' then
		Citizen.Wait(180)
		deletePhone()
		StopAnimTask(OwnerPedId, LastDict, LastAnim, 1.0)
	end

end

function PhonePlayOut ()
	PhonePlayAnim('out')
end

function PhonePlayText ()
	PhonePlayAnim('text')
end

function PhonePlayCall (freeze)
	PhonePlayAnim('call', freeze)
end

function PhonePlayIn () 
	if CurrentStatus == 'out' then
		PhonePlayText()
	end
end

function LoadAnimDict(dict)
	RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Citizen.Wait(1)
	end
end

RegisterNetEvent('vlast-mdw:open-camera')
AddEventHandler('vlast-mdw:open-camera', function()
    CreateMobilePhone(1)
	CellCamActivate(true, true)
    PhonePlayOut()
end)