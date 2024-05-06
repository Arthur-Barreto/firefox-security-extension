console.log('Script de fundo carregado');

let connectionsByTab = {};

// Listener para requisições web
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.tabId !== -1 && details.originUrl && new URL(details.url).hostname !== new URL(details.originUrl).hostname) {
            if (!connectionsByTab[details.tabId]) {
                connectionsByTab[details.tabId] = {};
            }
            // Incrementa o contador para a URL, ou inicializa com 1 se ainda não existe
            connectionsByTab[details.tabId][details.url] = (connectionsByTab[details.tabId][details.url] || 0) + 1;
            console.log('Requisição para domínio de terceira parte:', details.url);
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "get_connections") {
        let tabId = request.tabId; // Obtenha o ID da aba a partir da mensagem do popup
        let connections = connectionsByTab[tabId] ? connectionsByTab[tabId] : {};
        console.log("Enviando conexões de terceira parte para o popup:", connections);
        sendResponse({ connections: connections });
        return true; // Indica que a resposta pode ser assíncrona
    }
});

// Limpa as conexões ao fechar a aba
browser.tabs.onRemoved.addListener(function (tabId) {
    delete connectionsByTab[tabId];
});

// Limpa as conexões quando uma aba é atualizada
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {  // Somente limpar quando a aba começa a carregar
        connectionsByTab[tabId] = {};
    }
});
