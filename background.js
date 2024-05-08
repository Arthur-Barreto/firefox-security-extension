console.log('Script de fundo carregado');

let connectionsByTab = {};
let suspiciousServicesByTab = {};
let cookieDetailsByTab = {};

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
            //console.log('Requisição para domínio de terceira parte:', details.url);
        }

        let url = new URL(details.url);
        let port = url.port || (url.protocol === 'https:' ? '443' : '80'); // Default ports for http and https

        //console.log('Verificando porta:', port);

        // Check if the port is non-standard (not 80 or 443)
        if (port !== '80' && port !== '443') {
            let service = servicePorts[port] || `Unknown service on port ${port}`;
            let serviceInfo = `${service} at ${url.hostname}:${port}`;
            if (!suspiciousServicesByTab[details.tabId]) {
                suspiciousServicesByTab[details.tabId] = {};
            }
            suspiciousServicesByTab[details.tabId][serviceInfo] = (suspiciousServicesByTab[details.tabId][serviceInfo] || 0) + 1;
            alert(`Serviço suspeito detectado: ${serviceInfo}`);
            //console.log('Serviço suspeito detectado:', serviceInfo);
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Listener para capturar cookies na resposta
browser.webRequest.onHeadersReceived.addListener(
    function (details) {
        if (details.tabId !== -1) {
            const url = new URL(details.url);
            const isThirdParty = details.initiator && !details.initiator.endsWith(url.hostname);
            const cookieType = isThirdParty ? 'thirdParty' : 'firstParty';
            const cookieDetailType = isThirdParty ? 'thirdPartyDetails' : 'firstPartyDetails';

            if (!cookieDetailsByTab[details.tabId]) {
                cookieDetailsByTab[details.tabId] = {
                    firstParty: 0,
                    thirdParty: 0,
                    firstPartyDetails: {},
                    thirdPartyDetails: {}
                };
            }

            details.responseHeaders.forEach(header => {
                if (header.name.toLowerCase() === 'set-cookie') {
                    let cookieName = header.value.split('=')[0].trim();
                    cookieDetailsByTab[details.tabId][cookieType]++;
                    if (cookieDetailsByTab[details.tabId][cookieDetailType][cookieName]) {
                        cookieDetailsByTab[details.tabId][cookieDetailType][cookieName]++;
                    } else {
                        cookieDetailsByTab[details.tabId][cookieDetailType][cookieName] = 1;
                    }
                }
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
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
    } else if (request.action === "get_cookies") {
        let tabId = request.tabId;
        let cookies = cookieDetailsByTab[tabId] || { firstParty: 0, thirdParty: 0, firstPartyDetails: {}, thirdPartyDetails: {} };
        sendResponse({ cookies: cookies });
        console.log(`Sending cookie data for tab ${tabId}:`, cookies);
    }
    return true; // Indica que a resposta pode ser assíncrona
});


// Limpa as conexões ao fechar a aba
browser.tabs.onRemoved.addListener(function (tabId) {
    delete connectionsByTab[tabId];
    delete suspiciousServicesByTab[tabId];
    delete cookieDetailsByTab[tabId];
    console.log(`Cookie data cleared for tab ${tabId}`);

});

// Limpa as conexões quando uma aba é atualizada
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
        connectionsByTab[tabId] = {};
        suspiciousServicesByTab[tabId] = {};
    }
});

// Função para enviar detalhes dos cookies para o popup ou onde for necessário
function getCookiesDetails(tabId) {
    let details = cookieDetailsByTab[tabId];
    if (details) {
        return { firstPartyDetails: details.firstParty, thirdPartyDetails: details.thirdParty };
    }
    return { firstPartyDetails: {}, thirdPartyDetails: {} };
}
