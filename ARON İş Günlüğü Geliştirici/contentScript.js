// yardımcı
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// göz ikonlarını aç
function revealNames() {
    document.querySelectorAll("path").forEach(p => {
        const d = p.getAttribute("d") || "";
        if (d.startsWith("M12 4.5C7 4.5")) {
            p.closest("span, button, div, a")?.click();
        }
    });
}

// MUI tabloyu parse et
function extractMuiTableData() {
    const rows = document.querySelectorAll("tbody tr");
    const data = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");

        if (cells.length < 10) return;

        data.push({
            fisNo: cells[1]?.innerText.trim(),
            musteri: cells[2]?.innerText.trim(),
            neden: cells[4]?.innerText.trim(),
            fisDurumu: cells[5]?.innerText.trim(),
            mahalle: cells[8]?.innerText.trim(),
            adres: cells[9]?.innerText.trim(),
            not: cells[10]?.innerText.trim(),
            saat: cells[11]?.innerText.trim().split(" ").pop()
        });
    });

    // Verileri sırala: zaman sırası, aynı saat ise isim sırası
    data.sort((a, b) => {
        if (a.saat < b.saat) return -1;
        if (a.saat > b.saat) return 1;
        return a.musteri.localeCompare(b.musteri);
    });

    return data;
}

// eski tablo varsa
function extractTableData() {
    const rows = document.querySelectorAll("table tr");
    const data = [];

    rows.forEach((row, index) => {
        if (index === 0) return;

        const cells = row.querySelectorAll("td");

        data.push({
            fisDurumu: cells[1]?.innerText.trim(),
            saat: cells[2]?.innerText.trim(),
            fisNo: cells[3]?.innerText.trim(),
            neden: cells[4]?.innerText.trim(),
            not: cells[5]?.innerText.trim(),
            adres: cells[6]?.innerText.trim(),
            mahalle: cells[7]?.innerText.trim(),
            musteri: cells[8]?.innerText.trim()
        });
    });

    return data;
}


// MAIN
async function run() {
    console.log("[ARON] contentScript başladı");

    const muiTable = document.querySelector('.MuiTable-root');

    let data = [];

    if (muiTable) {
        // MUI tablo
        revealNames();
        await wait(1000); // İsimlerin görünür hale gelmesi için bekle
        data = extractMuiTableData();
    } else {
        // eski sistem
        await wait(1000);
        data = extractTableData();
    }

    console.log("[ARON] gönderilen data:", data);

    chrome.runtime.sendMessage({
        action: 'saveTableData',
        data: data
    });
}

// Mesaj dinleyicisi ekle
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'runExtraction') {
        await run();
        sendResponse({ success: true });
    }
});