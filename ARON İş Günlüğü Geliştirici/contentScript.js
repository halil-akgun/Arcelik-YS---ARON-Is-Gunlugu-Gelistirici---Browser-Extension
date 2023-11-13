const editButton = document.createElement("button");
const body = document.querySelector("body");
let table = document.querySelector("table");
let rows = table?.querySelectorAll("tr");
let printPermission = false;
let oasisToken;
let container = null;
let left = null;
let right = null;
const rightTop = document.createElement("div");
const rightBottom = document.createElement("div");
let isEmptyPriceColumn = true;

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
        const checkedPlate = formatPlateNumber(newPlate.trim());
        if (checkedPlate) {
            plates.push(checkedPlate);
            createDropdown(plateDropdown, plates);
            savePlatesToLocalStorage(plates);
        } else {
            alert("Girdiğiniz plakayı kontrol ediniz.");
        }
    });

    plateDropdownMinus.addEventListener("click", () => {
        const plate = prompt("Silmek istediğiniz plakayı girin:");
        const checkedPlate = formatPlateNumber(plate.trim());
        if (checkedPlate) {
            deletePlateFromDropdownAndLocalStorage(plateDropdown, plates, checkedPlate);
        }
        plates = getPlatesFromLocalStorage();
    });

    date.textContent = "Tarih: ";
    technician.textContent = "Teknisyen: ";
    fuel.textContent = "Yakıt: ";
    vehicle.textContent = "Araç: ";
    nameDropdownPlus.textContent = "➕";
    nameDropdownPlus.classList.add("plus");
    nameDropdownMinus.textContent = "➖";
    nameDropdownMinus.classList.add("minus");
    plateDropdownPlus.textContent = "➕";
    plateDropdownPlus.classList.add("plus");
    plateDropdownMinus.textContent = "➖";
    plateDropdownMinus.classList.add("minus");

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.id = "date-input";
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
    table.id = "data-table";


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
            newTds.push(document.createElement("td")); // sil butonu icin
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
    rows[0].querySelectorAll("td")[1].textContent = "#";
    rows[0].querySelectorAll("td")[2].textContent = "Müşteri";
    rows[0].querySelectorAll("td")[3].textContent = "Mahalle";
    rows[0].querySelectorAll("td")[4].textContent = "Saat";
    rows[0].querySelectorAll("td")[5].textContent = "Başvuru Nedeni";
    rows[0].querySelectorAll("td")[6].textContent = "Fiş Durumu";
    rows[0].querySelectorAll("td")[7].textContent = "Malzeme";
    rows[0].querySelectorAll("td")[8].textContent = "Fiş No";
    rows[0].querySelectorAll("td")[9].textContent = "Açıklama";
    rows[0].querySelectorAll("td")[10].textContent = "Ücret";
    rows[0].querySelectorAll("td")[11].textContent = "";


    // Input ve sil butonu ekle
    const dataRows = [...rows].slice(1); // İlk satır (başlık satırı) dışındaki tüm satırları seç

    dataRows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length >= 12) {
            const eightthCell = tds[7];
            const ninthCell = tds[9];
            const eleventhCell = tds[10];
            const twelfthCell = tds[11];

            // 8. hücreye input ekle
            createInputCell(eightthCell);

            // 10. hücreye input ekle
            createInputCell(ninthCell);

            // 11. hücreye input ekle
            const eleventhInput = document.createElement("input");
            eleventhInput.type = "number";

            eleventhCell.appendChild(eleventhInput);

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
            twelfthCell.appendChild(paymentMethodSelect);

            // 1. hücreye sil butonu ekle
            addDeleteButton(tds[0], row);
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
    totalCashCellAmount.id = "totalCashCellAmount";
    totalCashCell.textContent = "Nakit Toplam:";
    const cashTotalAmount = calculateTotalAmount('N', 'income')[0];
    totalCashCellAmount.textContent = cashTotalAmount.toFixed(2);
    totalCashRow.appendChild(totalCashCell);
    totalCashRow.appendChild(totalCashCellAmount);
    totalTable.appendChild(totalCashRow);

    // Gider toplamı hesapla ve ekle
    const totalExpenseRow = document.createElement("tr");
    const totalExpenseCell = document.createElement("td");
    const totalExpenseCellAmount = document.createElement("td");
    totalExpenseCellAmount.id = "totalExpenseCellAmount";
    totalExpenseCell.textContent = "Gider Toplam:";
    const expenseTotalAmount = calculateTotalAmount('N', 'expense')[0];
    totalExpenseCellAmount.textContent = expenseTotalAmount.toFixed(2);
    totalExpenseRow.appendChild(totalExpenseCell);
    totalExpenseRow.appendChild(totalExpenseCellAmount);
    totalTable.appendChild(totalExpenseRow);

    // Kredi kartı toplamı hesapla ve ekle
    const totalCreditRow = document.createElement("tr");
    const totalCreditCell = document.createElement("td");
    const totalCreditCellAmount = document.createElement("td");
    totalCreditCellAmount.id = "totalCreditCellAmount";
    totalCreditCell.textContent = "K.K. Toplam:";
    const creditTotalAmount = calculateTotalAmount('K')[0];
    totalCreditCellAmount.textContent = creditTotalAmount.toFixed(2);
    totalCreditRow.appendChild(totalCreditCell);
    totalCreditRow.appendChild(totalCreditCellAmount);
    totalTable.appendChild(totalCreditRow);

    // Havale toplamı hesapla ve ekle
    const totalRemittanceRow = document.createElement("tr");
    const totalRemittanceCell = document.createElement("td");
    const totalRemittanceCellAmount = document.createElement("td");
    totalRemittanceCellAmount.id = "totalRemittanceCellAmount";
    totalRemittanceCell.textContent = "Havale Toplam:";
    const remittanceTotalAmount = calculateTotalAmount('H')[0];
    totalRemittanceCellAmount.textContent = remittanceTotalAmount.toFixed(2);
    totalRemittanceRow.appendChild(totalRemittanceCell);
    totalRemittanceRow.appendChild(totalRemittanceCellAmount);
    totalTable.appendChild(totalRemittanceRow);

    // Genel toplamı ekle
    const totalAmountRow = document.createElement("tr");
    const totalAmountCell = document.createElement("td");
    const totalAmountCellAmount = document.createElement("td");
    totalAmountCell.textContent = "Genel Toplam:";
    const totalAmount = calculateTotalAmount()[0];
    totalAmountCellAmount.textContent = totalAmount.toFixed(2);
    totalAmountRow.appendChild(totalAmountCell);
    totalAmountRow.appendChild(totalAmountCellAmount);
    totalTable.appendChild(totalAmountRow);

    // Bakiye toplamı hesapla ve ekle
    const balanceDiv = document.createElement("div");
    const balanceTable = document.createElement("table");
    balanceTable.id = "balance";
    const balanceRow = document.createElement("tr");
    const balanceCell = document.createElement("td");
    const balanceCellAmount = document.createElement("td");
    balanceCell.textContent = "Bakiye:";
    balanceRow.appendChild(balanceCell);
    balanceRow.appendChild(balanceCellAmount);
    balanceTable.appendChild(balanceRow);
    balanceDiv.appendChild(balanceTable);

    const div = document.createElement("div");
    div.appendChild(totalTable);
    div.appendChild(balanceDiv);

    totalDiv.appendChild(div);
    left.appendChild(totalDiv);

    addEventListenerForTotalAmount();

    // Ücret inputlarını seç
    const tenthCellInputs = document.querySelectorAll("td:nth-child(11) input");
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


    // Kullanıcıya yazdırma izni yoksa yazdırma işlemi iptal edilir.
    window.addEventListener('beforeprint', function (event) {
        if (!printPermission) {
            let answer = this.confirm("!!! Veriler kaydedilmedi. Devam etmek istiyor musunuz?");
            if (!answer) {
                this.document.getElementsByTagName("body")[0].classList.add("print-hidden");
            } else {
                this.document.getElementsByTagName("body")[0].classList.remove("print-hidden");
            }
        }
    });


    // Kaydet-Yazdır butonu ekle
    const saveButton = document.createElement("button");
    saveButton.id = "saveButton";
    const text = document.createElement("span");
    text.textContent = "Kaydet ve Yazdır";
    saveButton.appendChild(text);
    saveButton.classList.add("print-hidden");
    saveButton.addEventListener("click", saveAndPrint);
    rightTop.appendChild(saveButton);
    right.appendChild(rightTop);

    updateTotalAmount(); // ilk açılışta genel toplamı 0 iken "0'larin" gözükmemesi için

    document.body.removeChild(editButton);

    autoGrowTextarea();

    fillDescriptionWithNakliyeMontaj();
    fillMaterialColumn();
    createTotalCashFromAllTechniciansTable();
}

function addEventListenerForTotalAmount() {
    // 10. ve 11. hücrelerdeki inputları seç
    const tenthCellInputs = document.querySelectorAll("td:nth-child(11) input");
    const eleventhCellSelects = document.querySelectorAll("td:nth-child(12) select");

    // 10. ve 11. hücrelerdeki inputlara event listener ekle
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
    const lastIndex = +cells[1].textContent;

    cells.forEach((cell, index) => {
        if (index !== 0 && index !== 1 && index !== 10 && index !== 11) {
            cell.textContent = "";
            createInputCell(cell)
        } else if (index === 10) {
            const input = cell.querySelector('input');
            input.value = "";
            input.addEventListener("blur", () => formatNumber(input));
        }
    });

    cells[1].textContent = lastIndex + 2;
    cells[0].textContent = "";
    addDeleteButton(cells[0], newRow);

    tbody.appendChild(newRow);

    table = document.querySelector("table");
    rows = table.querySelectorAll("tr");

    autoGrowTextarea();
    addEventListenerForTotalAmount();
}

function calculateTotalAmount(paymentType, type) {
    isEmptyPriceColumn = true;
    let totalIncome = 0;
    let totalExpense = 0;
    rows.forEach((row) => {
        const inputs = row.querySelectorAll("td:nth-child(11) input[type='number']");
        const select = row.querySelector("td:nth-child(12) select");

        if (select && inputs.length > 0 && select.value === paymentType) {
            const inputValue = parseFloat(inputs[0].value);
            if (!isNaN(inputValue)) {
                if (type === 'expense' && inputValue < 0) {
                    totalExpense += inputValue;
                } else if (type === 'income' && inputValue > 0) {
                    totalIncome += inputValue;
                } else if (type !== 'expense' && type !== 'income') {
                    totalIncome += inputValue;
                }
                isEmptyPriceColumn = false;
            }
        }
    });
    if (type === 'expense') {
        return [totalExpense, isEmptyPriceColumn];
    } else {
        return [totalIncome, isEmptyPriceColumn];
    }
}

// Toplam tutarı güncelleyen fonksiyon
function updateTotalAmount() {
    const cashTotalAmount = calculateTotalAmount('N', 'income');
    const expenseTotalAmount = calculateTotalAmount('N', 'expense');
    const creditTotalAmount = calculateTotalAmount('K');
    const remittanceTotalAmount = calculateTotalAmount('H');
    isEmptyPriceColumn = cashTotalAmount[1] && expenseTotalAmount[1] && creditTotalAmount[1] && remittanceTotalAmount[1];

    const totalTable = document.querySelector("#totalDiv>div>table");
    const totalCells = totalTable.querySelectorAll("td");

    totalCells.forEach((cell, index) => {
        if (index === 1) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn ? cashTotalAmount[0].toFixed(2) + " ₺" : "";
        } else if (index === 3) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn ? expenseTotalAmount[0].toFixed(2) + " ₺" : "";
        } else if (index === 5) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn ? creditTotalAmount[0].toFixed(2) + " ₺" : "";
        } else if (index === 7) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn ? remittanceTotalAmount[0].toFixed(2) + " ₺" : "";
        } else if (index === 9) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn
                ? (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]).toFixed(2) + " ₺" : "";
        } else if (index === 13) {
            cell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn
                ? (cashTotalAmount[0] + expenseTotalAmount[0]).toFixed(2) + " ₺" : "";
        }
    });

    const balanceCell = document.querySelector("#balance td:nth-child(2)");
    balanceCell.textContent = (cashTotalAmount[0] + expenseTotalAmount[0] + creditTotalAmount[0] + remittanceTotalAmount[0]) || !isEmptyPriceColumn ? (cashTotalAmount[0] + expenseTotalAmount[0]).toFixed(2) + " ₺" : "";

    if (!isEmptyPriceColumn) {
        createTotalCashFromAllTechniciansTable(cashTotalAmount[0] + expenseTotalAmount[0]);
    }
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
    const platesJSON = localStorage.getItem("plates6091");

    if (platesJSON) {
        const platesArray = JSON.parse(platesJSON);
        const formattedPlates = platesArray.map((plate) => plate !== ' ' ? formatPlateNumber(plate) : plate);
        savePlatesToLocalStorage(formattedPlates);
        return formattedPlates;
    } else {
        return [" "];
    }
}

function savePlatesToLocalStorage(plates) {
    localStorage.setItem("plates6091", JSON.stringify(plates));
}

function createDropdown(dropdown, values) {
    values.sort((a, b) => a.localeCompare(b, 'tr')); // İsimleri sırala
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
        if (tds.length >= 8) {
            const reason = tds[5].textContent.trim();
            const descriptionCell = tds[9].querySelector("textarea");

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
        const receiptNo = tds[8].textContent.trim();
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
                    const materialCell = tds[7].querySelector("textarea");
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

function createTotalCashFromAllTechniciansTable(cashTotalAmount, isOffice) {

    // Tarih kontrolu
    const today = new Date().toISOString().slice(0, 10);
    const selectedDate = document.getElementById("date-input").value;
    if (selectedDate !== today) {
        console.log(selectedDate);
        console.log(today);
        return;
    }

    const table = document.createElement("table");
    table.id = "totalCash";
    table.classList.add("print-hidden");
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    const th = document.createElement("th");
    th.textContent = "Toplam Nakit Gelir (bugün)";
    th.setAttribute("colspan", "2");
    tbody.appendChild(th);

    const namesArray = getNamesFromLocalStorage();
    let dailyCashData = JSON.parse(localStorage.getItem('dailyCash')) || {};

    // Eğer "dailyCash" anahtarı yoksa veya tarih güncel değilse
    if (!dailyCashData.date || dailyCashData.date !== today) {

        // Tarihi güncelle ve isimleri kontrol ederek ekle veya çıkar
        dailyCashData.date = today;
        dailyCashData.office = null;
        namesArray.forEach(name => {
            dailyCashData[name] = null;
        });
    } else {
        namesArray.forEach(name => {
            if (!(name in dailyCashData) && name !== ' ') {
                // "name" anahtarı "dailyCash" içinde yoksa, ekleyin
                dailyCashData[name] = null;
            }
        });
        if (!('office' in dailyCashData)) {
            dailyCashData['office'] = null;
        }
    }

    // Nakit miktarını güncelle
    const currentTechnicianDropdown = document.querySelector(".current-technician");
    const currentTechnician = currentTechnicianDropdown.value;
    if (isOffice) {
        dailyCashData['office'] = cashTotalAmount;
    } else {
        dailyCashData[currentTechnician] = cashTotalAmount;
    }

    // Listede olmayan isimleri kontrol ederek çıkar
    for (const key in dailyCashData) {
        if ((key !== "date" && key !== "office" && !namesArray.includes(key)) || key === ' ') {
            delete dailyCashData[key];
        }
    }

    // Büro satırı eklemesi
    const officeRow = document.createElement("tr");
    tbody.appendChild(officeRow);

    const officeCell = document.createElement("td");
    officeCell.textContent = "Büro";
    officeRow.appendChild(officeCell);

    const officeAmountCell = document.createElement("td");
    officeAmountCell.id = "officeAmount";
    const input = document.createElement("input");
    input.type = "number";
    const value = dailyCashData['office'];
    input.value = value === null ? "" : value.toFixed(2);
    officeAmountCell.appendChild(input);
    officeRow.appendChild(officeAmountCell);

    // Input'a event listener ekle
    input.addEventListener('blur', function (event) {
        createTotalCashFromAllTechniciansTable(+event.target.value, true);
    });

    // dailyCashData'nın keylerini bir diziye çıkart ve Türkçe karakterlere göre sırala
    const keys = Object.keys(dailyCashData).sort((a, b) => a.localeCompare(b, 'tr'));

    // Teknisyenlerin eklenmesi
    for (const key of keys) {
        if (key !== "date" && key !== "office") {
            const row = document.createElement("tr");
            tbody.appendChild(row);

            const nameCell = document.createElement("td");
            nameCell.textContent = key;
            row.appendChild(nameCell);

            const valueCell = document.createElement("td");
            const value = dailyCashData[key];
            valueCell.textContent = value === null ? '' : value.toFixed(2);
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
    totalValueCell.textContent = +totalAmount === 0 && isEmptyPriceColumn ? "" : totalAmount;
    totalRow.appendChild(totalValueCell);

    tbody.appendChild(totalRow);


    localStorage.setItem('dailyCash', JSON.stringify(dailyCashData));

    rightBottom.innerHTML = "";
    rightBottom.appendChild(table);
    right.appendChild(rightBottom);
}

function calculateTotalCash(dailyCashData) {
    let total = 0;
    for (const key in dailyCashData) {
        if (key !== "date" && dailyCashData[key] !== null) {
            total += parseFloat(dailyCashData[key]);
        }
    }
    return total.toFixed(2);
}

async function saveAndPrint() {

    const date = document.querySelector("#date-input").value;
    const name = document.querySelector(".current-technician").value;
    const totalExpenseCellAmount = document.querySelector("#totalExpenseCellAmount").textContent;
    const totalCashCellAmount = document.querySelector("#totalCashCellAmount").textContent;
    const totalCreditCellAmount = document.querySelector("#totalCreditCellAmount").textContent;
    const totalRemittanceCellAmount = document.querySelector("#totalRemittanceCellAmount").textContent;

    const data = {
        tarih: date,
        isim: name,
        gider: parseFloat(totalExpenseCellAmount) * -1,
        nakit_gelir: parseFloat(totalCashCellAmount),
        kart_gelir: parseFloat(totalCreditCellAmount),
        havale_gelir: parseFloat(totalRemittanceCellAmount)
    };

    if (name === " ") {
        window.alert("Lütfen teknisyen seçin.");
        return;
    }

    try {
        const isSaved = await updateDatabase(data);
        if (isSaved) {
            printPermission = true;
            window.print();
        }
    } catch (error) {
        console.log(error);
        window.alert("Hata: Veri kaydedilemedi. Lütfen tekrar deneyin.");
    }
}

async function updateDatabase(data) {
    const pickerOpts = {
        types: [
            {
                description: "Hesap Verileri.json",
                accept: {
                    "application/json": [".json"],
                },
            },
        ],
        startIn: "documents",
        excludeAcceptAllOption: true,
        multiple: false,
    };

    let database = null;
    let fileHandle = null;
    let fileContents = null;
    let file = null;

    async function getTheFile() {
        try {
            fileHandle = await window.showOpenFilePicker(pickerOpts);
        } catch (error) {
            console.log(error);
            window.alert("Dosya seçilmedi. Lütfen dosya seçin.");
            return false;
        }
        file = await fileHandle[0].getFile();
        fileContents = await file.text();
        if (fileContents.length !== 0) {
            database = JSON.parse(fileContents);
        }
    }

    await getTheFile();

    if (!fileHandle || !fileHandle[0]) {
        return false;
    } else if (fileHandle[0].name !== "Hesap Verileri.json") {
        window.alert("Yalnızca 'Hesap Verileri.json' dosyasını seçebilirsiniz.");
        return false;
    }


    // Dosya içeriğini JSON'a çevir
    let existingDataArray = [];
    if (database) {
        existingDataArray = JSON.parse(JSON.stringify(database));
    }

    for (const existingData of existingDataArray) {
        if (existingData.tarih === data.tarih && existingData.isim === data.isim) {
            // Eğer aynı tarih ve isim ile kayıt bulunursa, mevcut kaydı güncelle
            Object.assign(existingData, data);
            await writeFile(fileHandle[0], JSON.stringify(existingDataArray));
            return true;
        }
    }

    // Eğer aynı tarih ve isim ile kayıt bulunamazsa, yeni kaydı ekle
    existingDataArray.push(data);
    await writeFile(fileHandle[0], JSON.stringify(existingDataArray));

    return true;
}

async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}

function updateRowNumbers() {
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        cells[1].textContent = i;
    }
}

function addDeleteButton(td, row) {
    const deleteButtonSpan = document.createElement("span");
    deleteButtonSpan.textContent = "⛔";
    deleteButtonSpan.classList.add("delete-button");
    deleteButtonSpan.classList.add("print-hidden");
    deleteButtonSpan.title = "Satırı Sil";
    td.appendChild(deleteButtonSpan);
    deleteButtonSpan.addEventListener("click", () => {
        let rowNumber = row.rowIndex;
        let control = window.confirm(rowNumber + ". satırı silmek istediğinizden emin misiniz?");
        if (control) {
            row.remove();
            rows = document.querySelectorAll("#data-table tbody tr");
            updateRowNumbers();
            updateTotalAmount();
        }
    });
}

function formatPlateNumber(plate) {
    const regex = /^(\d{1,2})\s*([A-Za-z]{1,3})\s*(\d{2,5})$/;
    const match = plate.match(regex);
    if (!match) {
        return null;
    }
    const [, firstPart, secondPart, thirdPart] = match;
    const formattedFirstPart = firstPart.padStart(2, '0');
    const formattedSecondPart = secondPart.toUpperCase();
    return `${formattedFirstPart} ${formattedSecondPart} ${thirdPart}`;
}
