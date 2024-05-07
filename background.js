console.log('Script de fundo carregado');

let connectionsByTab = {};
let suspiciousServicesByTab = {};

// Dicionário para identificação de serviços com base na porta
const servicePorts = {
    "21": "FTP",
    "22": "SSH",
    "23": "Telnet",
    "25": "SMTP",
    "53": "DNS",
    "110": "POP3",
    "143": "IMAP",
    "3306": "MySQL",
    "3389": "RDP",
    "5900": "VNC",
    "8080": "HTTP Alternative",
    "8443": "HTTPS Alternative"
};

// Listener para requisições web
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.tabId !== -1 && details.originUrl && new URL(details.url).hostname !== new URL(details.originUrl).hostname) {
            if (!connectionsByTab[details.tabId]) {
                connectionsByTab[details.tabId] = {};
            }
            connectionsByTab[details.tabId][details.url] = (connectionsByTab[details.tabId][details.url] || 0) + 1;
            console.log('Requisição para domínio de terceira parte:', details.url);
        }

        let url = new URL(details.url);
        let port = url.port || (url.protocol === 'https:' ? '443' : '80'); // Default ports for http and https

        console.log('Verificando porta:', port);

        // Check if the port is non-standard (not 80 or 443)
        if (port !== '80' && port !== '443') {
            let service = servicePorts[port] || `Unknown service on port ${port}`;
            let serviceInfo = `${service} at ${url.hostname}:${port}`;
            if (!suspiciousServicesByTab[details.tabId]) {
                suspiciousServicesByTab[details.tabId] = {};
            }
            suspiciousServicesByTab[details.tabId][serviceInfo] = (suspiciousServicesByTab[details.tabId][serviceInfo] || 0) + 1;
            console.log('Serviço suspeito detectado:', serviceInfo);
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "get_connections") {
        let tabId = request.tabId;
        let connections = connectionsByTab[tabId] ? connectionsByTab[tabId] : {};
        sendResponse({ connections: connections });
    } else if (request.action === "get_suspicious_services") {
        let tabId = request.tabId;
        let services = suspiciousServicesByTab[tabId] ? suspiciousServicesByTab[tabId] : {};
        sendResponse({ services: services });
    }
    return true;
});

// Limpa as conexões ao fechar a aba
browser.tabs.onRemoved.addListener(function (tabId) {
    delete connectionsByTab[tabId];
    delete suspiciousServicesByTab[tabId];
});

// Limpa as conexões quando uma aba é atualizada
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
        connectionsByTab[tabId] = {};
        suspiciousServicesByTab[tabId] = {};
    }
});
