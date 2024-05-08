document.addEventListener('DOMContentLoaded', function () {
    const connectionsCountDiv = document.getElementById('connectionsCount');
    const toggleConnectionsButton = document.getElementById('toggleConnectionsButton');
    const connectionsDropdown = document.getElementById('connectionsDropdown');
    const connectionsResults = document.getElementById('connectionsResults');

    const servicesCountDiv = document.getElementById('servicesCount');
    const toggleServicesButton = document.getElementById('toggleServicesButton');
    const servicesDropdown = document.getElementById('servicesDropdown');
    const servicesResults = document.getElementById('servicesResults');

    const cookiesCountDiv = document.getElementById('cookiesCount');
    const toggleCookiesButton = document.getElementById('toggleCookiesButton');
    const cookiesDropdown = document.getElementById('cookiesDropdown');
    const cookiesResults = document.getElementById('cookiesResults');

    const cookiesCountDiv3 = document.getElementById('cookiesCount3');
    const toggleCookiesButton3 = document.getElementById('toggleCookiesButton3');
    const cookiesDropdown3 = document.getElementById('cookiesDropdown3');
    const cookiesResults3 = document.getElementById('cookiesResults3');

    // Obter o ID da aba atual
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabId = tabs[0].id;
        requestConnections(currentTabId);
        requestServices(currentTabId);
        requestCookies(currentTabId);
    });

    function requestConnections(tabId) {
        browser.runtime.sendMessage({ action: "get_connections", tabId: tabId }, function (response) {
            if (response && response.connections && Object.keys(response.connections).length > 0) {
                connectionsCountDiv.textContent = `Total de conexões de terceira parte: ${Object.keys(response.connections).length}`;
                toggleConnectionsButton.style.display = 'block';
                populateList(connectionsResults, response.connections, 'connection');
            } else {
                connectionsCountDiv.textContent = "Nenhuma conexão de terceira parte detectada.";
                toggleConnectionsButton.style.display = 'none';
            }
        });
    }

    function requestServices(tabId) {
        browser.runtime.sendMessage({ action: "get_suspicious_services", tabId: tabId }, function (response) {
            if (response && response.services && Object.keys(response.services).length > 0) {
                servicesCountDiv.textContent = `Total de serviços suspeitos: ${Object.keys(response.services).length}`;
                toggleServicesButton.style.display = 'block';
                populateList(servicesResults, response.services, 'service');
            } else {
                servicesCountDiv.textContent = "Nenhum serviço suspeito detectado.";
                toggleServicesButton.style.display = 'none';
            }
        });
    }

    function requestCookies(tabId) {
        browser.runtime.sendMessage({ action: "get_cookies", tabId: tabId }, function (response) {
            if (response && response.cookies) {
                const firstPartyDetails = response.cookies.firstPartyDetails || {};
                const thirdPartyDetails = response.cookies.thirdPartyDetails || {};
                const firstParty = Object.keys(firstPartyDetails).length;
                const thirdParty = Object.keys(thirdPartyDetails).length;
                cookiesCountDiv.textContent = `First-party cookies: ${firstParty}`;
                cookiesCountDiv3.textContent = `Third-party cookies: ${thirdParty}`;
                if (firstParty > 0) {
                    toggleCookiesButton.style.display = 'block';
                    populateList(cookiesResults, firstPartyDetails, 'cookie');
                } else {
                    toggleCookiesButton.style.display = 'none';
                }
                if (thirdParty > 0) {
                    toggleCookiesButton3.style.display = 'block';
                    populateList(cookiesResults3, thirdPartyDetails, 'cookie');
                } else {
                    toggleCookiesButton3.style.display = 'none';
                }
            } else {
                cookiesCountDiv.textContent = "No first-party cookies detected.";
                cookiesCountDiv3.textContent = "No third-party cookies detected.";
                toggleCookiesButton.style.display = 'none';
                toggleCookiesButton3.style.display = 'none';
            }
        });
    }


    function populateList(listElement, items, type) {
        listElement.innerHTML = '';
        Object.keys(items).forEach(item => {
            const count = items[item];
            let li = document.createElement('li');
            li.textContent = `${item} (detectado ${count} vezes)`;
            listElement.appendChild(li);
        });
    }

    function toggleDropdown(dropdown, button, showText, hideText) {
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            button.textContent = showText;
        } else {
            dropdown.style.display = 'block';
            button.textContent = hideText;
        }
    }

    toggleConnectionsButton.addEventListener('click', () => {
        toggleDropdown(connectionsDropdown, toggleConnectionsButton, 'Mostrar Conexões', 'Esconder Conexões');
    });

    toggleServicesButton.addEventListener('click', () => {
        toggleDropdown(servicesDropdown, toggleServicesButton, 'Mostrar Serviços Suspeitos', 'Esconder Serviços');
    });

    toggleCookiesButton.addEventListener('click', () => {
        toggleDropdown(cookiesDropdown, toggleCookiesButton, 'Mostrar Cookies - 1 parte', 'Esconder Cookies - 1 parte');
    });

    toggleCookiesButton3.addEventListener('click', () => {
        toggleDropdown(cookiesDropdown3, toggleCookiesButton3, 'Mostrar Cookies - 3 parte', 'Esconder Cookies - 3 parte');
    });
});
