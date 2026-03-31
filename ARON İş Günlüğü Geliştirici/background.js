chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveTableData') {
    chrome.storage.local.set({ tableData: message.data }, () => {
      console.log('[ARON] storage\'a kaydedildi');
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'getTableData') {
    chrome.storage.local.get(['tableData'], (result) => {
      sendResponse({ data: result.tableData || [] });
    });
    return true;
  }

  if (message.action === "migrateData") {
    const data = message.data;
    const storageData = {};

    if (data.names) storageData.names = data.names;
    if (data.plates) storageData.plates = data.plates;
    if (data.dailyCash) storageData.dailyCash = data.dailyCash;

    chrome.storage.local.set(storageData, () => {
      console.log("[ARON] Migration done (from file://)");
      sendResponse({ success: true });
    });
    return true;
  }
});

// İçerik betiği ve arka plan betiği arasında kullanılacak bir port oluştur
let contentPort = null;

// Extension icon tıklandığında çalışan fonksiyon
chrome.action.onClicked.addListener((tab) => {
  // aron.arcelik.com veya export*.html dosyalarında çalışsın
  if (tab.url && (tab.url.includes('aron.arcelik.com') || /export.*\.html$/.test(tab.url))) {
    // Content script'e runExtraction mesajı gönder
    chrome.tabs.sendMessage(tab.id, { action: 'runExtraction' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[ARON] Mesaj gönderme hatası:', chrome.runtime.lastError);
      } else if (response && response.success) {
        console.log('[ARON] Extraction tamamlandı, editor açılıyor');
        // Extraction tamamlandıktan sonra editor.html aç
        chrome.tabs.create({
          url: chrome.runtime.getURL('editor.html')
        });
      }
    });
  }
});

// İçerik betiği ve arka plan betiği arasında kullanılacak bir port oluştur
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "oasis-get-token") {
    contentPort = port;
    contentPort.onDisconnect.addListener(() => {
      contentPort = null;
    });

    // İçerik betiği ile veri alışverişi yapmak için bu portu kullan
    contentPort.onMessage.addListener((message) => {
      if (message.action === "getTokenFromOasis") {
        getTokenFromOasis(function (token) {
          contentPort.postMessage({ token: token });
        });
      }
    });
  }
});


// Oasis sisteminin local storage'ındaki 'token' bilgisini almak için bir fonksiyon
async function getTokenFromOasis(callback) {
  await chrome.tabs.query({ url: 'https://oasis.arcelik.com/*' }, function (tabs) {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      // Oasis sayfasıyla iletişim kurup 'token' bilgisini al
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
          try {
            const token = localStorage.getItem('token');
            return token;
          } catch (error) {
            return null; // Hata oluştuğunda null döndür
          }
        }
      }, (result) => {
        if (chrome.runtime.lastError) {
          callback(null); // Hata durumunda null döndür
        } else {
          const tokenFromOasis = result[0].result;
          callback(tokenFromOasis);
        }
      });
    } else {
      callback(null); // Oasis sayfası açık değilse veya hata durumunda null döndür
    }
  });
}