// İçerik betiği ve arka plan betiği arasında kullanılacak bir port oluştur
let contentPort = null;

// İçerik betiği ile port aracılığıyla iletişim kurmak için bir dinleyici ekle
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
  // chrome.tabs.query({ url: 'https://oasis.arcelik.com/*' }, function (tabs) {
  await chrome.tabs.query({ url: 'https://chat.openai.com/*' }, function (tabs) {
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