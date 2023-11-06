const editButton = document.createElement("button");
const body = document.querySelector("body");
let table = document.querySelector("table");
let rows = table?.querySelectorAll("tr");
let oasisToken;
let container = null;
let left = null;
let right = null;


// Arka plan betiği ile iletişim kurmak için bir port oluştur
const port = chrome.runtime.connect({ name: "oasis-get-token" });

// Arka plan betiği ile 'getTokenFromOasis' talebini başlat
port.postMessage({ action: "getTokenFromOasis" });

// Port üzerinden veri alışverişi yapmak için bir mesaj dinleyici ekle
port.onMessage.addListener((message) => {
    if (message.token) {
        oasisToken = message.token;
    } else {
        console.error("Token bilgisi bulunamadı.");
    }
});



function editEditButton() {

    // Sayfanın URL'sini al
    const currentUrl = window.location.href;

    // 'export' kelimesini içermiyor veya URL 'file://' ile başlamıyorsa düzenleme düğmesini eklemeyi durdur
    if (!currentUrl.includes("export") || !currentUrl.startsWith("file://")) {
        return;
    }

    editButton.textContent = "Düzenle";
    editButton.style.position = "fixed";
    editButton.style.top = "20px";
    editButton.style.right = "20px";
    editButton.classList.add("print-hidden");

    editButton.addEventListener("click", editPage);

    document.body.appendChild(editButton);
}

window.addEventListener("load", editEditButton);

function editPage() {

    // Tabloyu body içinden kaldır
    document.body.removeChild(table);


    // Header ekle
    const header = document.createElement("div");
    const date = document.createElement("span");
    const technician = document.createElement("span");
    const fuel = document.createElement("span");
    const vehicle = document.createElement("span");
    const nameDropdown = document.createElement("select");
    const nameDropdownPlus = document.createElement("span");
    const nameDropdownMinus = document.createElement("span");
    const plateDropdown = document.createElement("select");
    const plateDropdownPlus = document.createElement("span");
    const plateDropdownMinus = document.createElement("span");

    nameDropdown.title = "Teknisyenı Seçiniz";
    nameDropdown.classList.add("current-technician");
    nameDropdownPlus.title = "Teknisyenı Ekle";
    nameDropdownMinus.title = "Teknisyenı Sil";
    plateDropdown.title = "Araç Seçiniz";
    plateDropdownPlus.title = "Araç Ekle";
    plateDropdownMinus.title = "Araç Kaldır";


    // İsimleri dropdown'a ekle
    let names = getNamesFromLocalStorage();
    createDropdown(nameDropdown, names);

    nameDropdownPlus.addEventListener("click", () => {
        const newName = prompt("Yeni isim girin:");
        if (newName) {
            names.push(newName.trim());
            createDropdown(nameDropdown, names);
            saveNamesToLocalStorage(names);
        }
    });

    nameDropdownMinus.addEventListener("click", () => {
        const name = prompt("Silmek istediğiniz ismi girin:");
        if (name) {
            deleteNameFromDropdownAndLocalStorage(nameDropdown, names, name.trim());
        }
        names = getNamesFromLocalStorage();
    });


    // Plakaları dropdown'a ekle
    let plates = getPlatesFromLocalStorage();
    createDropdown(plateDropdown, plates);

    plateDropdownPlus.addEventListener("click", () => {
        const newPlate = prompt("Yeni plaka girin:");
        if (newPlate) {
            plates.push(newPlate.trim());
            createDropdown(plateDropdown, plates);
            savePlatesToLocalStorage(plates);
        }
    });

    plateDropdownMinus.addEventListener("click", () => {
        const plate = prompt("Silmek istediğiniz plakayı girin:");
        if (plate) {
            deletePlateFromDropdownAndLocalStorage(plateDropdown, plates, plate.trim());
        }
        plates = getPlatesFromLocalStorage();
    });

    date.textContent = "Tarih: ";
    technician.textContent = "Teknisyen: ";
    fuel.textContent = "Yakıt: ";
    vehicle.textContent = "Araç: ";
    nameDropdownPlus.textContent = "➕";
    nameDropdownMinus.textContent = "➖";
    plateDropdownPlus.textContent = "➕";
    plateDropdownMinus.textContent = "➖";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    // Varsayılan olarak bugünün tarihini alın
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const defaultDate = `${year}-${month}-${day}`;
    dateInput.value = defaultDate;

    const fuelInput = document.createElement("input");

    date.appendChild(dateInput);
    technician.appendChild(nameDropdown);
    technician.appendChild(nameDropdownPlus);
    technician.appendChild(nameDropdownMinus);
    fuel.appendChild(fuelInput);
    vehicle.appendChild(plateDropdown);
    vehicle.appendChild(plateDropdownPlus);
    vehicle.appendChild(plateDropdownMinus);

    header.appendChild(date);
    header.appendChild(technician);
    header.appendChild(fuel);
    header.appendChild(vehicle);

    // Container oluştur
    container = document.createElement("div");
    left = document.createElement("div");
    right = document.createElement("div");

    container.classList.add("container");
    left.id = "editPageAron";
    left.classList.add("left");
    right.classList.add("right");


    left.appendChild(header);


    // Tabloyu tekrar ekle
    left.appendChild(table);


    container.appendChild(left);
    container.appendChild(right);
    document.body.appendChild(container);


    // Gereksiz sütunları kaldır
    rows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length >= 7) {
            row.removeChild(tds[5]); // Başvuru Notu'nu sil
            row.removeChild(tds[6]); // Adres'i sil
        }
    });

    rows.forEach((row) => {

        // Sıralamayı düzelt
        const tds = row.querySelectorAll("td");
        if (tds.length >= 7) {
            let newTds = [];
            newTds.push(tds[0]);
            newTds.push(tds[6]);
            newTds.push(tds[5]);
            newTds.push(tds[2]);
            newTds.push(tds[4]);
            newTds.push(tds[1]);
            newTds.push(document.createElement("td"));
            newTds.push(tds[3]);
            newTds.push(document.createElement("td"));
            newTds.push(document.createElement("td"));
            newTds.push(document.createElement("td"));

            // Tüm td'leri temizle
            tds.forEach((td) => {
                row.removeChild(td);
            });

            // Yeni sıralamayı ekle
            newTds.forEach((td) => {
                row.appendChild(td);
            });
        }
    });

    // Başlıkları düzelt
    rows[0].querySelectorAll("td")[0].textContent = "#";
    rows[0].querySelectorAll("td")[1].textContent = "Müşteri";
    rows[0].querySelectorAll("td")[2].textContent = "Mahalle";
    rows[0].querySelectorAll("td")[3].textContent = "Saat";
    rows[0].querySelectorAll("td")[4].textContent = "Başvuru Nedeni";
    rows[0].querySelectorAll("td")[5].textContent = "Fiş Durumu";
    rows[0].querySelectorAll("td")[6].textContent = "Malzeme";
    rows[0].querySelectorAll("td")[7].textContent = "Fiş No";
    rows[0].querySelectorAll("td")[8].textContent = "Açıklama";
    rows[0].querySelectorAll("td")[9].textContent = "Ücret";
    rows[0].querySelectorAll("td")[10].textContent = "";


    // Input ekle
    const dataRows = [...rows].slice(1); // İlk satır (başlık satırı) dışındaki tüm satırları seç

    dataRows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length >= 11) {
            const seventhCell = tds[6];
            const ninthCell = tds[8];
            const tenthCell = tds[9];
            const eleventhCell = tds[10];

            // 7. hücreye input ekle
            createInputCell(seventhCell);

            // 9. hücreye input ekle
            createInputCell(ninthCell);

            // 10. hücreye input ekle
            const tenthInput = document.createElement("input");
            tenthInput.type = "number";

            tenthCell.appendChild(tenthInput);

            // 11. hücreye dropdown (seçim kutusu) ekle
            const paymentMethodSelect = document.createElement("select");

            // Dropdown seçenekleri
            const options = ["G", "N", "K", "H"];
            options.forEach((optionText) => {
                const option = document.createElement("option");
                option.value = optionText;
                option.textContent = optionText;
                paymentMethodSelect.appendChild(option);
            });

            eleventhCell.appendChild(paymentMethodSelect);
        }
    });


    // Yeni satır ekle butonunu ekle
    const addDivBottomTable = document.createElement("div");
    const addRowButton = document.createElement("button");
    addRowButton.textContent = "Yeni Satır Ekle";
    addRowButton.classList.add("new-row-button", "print-hidden");
    addDivBottomTable.appendChild(addRowButton);
    left.appendChild(addDivBottomTable);
    addRowButton.addEventListener("click", createRow);

    // Genel toplam için div oluştur
    const totalDiv = document.createElement("div");
    totalDiv.id = "totalDiv";
    const totalTable = document.createElement("table");

    // Nakit toplamı hesapla ve ekle
    const totalCashRow = document.createElement("tr");
    const totalCashCell = document.createElement("td");
    const totalCashCellAmount = document.createElement("td");
    totalCashCell.textContent = "Nakit Toplam:";
    const cashTotalAmount = calculateTotalAmount('N');
    totalCashCellAmount.textContent = cashTotalAmount.toFixed(2);
    totalCashRow.appendChild(totalCashCell);
    totalCashRow.appendChild(totalCashCellAmount);
    totalTable.appendChild(totalCashRow);

    // Kredi kartı toplamı hesapla ve ekle
    const totalCreditRow = document.createElement("tr");
    const totalCreditCell = document.createElement("td");
    const totalCreditCellAmount = document.createElement("td");
    totalCreditCell.textContent = "K.K. Toplam:";
    const creditTotalAmount = calculateTotalAmount('K');
    totalCreditCellAmount.textContent = creditTotalAmount.toFixed(2);
    totalCreditRow.appendChild(totalCreditCell);
    totalCreditRow.appendChild(totalCreditCellAmount);
    totalTable.appendChild(totalCreditRow);

    // Havale toplamı hesapla ve ekle
    const totalRemittanceRow = document.createElement("tr");
    const totalRemittanceCell = document.createElement("td");
    const totalRemittanceCellAmount = document.createElement("td");
    totalRemittanceCell.textContent = "Havale Toplam:";
    const remittanceTotalAmount = calculateTotalAmount('H');
    totalRemittanceCellAmount.textContent = remittanceTotalAmount.toFixed(2);
    totalRemittanceRow.appendChild(totalRemittanceCell);
    totalRemittanceRow.appendChild(totalRemittanceCellAmount);
    totalTable.appendChild(totalRemittanceRow);

    // Genel toplamı ekle
    const totalAmountRow = document.createElement("tr");
    const totalAmountCell = document.createElement("td");
    const totalAmountCellAmount = document.createElement("td");
    totalAmountCell.textContent = "Genel Toplam:";
    const totalAmount = calculateTotalAmount();
    totalAmountCellAmount.textContent = totalAmount.toFixed(2);
    totalAmountRow.appendChild(totalAmountCell);
    totalAmountRow.appendChild(totalAmountCellAmount);
    totalTable.appendChild(totalAmountRow);

    totalDiv.appendChild(totalTable);
    left.appendChild(totalDiv);

    addEventListenerForTotalAmount();

    // Ücret inputlarını seç
    const tenthCellInputs = document.querySelectorAll("td:nth-child(10) input");
    // Her bir ücret input öğesi için blur olayını dinleyen bir dinleyici ekleyin
    tenthCellInputs.forEach((input) => {
        input.addEventListener("blur", function () {
            formatNumber(input);
        });
    });


    // Not icin textarea ekle
    const noteDiv = document.createElement("div");
    const note = document.createElement("textarea");
    note.placeholder = "Not:";
    note.id = "note";
    note.classList.add("print-hidden");
    noteDiv.appendChild(note);
    left.appendChild(noteDiv);


    updateTotalAmount(); // ilk açılışta genel toplamı 0 iken "0'larin" gözükmemesi için

    document.body.removeChild(editButton);

    autoGrowTextarea();

    fillDescriptionWithNakliyeMontaj();
    fillMaterialColumn();
}

function addEventListenerForTotalAmount() {
    // 9. ve 10. hücrelerdeki inputları seç
    const tenthCellInputs = document.querySelectorAll("td:nth-child(10) input");
    const eleventhCellSelects = document.querySelectorAll("td:nth-child(11) select");

    // 9. ve 10. hücrelerdeki inputlara event listener ekle
    tenthCellInputs.forEach((input) => {
        input.addEventListener("input", updateTotalAmount);
    });
    eleventhCellSelects.forEach((select) => {
        select.addEventListener("change", updateTotalAmount);
    });
}

function createRow() {
    table = document.querySelector("table");
    let tbody = document.querySelector("tbody");
    rows = tbody.querySelectorAll("tr");
    const newRow = rows[rows.length - 2].cloneNode(true);
    const cells = newRow.querySelectorAll("td");
    const lastIndex = +cells[0].textContent;

    cells.forEach((cell, index) => {
        if (index !== 0 && index !== 9 && index !== 10) {
            cell.textContent = "";
            createInputCell(cell)
        } else if (index === 9) {
            const input = cell.querySelector('input');
            input.value = "";
            input.addEventListener("blur", () => formatNumber(input));
        }
    });

    cells[0].textContent = lastIndex + 2;

    tbody.appendChild(newRow);

    table = document.querySelector("table");
    rows = table.querySelectorAll("tr");

    autoGrowTextarea();
    addEventListenerForTotalAmount();
}

function calculateTotalAmount(paymentType) {
    let total = 0;
    rows.forEach((row) => {
        const inputs = row.querySelectorAll("td:nth-child(10) input[type='number']");
        const select = row.querySelector("td:nth-child(11) select");

        if (select && inputs.length > 0 && select.value === paymentType) {
            const inputValue = parseFloat(inputs[0].value);
            if (!isNaN(inputValue)) {
                total += inputValue;
            }
        }
    });
    return total;
}

// Toplam tutarı güncelleyen fonksiyon
function updateTotalAmount() {
    const cashTotalAmount = calculateTotalAmount('N');
    const creditTotalAmount = calculateTotalAmount('K');
    const remittanceTotalAmount = calculateTotalAmount('H');

    const totalTable = document.querySelector("#totalDiv table");
    const totalCells = totalTable.querySelectorAll("td");

    totalCells.forEach((cell, index) => {
        if (index === 1) {
            cell.textContent = (cashTotalAmount + creditTotalAmount + remittanceTotalAmount) ? cashTotalAmount.toFixed(2) + " ₺" : "";
        } else if (index === 3) {
            cell.textContent = (cashTotalAmount + creditTotalAmount + remittanceTotalAmount) ? creditTotalAmount.toFixed(2) + " ₺" : "";
        } else if (index === 5) {
            cell.textContent = (cashTotalAmount + creditTotalAmount + remittanceTotalAmount) ? remittanceTotalAmount.toFixed(2) + " ₺" : "";
        } else if (index === 7) {
            cell.textContent = (cashTotalAmount + creditTotalAmount + remittanceTotalAmount)
                ? (cashTotalAmount + creditTotalAmount + remittanceTotalAmount).toFixed(2) + " ₺" : "";
        }
    });
    createTotalCashFromAllTechniciansTable(cashTotalAmount);
}

function formatNumber(input) {
    let inputValue = input.value;
    let floatValue = parseFloat(inputValue);
    if (!isNaN(floatValue)) {
        input.value = floatValue.toFixed(2);
    }
}

function createInputCell(cell) {
    const input = document.createElement("textarea");
    cell.appendChild(input);
}

function getNamesFromLocalStorage() {
    const namesJSON = localStorage.getItem("names6091");
    return namesJSON ? JSON.parse(namesJSON) : [" "];
}

function saveNamesToLocalStorage(names) {
    localStorage.setItem("names6091", JSON.stringify(names));
}

function getPlatesFromLocalStorage() {
    const namesJSON = localStorage.getItem("plates6091");
    return namesJSON ? JSON.parse(namesJSON) : [" "];
}

function savePlatesToLocalStorage(plates) {
    localStorage.setItem("plates6091", JSON.stringify(plates));
}

function createDropdown(dropdown, values) {
    values.sort(); // İsimleri sırala
    clearDropdown(dropdown); // Dropdown listesini temizle
    values.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        dropdown.appendChild(option);
    });
}

function deleteNameFromDropdownAndLocalStorage(dropdown, names, deletedName) {
    names = names.filter((item) => item.toLowerCase() !== deletedName.toLowerCase());
    createDropdown(dropdown, names);
    saveNamesToLocalStorage(names);
}

function deletePlateFromDropdownAndLocalStorage(dropdown, plates, deletedPlate) {
    plates = plates.filter((item) => item.toLowerCase() !== deletedPlate.toLowerCase());
    createDropdown(dropdown, plates);
    savePlatesToLocalStorage(plates);
}

function clearDropdown(dropdown) {
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
}

function fillDescriptionWithNakliyeMontaj() {
    // Satırları al
    const dataRows = [...rows].slice(1); // İlk satır (başlık satırı) dışındaki tüm satırları seç

    dataRows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length >= 7) {
            const reason = tds[4].textContent.trim();
            const descriptionCell = tds[8].querySelector("textarea");

            if (reason.toLowerCase().includes("nakliye montaj")) {
                descriptionCell.value = "Nakliye Montaj";
            } else if (reason.toLowerCase().includes("montaj")) {
                descriptionCell.value = "Montaj";
            } else if (reason.toLowerCase().includes("nakliye")) {
                descriptionCell.value = "Nakliye";
            }
        }
    });
}

function fillMaterialColumn() {

    // Satırları al
    const dataRows = [...rows].slice(1); // İlk satır (başlık satırı) dışındaki tüm satırları seç

    dataRows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        const receiptNo = tds[7].textContent.trim();
        const oasisUrl = `https://ysdepo-pilot.arcelik.com/YsDepoYonetimiApi/api/DepoYonetimi/MaterialSearchDetail/${receiptNo}/FisNo/6058`;
        let headers = new Headers();
        headers.append("Authorization", `Bearer ${oasisToken}`);

        fetch(oasisUrl, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    const materialCell = tds[6].querySelector("textarea");
                    let materials = "";
                    data.forEach((material, index) => {
                        materials += material.MALZEME_STOK_NO;
                        if (index < data.length - 1) {
                            materials += ", ";
                        }
                    })
                    materialCell.value = materials;
                    autoGrowTextarea();
                }
            })
            .catch((error) => {
                console.error("Hata oluştu:", error);
            });
    })
}

function autoGrowTextarea() {
    const tx = document.getElementsByTagName("textarea");
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);
    }

    function OnInput() {
        this.style.height = 0;
        this.style.height = (this.scrollHeight) + "px";
        if (this.value.length > 0) {
            this.classList.remove("print-hidden");
        } else {
            this.classList.add("print-hidden");
        }
    }
}


function createTotalCashFromAllTechniciansTable(cashTotalAmount) {
    const table = document.createElement("table");
    table.id = "totalCash";
    table.classList.add("print-hidden");
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    const th = document.createElement("th");
    th.textContent = "Toplam Nakit Gelir";
    th.setAttribute("colspan", "2");
    tbody.appendChild(th);

    const namesArray = getNamesFromLocalStorage();
    const currentDate = new Date().toLocaleDateString();
    let dailyCashData = JSON.parse(localStorage.getItem('dailyCash')) || {};

    // Eğer "dailyCash" anahtarı yoksa veya tarih güncel değilse
    if (!dailyCashData.date || dailyCashData.date !== currentDate) {

        // Tarihi güncelle ve isimleri kontrol ederek ekle veya çıkar
        dailyCashData.date = currentDate;
        namesArray.forEach(name => {
            dailyCashData[name] = 0;
        });
    } else {
        namesArray.forEach(name => {
            if (!(name in dailyCashData) && name !== ' ') {
                // "name" anahtarı "dailyCash" içinde yoksa, ekleyin
                dailyCashData[name] = 0.00;
            }
        });
    }


    // Nakit miktarını güncelle
    const currentTechnicianDropdown = document.querySelector(".current-technician");
    const currentTechnician = currentTechnicianDropdown.value;
    dailyCashData[currentTechnician] = cashTotalAmount;


    // Eksik isimleri kontrol ederek çıkar
    for (const key in dailyCashData) {
        if ((key !== "date" && !namesArray.includes(key)) || key === ' ') {
            delete dailyCashData[key];
        }
    }


    for (const key in dailyCashData) {
        if (key !== "date") {
            const row = document.createElement("tr");
            tbody.appendChild(row);

            const nameCell = document.createElement("td");
            nameCell.textContent = key;
            row.appendChild(nameCell);

            const valueCell = document.createElement("td");
            valueCell.textContent = dailyCashData[key].toFixed(2);
            row.appendChild(valueCell);
        }
    }

    // Genel toplam eklemesi
    const totalRow = document.createElement("tr");
    const totalNameCell = document.createElement("td");
    totalNameCell.textContent = "Genel Toplam";
    totalRow.appendChild(totalNameCell);

    const totalValueCell = document.createElement("td");
    const totalAmount = calculateTotalCash(dailyCashData);
    totalValueCell.textContent = totalAmount;
    totalRow.appendChild(totalValueCell);

    tbody.appendChild(totalRow);


    localStorage.setItem('dailyCash', JSON.stringify(dailyCashData));

    right.innerHTML = "";
    right.appendChild(table);
}

function calculateTotalCash(dailyCashData) {
    let total = 0;
    for (const key in dailyCashData) {
        if (key !== "date") {
            total += parseFloat(dailyCashData[key]);
        }
    }
    return total.toFixed(2);
}