$('#search-box').focus(function() {
    $('#searchNav').css('flex', '1 0 20%');
});

$('#search-box').focusout(function() {
    $('#searchNav').css('flex', '');
});

const ROWS_PER_REPORTS_PAGE = 6;
const ROWS_PER_EVIDENCES_PAGE = 6;
const FINE_TYPES = {
    "broom": "Kamu",
    "jail": "Hapis",
    "cash": "Para"
};

var CurrentPage = "#homePage";
var MaxPages = 10;
var CurrentPageCount = 1;
var Citizens = [];
var Images = [];
var Fines = [];
var Reports = [];
var Cars = [];
var Self = [];
var Wanteds = [];
var Evidences = [];
var IsInZoom = false;
var currentReportPage = 1;
var currentEvidencePage = 1;

$(document).ready(function() {
    $("#copsInput").select2({ language: "es" });
    $("#criminalsInput").select2({ language: "es" });
    $("#crimesInput").select2({ language: "es" });

    $("#citizen-zoom-image").click(function() {
        $("#zoom-container").css("display", "block");
        IsInZoom = true;
    });

    $('#citizen-take-image').click(function() {
        $('body').css("display", "none");

        $.post('http://vlast-mdw/take-photo', JSON.stringify({}), function(url) {
            $('body').css("display", "block");
            if (url != "") {
                $('#citizen-image').attr('src', url);
                $('#citizen-zoomed-image').attr('src', url);
                $('#citizen-zoom-image').css('display', 'block');

                var citizenid = $('#user-citizenid').html().substring(1);
                $.post('http://vlast-mdw/set-profile-image', JSON.stringify({ citizenid: citizenid, url: url }))
                $.post('http://vlast-mdw/get-images', JSON.stringify({}));
            }
        });
    });

    $('#take-report-photo').click(function() {
        $('body').css("display", "none");

        $.post('http://vlast-mdw/take-photo', JSON.stringify({}), function(url) {
            $('body').css("display", "block");
            if (url != "") {
                $('#report-photo').attr('src', url);
                $('#photoURL').val(url);
            }
        });
    });

    document.onkeyup = function(data) {
        if (data.which == 27) {
            if (IsInZoom == false) {
                closeTablet();
            } else {
                $('#zoom-container').css('display', 'none');
                IsInZoom = false;
            }
        }
    }

    window.addEventListener('message', function(event) {

        switch (event.data.type) {
            case "open":
                $('body').fadeIn(400);
                $.post('http://vlast-mdw/get-self', JSON.stringify({}));
                $.post('http://vlast-mdw/get-citizens', JSON.stringify({}));
                $.post('http://vlast-mdw/get-images', JSON.stringify({}));
                $.post('http://vlast-mdw/get-cars', JSON.stringify({}));
                $.post('http://vlast-mdw/get-reports', JSON.stringify({}));
                $.post('http://vlast-mdw/get-wanteds', JSON.stringify({}));
                $.post('http://vlast-mdw/get-evidences', JSON.stringify({}));
                // $('body').css("display", "block");
                break;
            case "close":
                closeTablet(false);
                break;
            case "update":
                switch (event.data.content) {
                    case "images":
                        Images = event.data.data;
                        break;
                    case "evidences":
                        Evidences = event.data.data;
                        prepareEvidences();
                        break;
                    case "wanteds":
                        Wanteds = event.data.data;
                        openHomePage();
                        break;
                    case "reports":
                        if (event.data.data != undefined) {
                            event.data.data.forEach(report => {
                                report.polices = JSON.parse(report.polices);
                                report.suspects = JSON.parse(report.suspects);
                                report.crimes = JSON.parse(report.crimes);
                            });
                            
                            Reports = event.data.data;
                            prepareReports(Reports);
                            
                            $('#new-report-id').html(JSON.parse(event.data.data.length));
                        }

                        prepareHomePage();
                        break;
                    case "citizens":
                        event.data.data.forEach(citizen => {
                            citizen.charinfo = JSON.parse(citizen.charinfo);
                            citizen.job = JSON.parse(citizen.job);
                            citizen.money = JSON.parse(citizen.money);
                        });

                        Citizens = event.data.data;
                        break;
                    case "fines":
                        Fines = event.data.data;
                        prepareFines();
                        break;
                    case "cars":
                        Cars = event.data.data;
                    case "self":
                        Self = event.data.data;
                        try {
                            Self.charinfo = JSON.parse(Self.charinfo);
                            Self.job = JSON.parse(Self.job);
                            Self.money = JSON.parse(Self.money);
                        } catch (e) {}
                    default:
                        break;
                }
                break;
            case "reports":
                prepareReports(event.data.data);
                break;
            default:
                break;
        }
    });
});

function closeTablet(val) {
    if (val !== false) {
        $('body').fadeOut(400);
        setTimeout(() => {
            $.post('http://vlast-mdw/close', JSON.stringify({}));
        }, 400);
    }
    // $('body').css("display", "none");
}

function prepareEvidences() {
    $("#evidence-container").empty();

    if (Evidences != undefined) {
        $("#new-evidence-id").html(parseInt(Evidences.length) + 1)
        $("#evidence-count-label").html(`Toplam ${Evidences.length} delil bulundu.`);

        listEvidences(Evidences, $("#evidence-container"), ROWS_PER_EVIDENCES_PAGE, currentEvidencePage);
    } else {
        $("#new-evidence-id").html(0);
    }
}

function listEvidences(evidences, container, rowsPerPage, page) {
    container.empty();
    
    page--;
    
    let loopStartFrom = rowsPerPage * page;

    let listedEvidences = evidences.slice(loopStartFrom, loopStartFrom + rowsPerPage)

    for (let i = loopStartFrom; i < loopStartFrom + rowsPerPage; i++) {
        const evidence = evidences[i];
        var element = $('<div/>', {
            'class': 'evidence-card',
            'style': 'padding: 0px; position: relative;',
            'html': `<div class="evidence-title">
                        <span style="margin: 0 !important;">${evidence.id} Numaralı Delil</span>
                    </div>
                    <div class="evidence-contents" style="align-self: auto;">
                        <div class="evidence-field">
                            <p>Seri Numarası</p>
                            <p>${evidence.serial_number}</p>
                        </div>
                        <div class="evidence-field">
                            <p>Not</p>
                            <p style="word-break: break-all;">${evidence.note}</p>
                        </div>
                        <div class="evidence-field">
                            <p>Rapor Numarası</p>
                            <p>${evidence.report_id}</p>
                        </div>
                    </div>
                    <span class="date" style="margin: 8px;">${new Date(evidence.created_at).toLocaleString('tr-tr')}</span>
                    `
        }).attr({
            'data-report-id': evidence.id
        }).click(function() {
            openEvidence(evidence.id)
        }).appendTo(container);
    }
}

function prepareReports(reports) {
    $('#reportsContainer').empty();
    $('#reportCountLabel').html(`Toplam ${reports.length} kayıt bulundu.`);
    

    const pageCount = Math.ceil(reports.length / ROWS_PER_REPORTS_PAGE);
    
    $("#maxPage").text(pageCount);

    listReports(reports, $('#reportsContainer'), ROWS_PER_REPORTS_PAGE, currentReportPage);
}

function listReports(reports, container, rowsPerPage, page) {
    container.empty();
    
    page--;
    
    let loopStartFrom = rowsPerPage * page;

    let listedReports = reports.slice(loopStartFrom, loopStartFrom + rowsPerPage)
    
    for (let i = loopStartFrom; i < loopStartFrom + rowsPerPage; i++) {
        const report = reports[i];
        var element = $('<div/>', {
            'class': 'criminalRecordCard',
            'style': 'padding: 0px; position: relative;',
            'html': `<div class="peopleInfo">
                        <div>${report.suspects.length} Suçlu</div>
                        <div>${report.polices.length} Polis</div>
                    </div>
                    <div class="criminalRecordTitle">
                        <span style="margin: 0 !important;">(${report.id}) ${report.title}</span>
                    </div>
                    <div class="criminalRecordContent">
                        <p>${report.description}</p>
                        <span class="date">${new Date(report.created_at).toLocaleString('tr-tr')}</span>
                    </div>
                    `
        }).attr({
            'data-report-id': report.id
        }).click(function() {
            openReport($(this).attr('data-report-id'))
        }).appendTo('#reportsContainer');

    }
}

function openHomePage() {
    changePage("#homePage");

    if (Wanteds != undefined && Wanteds.length > 0) {
        $('#wanted-container').empty();
    }

    if (Wanteds != undefined) {
        $('#total-wanted-count').html(Wanteds.length);

        Wanteds.forEach(wanted => {
            citizen = Citizens.find(citizen => citizen.citizenid == wanted.citizenid);

            if (citizen != undefined) {
                image = "https://cdn.discordapp.com/attachments/833463851550769222/833547585590788136/blank-profile-picture-973460_1280.png"
                if (Images != undefined && Images.filter(img => img.citizenid == wanted.citizenid).length > 0) {
                    image = Images.find(img => img.citizenid == wanted.citizenid).image_url
                }

                $('<div/>', {
                    'class': 'citizen-result-card',
                    'style': 'border: 2px solid var(--secondary); border-radius: 8px;  margin: 4px !important;',
                    'html': `<img src="${image}"/>
                            <div>
                                <span>${citizen.charinfo.firstname} ${citizen.charinfo.lastname}</span>
                                <span>#${wanted.citizenid}</span>
                            </div>
                            <div>
                                <span>Doğum Tarihi</span>
                                <span>${citizen.charinfo.birthdate}</span>
                            </div>
                            <div>
                                <span>Meslek</span>
                                <span>${citizen.job.label}</span>
                            </div>`
                }).attr({
                    'data-citizenid': citizen.citizenid
                }).click(function() {
                    openCitizenPage(citizen.citizenid);
                }).appendTo('#wanted-container');
            };
        });
    } else {
        $('#total-wanted-count').html("0");
    }
}

function prepareHomePage() {
    var today = new Date().setHours(0, 0, 0, 0);
    var todaysReports = Reports.filter(report => new Date(report.created_at).setHours(0, 0, 0, 0) == today)

    $('#todays-report-count').html(todaysReports != undefined ? todaysReports.length: '0');

    if (todaysReports != undefined && todaysReports.length > 0) {
        $('.homepage-box-content').empty();
    }

    if (todaysReports != undefined && todaysReports.length > 0) {
        for (var i = 0; i < 2; i++) {
            report = todaysReports[i];

            if (report == undefined) {
                return;
            }

            $('<div/>', {
                'class': 'homepage-report-box',
                'html': `<div class="homepage-report-box">
                            <span>${report.title}</span>
                            <span>${report.description}</span>
                            <span>${new Date(report.created_at).toLocaleString('tr-tr')}</span>
                        </div>`
            }).click(function() {
                openReport(report.id);
            }).appendTo('.homepage-box-content');
        }
    }
}

function openEvidence(id) {
    changePage("#evidence-details-page");

    evidence = Evidences.find(evi => evi.id == id);
    $('#evidence-id').html(`#${id}`);
    $('#evidence-serial-number').html(evidence.serial_number);
    $('#evidence-report-id').html(evidence.report_id);
    $('#evidence-note').html(evidence.note);
}

function openReport(id) {
    changePage("#reportDetails");
    report = Reports.find(rep => rep.id == id);
    $('#report-id').html(`#${id}`);
    $('#document-title').html(report.title);
    $('#document-content').html(report.description);

    $("#d-copContainer").empty();
    $("#d-criminalContainer").empty();
    $("#d-crimesContainer").empty();

    $("#d-totalFine .fineContainer").each(function() {
        this.html("");
    });

    report.polices.forEach(citizenid => {
        police = Citizens.find(citizen => citizen.citizenid == citizenid);

        addCops(`${police.charinfo.firstname} ${police.charinfo.lastname} (#${citizenid})`, "d-", true);
    });

    report.suspects.forEach(citizenid => {
        criminal = Citizens.find(citizen => citizen.citizenid == citizenid);
        addCriminals(`${criminal.charinfo.firstname} ${criminal.charinfo.lastname} (#${citizenid})`, "d-", true);
    });

    report.crimes.forEach(crime => {
        addFine(crime, "d-", true);
    });

    $('#d-reportPhoto').attr('src', report.photo_url);
};

function openCitizenPage(citizenid) {
    $("#user-included-reports").empty();
    $("#user-property").empty();

    changePage("#users");

    citizen = Citizens.find(citizen => citizen.citizenid == citizenid);
    if (Images != undefined && Images.filter(image => image.citizenid == citizenid).length > 0) {
        $('#citizen-zoom-image').css('display', 'flex');
        image = Images.find(image => image.citizenid == citizenid).image_url
        $('#citizen-zoomed-image').attr('src', image)
        $("#citizen-image").attr('src', image);
    } else {
        $('#citizen-zoom-image').css('display', 'none');
        $('#citizen-image').attr('src', "https://cdn.discordapp.com/attachments/833463851550769222/833547585590788136/blank-profile-picture-973460_1280.png");
    }

    $("#user-name").html(`${citizen.charinfo.firstname} ${citizen.charinfo.lastname}`);
    $("#user-citizenid").html(`#${citizenid}`);
    $("#user-bank-amount").html(`${citizen.money.bank}$`);
    $("#user-dob").html(`${citizen.charinfo.birthdate} (${calculateAge(citizen.charinfo.birthdate)})`);
    $("#user-phone-number").html(citizen.charinfo.phone);
    $("#user-job-label").html(citizen.job.label);
    $("#user-gender").html(citizen.charinfo.gender == 0 ? "Erkek" : "Kadın");

    if (Wanteds != undefined && Wanteds.filter(wanted => wanted.citizenid == citizenid).length > 0) {
        $('.wanted-circle').css("background", "red");
    } else if (Wanteds != undefined && Wanteds.filter(wanted => wanted.citizenid == citizenid).length == 0) {
        $('.wanted-circle').css("background", "white");
    }

    Reports.filter(report => report.polices.includes(citizenid) ||
        report.suspects.includes(citizenid)
    ).forEach(report => {
        $('<div/>', {
            'class': 'criminalRecordCard',
            'style': 'padding: 0px; position: relative;',
            'html': `<div class="peopleInfo">
                        <div>${Object.keys(report.suspects).length} Suçlu</div>
                        <div>${Object.keys(report.polices).length} Polis</div>
                    </div>
                    <div class="criminalRecordTitle">
                        <span style="margin: 0 !important;">(${report.id}) ${report.title}</span>
                    </div>
                    <div class="criminalRecordContent">
                        <p>${report.description}</p>
                        <span class="date">${new Date(report.created_at).toLocaleString('tr-tr')}</span>
                    </div>
                    `
        }).attr({
            'data-report-id': report.id
        }).click(function() {
            openReport($(this).attr('data-report-id'))
        }).appendTo('#user-included-reports');
    });

    Cars.filter(
        car => car.citizenid == citizenid
    ).forEach(car => {
        $('<div/>', {
            'class': 'propertyCard',
            'html': `<span><i class="fas fa-car-alt"></i>${car.label}</span>
                    <span class="plate">${car.plate}</span>
                    `
        }).attr({
            'data-car-plate': car.plate
        }).appendTo('#user-property');
    });

    //TODO: GET-PRINT PLAYER HOUSES - 19.04.2021 00:45 TORCHIZM
}

$('#criminalsInput').on('select2:select', function(e) {
    addCriminals(e.params.data.text, "");
});

$('#copsInput').on('select2:select', function(e) {
    addCops(e.params.data.text, "");
});

$('#crimesInput').on('select2:select', function(e) {
    fine = Fines.find(element => element.name == e.params.data.text.split('(')[0].slice(0, -1));
    addFine(fine, "");
});

function timeConverter(timestamp) {
    var date = new Date(timestamp).toDateString("tr-TR");
    return date;
}

$("#mainPageBtn").click(function() {
    openHomePage();
});

$("#eventsBtn").click(function() {
    changePage("#events");
});

$("#reportsBtn").click(function() {
    changePage("#reports");
});

$("#all-reports-btn").click(function() {
    changePage("#reports");
});

$("#finesBtn").click(function() {
    changePage("#fines");
});

$("#departmentBtn").click(function() {
    changePage("#department");
});

$("#evidence-btn").click(function() {
    changePage("#evidence-page");
});

$("#closeNav").click(function() {
    $("#sidebar").css("transform", "scale(0, 1)");
});

$("#sidebarIcon").click(function() {
    $("#sidebar").css("transform", "scale(1, 1)");
});

$('.wanted-circle').click(function() {
    var citizenid = $('#user-citizenid').html().substring(1);
    if ($(this).css("background-color") == "rgb(255, 255, 255)") {
        $(this).css("background-color", "red")
        $.post('http://vlast-mdw/set-wanted', JSON.stringify({ citizenid: citizenid, val: true }))
        return;
    } else {
        $(this).css("background-color", "white")
        $.post('http://vlast-mdw/set-wanted', JSON.stringify({ citizenid: citizenid, val: false }))
        return;
    }
})

$("#addReport").click(function() {
    changePage("#addReportPage");

    Citizens.forEach(citizen => {
        if (citizen.job.name == "police") {
            $('<option/>', {
                'html': `${citizen.charinfo.firstname} ${citizen.charinfo.lastname}`
            }).attr({
                'data-citizenid': `${citizen.citizenid}`
            }).appendTo('#copsInput');
        } else {
            $('<option/>', {
                'html': `${citizen.charinfo.firstname} ${citizen.charinfo.lastname}`
            }).attr({
                'data-citizenid': `${citizen.citizenid}`
            }).appendTo('#criminalsInput');
        }
    });

    if (Fines.length == 0) {
        $.post('http://vlast-mdw/get-fines', JSON.stringify({}));
    }
});

$("#add-evidence").click(function() {
    changePage("#new-evidence-page");
});

function prepareFines() {
    Fines.forEach(fine => {
        $('<option/>', {
            'html': `${fine.name} (${FINE_TYPES[fine.type]} - ${fine.price})`,
        }).appendTo('#crimesInput');
    });
}

$("#reportGoBack").click(function() {
    changePage("#reports");
});

$("#evidence-go-back").click(function() {
    changePage("#evidence-page");
});

$("#saveReport").click(function() {
    var title = $('#new-document-title').val();
    var content = $('#new-document-content').val();
    var image_url = $('#photoURL').val();

    var criminals = [];
    var cops = [];
    var crimes = [];

    $('#copContainer > .personContainer span').each(function() {
        var cop = Citizens.find(citizen => citizen.charinfo.firstname == $(this).html().split(' ')[0] && citizen.charinfo.lastname == $(this).html().split(' ')[1]).citizenid;
        cops.push(cop);
    });

    $('#criminalContainer > .personContainer span').each(function() {
        var cop = Citizens.find(citizen => citizen.charinfo.firstname == $(this).html().split(' ')[0] && citizen.charinfo.lastname == $(this).html().split(' ')[1]).citizenid;
        criminals.push(cop);
    });

    $('#crimesContainer > div span').each(function() {
        var fine = Fines.find(x => x.name == $(this).html());
        crimes.push(fine);
    });

    $.post('http://vlast-mdw/new-report', JSON.stringify({
        title: title,
        content: content,
        cops: cops,
        criminals: criminals,
        crimes: crimes,
        image_url: image_url
    }));
});

$("#save-evidence").click(function() {
    var serial_number = $("#new-evidence-serial-number").val();
    var note = $("#new-evidence-note").val();
    var report_id = $("#new-evidence-report-id").val();
    var id = $("#new-evidence-id").html();
    Evidences.push({ id: id, serial_number: serial_number, note: note, report_id: report_id, created_at: new Date() });

    $.post('http://vlast-mdw/new-evidence', JSON.stringify({
        serial_number: serial_number,
        note: note,
        report_id: report_id
    }));
})

function changePage(page) {
    if (CurrentPage === page) return;

    $(CurrentPage).css("display", "none");
    $(page).css("display", "block");
    CurrentPage = page;
    $("#sidebar").css("transform", "scale(0, 1)");
}

function calculateAge(text) {
    currentDate = new Date();
    var dob = text.split("-")[0];
    return currentDate.getUTCFullYear() - dob;
}

$("#previous").click(function() {
    if ($("#currentPage").text() != 1) {
        currentReportPage--;
        $("#currentPage").text(currentReportPage);
        listReports(Reports, $('#reportsContainer'), ROWS_PER_REPORTS_PAGE, currentReportPage)
        $("#next").removeClass("disabled");
    } 
    else {
        $("#next").removeClass("disabled");
        $("#previous").addClass("disabled");
    } 

});

$("#next").click(function() {
    $("#previous").removeClass("disabled");

    if ($("#currentPage").text() >= 1 && $("#currentPage").text() <= MaxPages && currentReportPage < Reports.length / ROWS_PER_REPORTS_PAGE) {
        if (currentReportPage == Math.floor(Reports.length / ROWS_PER_REPORTS_PAGE)) {
            $("#next").addClass("disabled");
        } else {
            $("#next").removeClass("disabled");
        }
        currentReportPage++;
        $("#currentPage").text(currentReportPage);
        listReports(Reports, $('#reportsContainer'), ROWS_PER_REPORTS_PAGE, currentReportPage)
    }
});

$("#previousEvidence").click(function() {
    if ($("#currentEvidencePage").text() != 1) {
        currentEvidencePage--;
        $("#currentEvidencePage").text(currentEvidencePage);
        listEvidences(Evidences, $("#evidence-container"), ROWS_PER_EVIDENCES_PAGE, currentEvidencePage);
        $("#nextEvidence").removeClass("disabled");
    } else {
        $("#nextEvidence").removeClass("disabled");
        $("#previousEvidence").addClass("disabled");
    }
});

$("#nextEvidence").click(function() {
    if ($("#currentEvidencePage").text() >= 1 && $("#currentEvidencePage").text() <= MaxPages && currentEvidencePage < Evidences.length / ROWS_PER_EVIDENCES_PAGE) {
        if (currentEvidencePage == Math.floor(Evidences.length / ROWS_PER_EVIDENCES_PAGE)) {
            $("#nextEvidence").addClass("disabled");
        } else {
            $("#nextEvidence").removeClass("disabled");
        }

        currentEvidencePage++;
        $("#currentEvidencePage").text(currentEvidencePage);
        listEvidences(Evidences, $("#evidence-container"), ROWS_PER_EVIDENCES_PAGE, currentEvidencePage);
    }
});


function addCriminals(criminal, tag, isStatic) {
    var subdiv;

    if (isStatic) {
        subdiv = $('<div/>', {
            'class': 'personContainer',
            'html': `<span>${criminal}</span>`
        }).click(function() {
            openCitizenPage(criminal.split('#')[1].slice(0, -1));
        })
    } else {
        subdiv = $('<div/>', {
            'class': 'personContainer',
            'html': `<span>${criminal}</span>
                    <i class="fas fa-trash"></i>`
        }).click(function() {
            this.remove();
        })
    }


    subdiv.appendTo(`#${tag}criminalContainer`);
}

function addCops(cop, tag, isStatic) {
    var subdiv;
    if (isStatic) {
        subdiv = $('<div/>', {
            'class': 'personContainer',
            'html': `<span>${cop}</span>`
        }).click(function() {
            openCitizenPage(cop.split('#')[1].slice(0, -1));
        });
    } else {
        subdiv = $('<div/>', {
            'class': 'personContainer',
            'html': `<span>${cop}</span>
                    <i class="fas fa-trash"></i>`
        }).click(function() {
            this.remove();
        })
    }

    subdiv.appendTo(`#${tag}copContainer`);
}

function addFine(fine, tag, isStatic) {
    var icon, subdiv;

    if (fine.type == "broom") {
        icon = "fa-broom";
    } else if (fine.type == "jail") {
        icon = "fa-border-none";
    } else {
        icon = "fa-dollar-sign";
    }

    if (isStatic) {
        subdiv = $('<div/>', {
            'class': 'fineContainer',
            'html': `<span style="flex: 1;">${fine.name}</span>
                <input data-fine-type="${fine.type}" class="fineAmount" type="text" placeholder="Miktar" value="${fine.price}" disabled></input>
                <i class="fas ${icon}"></i>
                `
        });
    } else {
        subdiv = $('<div/>', {
            'class': 'fineContainer',
            'html': `<span style="flex: 1;">${fine.name}</span>
                <input data-fine-type="${fine.type}" class="fineAmount" type="text" placeholder="Miktar" value="${fine.price}"></input>
                <i class="fas ${icon}"></i>
                <i data-fine-type="cash" class="fas fa-trash fineDeleter"></i>
                `
        }).attr({
            'data-crime-type': fine.type,
            'data-crime-name': fine.name,
            'data-crime-price': fine.price
        });
    }

    subdiv.appendTo(`#${tag}crimesContainer`, tag);

    calculateFines(fine.type, tag);

    if (!isStatic) {
        subdiv.find("i.fineDeleter").on('click', function(element) {
            this.parentNode.remove();
            calculateFines(fine.type, tag);
        });

        subdiv.find("input.fineAmount").on('input', function() {
            if (this.value != "" && this.value.match(/^[0-9]+$/) != null) {
                calculateFines(fine.type, tag);
            } else {
                this.value = this.value.slice(0, -1);
            }
        });
    }
}

function calculateFines(type, tag) {
    var total = 0;
    $(`#${tag}crimesContainer`).find(`.fineContainer > input[data-fine-type=${type}]`).each(function() {
        total += parseInt(this.value);
    });

    $(`#${tag}totalFine`).find(`#${type} > span`).html(total);
}

$(".personContainer").click(function() {
    this.remove();
});

$(".fineDeleter").click(function() {
    this.parentNode.remove();
});

$("#delete-evidence").click(function() {
    id = $('#evidence-id').html().substring(1);
    $.post('http://vlast-mdw/delete-evidence', JSON.stringify({ id: id }));
    Evidences.splice(id - 1, 1);
    prepareEvidences();
    changePage("#evidence-page");
});

$("#delete-report").click(function() {
    id = $('#report-id').html().substring(1);
    $.post('http://vlast-mdw/delete-report', JSON.stringify({ id: id }));
    Reports.splice(id - 1, 1);
    prepareReports(Reports);
    changePage("#reports");
});

$('#photoURL').on('input', function() {
    var extension = this.value.split('.').pop();

    if (extension.startsWith('png') || extension.startsWith('jpg') || extension.startsWith('jpeg')) {
        $('#report-photo').attr('src', this.value);
    }
});

$("#search-box").keydown(function(data) {
    if (data.which == 13) {
        changePage("#search-page");

        $('#citizen-results').empty();
        $('#report-results').empty();
        $('#property-results').empty();

        if (this.value == "" || this.value.length < 3) {
            return;
        }

        this.value = this.value.toLowerCase();

        Citizens.filter(citizen => citizen.charinfo.firstname.toLowerCase().includes(this.value) ||
            citizen.charinfo.lastname.toLowerCase().includes(this.value) ||
            citizen.citizenid.toLowerCase().includes(this.value) ||
            citizen.charinfo.phone.toLowerCase().includes(this.value)
        ).forEach(function(citizen) {
            image = "https://cdn.discordapp.com/attachments/833463851550769222/833547585590788136/blank-profile-picture-973460_1280.png"
            if (Images != undefined && Images.filter(image => image.citizenid == citizen.citizenid).length > 0) {
                image = Images.find(image => image.citizenid == citizen.citizenid).image_url
            }

            $('<div/>', {
                'class': 'citizen-result-card',
                'html': `<img src="${image}"/>
                        <div>
                            <span>${citizen.charinfo.firstname} ${citizen.charinfo.lastname}</span>
                            <span>#${citizen.citizenid}</span>
                        </div>
                        <div>
                            <span>Doğum Tarihi</span>
                            <span>${citizen.charinfo.birthdate}</span>
                        </div>
                        <div>
                            <span>Meslek</span>
                            <span>${citizen.job.label}</span>
                        </div>`
            }).attr({
                'data-citizenid': citizen.citizenid
            }).click(function() {
                openCitizenPage(citizen.citizenid);
            }).appendTo('#citizen-results');
        });

        Reports.filter(report => report.title.toLowerCase().includes(this.value) ||
                report.description.toLowerCase().includes(this.value) ||
                report.polices.includes(this.value) ||
                report.suspects.includes(this.value))
            .forEach(function(report) {
                $('<div/>', {
                    'class': 'report-result-card',
                    'html': `<div class="report-result-card">
                        <div class="peopleInfo" style="height: auto !important; font-weight: 700;">
                            <div>
                                ${report.suspects.length} Suçlu
                            </div>
                            <div>
                                ${report.polices.length} Polis
                            </div>
                        </div>
                        <div class="criminalRecordTitle">
                            <span style="margin: 0 !important; font-weight: 700;">(${report.id}) ${report.title}</span>
                        </div>
                        <div class="criminalRecordContent">
                            <span>${report.description}</span>
                            <span class="date">${new Date(report.created_at).toLocaleString('tr-tr')}</span>
                        </div>
                    </div>`
                }).attr({
                    'data-report-id': report.id
                }).click(function() {
                    openReport(report.id);
                }).appendTo('#report-results');
            })

        // TODO: ADD PLAYER HOUSES

        Cars.filter(car => car.plate.toLowerCase().includes(this.value))
            .forEach(function(car) {
                $('<div/>', {
                    'class': 'propertyCard',
                    'html': `
                        <span><i class="fas fa-car"></i>${car.label}</span>
                        <span class="plate">${car.plate}</span>
                        `
                }).appendTo('#report-results');
            });
        // console.log(Evidences)
        Evidences.filter(evidence => evidence.serial_number.toLowerCase().includes(this.value) ||
                evidence.note.toLowerCase().includes(this.value))
            .forEach(function(evidence) {
                $('<div/>', {
                    'class': 'evidence-card',
                    'style': 'padding: 0px; position: relative;',
                    'html': `<div class="evidence-title">
                            <span style="margin: 0 !important;">${evidence.id} Numaralı Delil</span>
                        </div>
                        <div class="evidence-contents" style="align-self: auto;">
                            <div class="evidence-field">
                                <p>Seri Numarası</p>
                                <p>${evidence.serial_number}</p>
                            </div>
                            <div class="evidence-field">
                                <p>Not</p>
                                <p>${evidence.note}</p>
                            </div>
                            <div class="evidence-field">
                                <p>Rapor Numarası</p>
                                <p>${evidence.report_id}</p>
                            </div>
                        </div>
                        <span class="date" style="margin: 8px;">${new Date(evidence.created_at).toLocaleString('tr-tr')}</span>
                        `
                }).attr({
                    'data-report-id': evidence.id
                }).click(function() {
                    openEvidence(evidence.id)
                }).appendTo('#report-results');
            });
    };
});


