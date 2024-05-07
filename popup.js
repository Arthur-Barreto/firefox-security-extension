document.addEventListener('DOMContentLoaded', function () {
    const connectionsCountDiv = document.getElementById('connectionsCount');
    const toggleConnectionsButton = document.getElementById('toggleConnectionsButton');
    const connectionsDropdown = document.getElementById('connectionsDropdown');
    const connectionsResults = document.getElementById('connectionsResults');

    const servicesCountDiv = document.getElementById('servicesCount');
    const toggleServicesButton = document.getElementById('toggleServicesButton');
    const servicesDropdown = document.getElementById('servicesDropdown');
    const servicesResults = document.getElementById('servicesResults');

    // Obter o ID da aba atual
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabId = tabs[0].id;
        requestConnections(currentTabId);
        requestServices(currentTabId);
    });

    function requestConnections(tabId) {
        browser.runtime.sendMessage({ action: "get_connections", tabId: tabId }, function (response) {
            console.log("Resposta recebida para conexões:", response);
            if (response && response.connections && Object.keys(response.connections).length > 0) {
                connectionsCountDiv.textContent = `Total de conexões de terceira parte: ${Object.keys(response.connections).length}`;
                toggleConnectionsButton.style.display = 'block';
                populateList(connectionsResults, response.connections);
            } else {
                connectionsCountDiv.textContent = "Nenhuma conexão de terceira parte detectada.";
                toggleConnectionsButton.style.display = 'none';
            }
        });
    }

    function requestServices(tabId) {
        browser.runtime.sendMessage({ action: "get_suspicious_services", tabId: tabId }, function (response) {
            console.log("Resposta recebida para serviços suspeitos:", response);
            if (response && response.services && Object.keys(response.services).length > 0) {
                servicesCountDiv.textContent = `Total de serviços suspeitos: ${Object.keys(response.services).length}`;
                toggleServicesButton.style.display = 'block';
                populateList(servicesResults, response.services);
            } else {
                servicesCountDiv.textContent = "Nenhum serviço suspeito detectado.";
                toggleServicesButton.style.display = 'none';
            }
        });
    }

    function populateList(listElement, items) {
        listElement.innerHTML = '';
        Object.keys(items).forEach(item => {
            const count = items[item];
            let li = document.createElement('li');
            li.textContent = `${item} (detectado ${count} vezes)`;
            listElement.appendChild(li);
        });
    }

    toggleConnectionsButton.addEventListener('click', () => {
        toggleDropdown(connectionsDropdown, toggleConnectionsButton, 'Mostrar Conexões', 'Esconder Conexões');
    });

    toggleServicesButton.addEventListener('click', () => {
        toggleDropdown(servicesDropdown, toggleServicesButton, 'Mostrar Serviços Suspeitos', 'Esconder Serviços');
    });

    function toggleDropdown(dropdown, button, showText, hideText) {
        if (dropdown.style.display === 'block' || dropdown.style.display === '') {
            // Se estiver mostrando, esconda e atualize o texto do botão para "Mostrar"
            dropdown.style.display = 'none';
            button.textContent = showText;
        } else {
            // Se estiver escondido, mostre e atualize o texto do botão para "Esconder"
            dropdown.style.display = 'block';
            button.textContent = hideText;
        }
    }

});
