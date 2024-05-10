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

    const localStorageCountDiv = document.getElementById('localStorageCount');
    const toggleLocalStorageButton = document.getElementById('toggleLocalStorageButton');
    const localStorageDropdown = document.getElementById('localStorageDropdown');
    const localStorageResults = document.getElementById('localStorageResults');

    const sessionStorageCountDiv = document.getElementById('sessionStorageCount');
    const toggleSessionStorageButton = document.getElementById('toggleSessionStorageButton');
    const sessionStorageDropdown = document.getElementById('sessionStorageDropdown');
    const sessionStorageResults = document.getElementById('sessionStorageResults');

    const canvasCountDiv = document.getElementById('canvasCount');
    const toggleCanvasButton = document.getElementById('toggleCanvasButton');
    const canvasDropdown = document.getElementById('canvasDropdown');
    const canvasResults = document.getElementById('canvasResults');

    const scoreSite = document.getElementById('scoreSite');

    // Obter o ID da aba atual
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabId = tabs[0].id;
        requestConnections(currentTabId);
        requestServices(currentTabId);
        requestCookies(currentTabId);
        requestLocalStorage(currentTabId);
        requestCanvasFingerprint(currentTabId);
        calculateScore();
    });

    function calculateScore() {
        let connectionsScore = 0;
        let servicesScore = 0;
        let cookiesScore = 0;
        let cookiesScore3 = 0;
        let localStorageScore = 0;
        let sessionStorageScore = 0;
        let canvasScore = 0;

        // Assuming 10 is the worst-case number of items and gets a score of 0,
        // each item less than 10 improves the score
        connectionsScore = connectionsResults.children.length * 0.15;
        servicesScore = servicesResults.children.length * 0.3;
        cookiesScore = cookiesResults.children.length * 0.1;
        cookiesScore3 = cookiesResults3.children.length * 0.3;
        localStorageScore = localStorageResults.children.length * 0.2;
        sessionStorageScore = sessionStorageResults.children.length * 0.2;
        canvasScore = canvasResults.textContent ? 0 : 0.25;

        const finalScore = connectionsScore + servicesScore + cookiesScore + cookiesScore3 + localStorageScore + sessionStorageScore + canvasScore;
        console.log(`connectionsScore: ${connectionsScore}, servicesScore: ${servicesScore}, cookiesScore: ${cookiesScore}, cookiesScore3: ${cookiesScore3}, localStorageScore: ${localStorageScore}, sessionStorageScore: ${sessionStorageScore}, canvasScore: ${canvasScore}, finalScore: ${finalScore}`)
        // se maior que 10, limita a 10
        if (finalScore > 10) {
            finalScore = 10;
        }

        // Display the score
        scoreSite.textContent = `Score Vulnerabilidade: ${finalScore.toFixed(2)}`;
    }

    // Recalculate the score whenever any of the variables used changes
    connectionsResults.addEventListener('DOMSubtreeModified', calculateScore);
    servicesResults.addEventListener('DOMSubtreeModified', calculateScore);
    cookiesResults.addEventListener('DOMSubtreeModified', calculateScore);
    cookiesResults3.addEventListener('DOMSubtreeModified', calculateScore);
    localStorageResults.addEventListener('DOMSubtreeModified', calculateScore);
    sessionStorageResults.addEventListener('DOMSubtreeModified', calculateScore);
    canvasResults.addEventListener('DOMSubtreeModified', calculateScore);


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

    function requestLocalStorage(tabId) {
        browser.runtime.sendMessage({ action: "get_local_storage", tabId: tabId }, function (response) {
            if (!response) {
                console.error("No response received");
                return;
            }
            if (response.error) {
                console.error("Error fetching storage:", response.error);
                return;
            }

            if (response.data) {
                const { localStorage, sessionStorage } = response.data;
                if (localStorage && Object.keys(localStorage).length > 0) {
                    localStorageCountDiv.textContent = `Local Storage: ${Object.keys(localStorage).length}`;
                    toggleLocalStorageButton.style.display = 'block';
                    populateList(localStorageResults, localStorage, 'storage');
                } else {
                    localStorageCountDiv.textContent = "No local storage detected.";
                    toggleLocalStorageButton.style.display = 'none';
                }

                if (sessionStorage && Object.keys(sessionStorage).length > 0) {
                    sessionStorageCountDiv.textContent = `Session Storage: ${Object.keys(sessionStorage).length}`;
                    toggleSessionStorageButton.style.display = 'block';
                    populateList(sessionStorageResults, sessionStorage, 'storage');
                } else {
                    sessionStorageCountDiv.textContent = "No session storage detected.";
                    toggleSessionStorageButton.style.display = 'none';
                }
            } else {
                localStorageCountDiv.textContent = "No local storage detected.";
                sessionStorageCountDiv.textContent = "No session storage detected.";
                toggleLocalStorageButton.style.display = 'none';
                toggleSessionStorageButton.style.display = 'none';
            }
        });
    }

    function requestCanvasFingerprint(tabId) {
        browser.runtime.sendMessage({ action: "get_canvas_fingerprint", tabId: tabId }, function (response) {
            if (response && response.data) {
                canvasCountDiv.textContent = "Canvas fingerprint detected";
                toggleCanvasButton.style.display = 'block';
                canvasResults.textContent = response.data;
                console.log("Canvas fingerprint data:", response.data);
            } else {
                canvasCountDiv.textContent = "No canvas fingerprint detected";
                toggleCanvasButton.style.display = 'none';
                console.log("No canvas fingerprint detected");
            }
        });
    }


    function populateList(listElement, items, type) {
        listElement.innerHTML = ''; // Clear previous items
        if (type === 'storage') { // Handle storage differently
            Object.entries(items).forEach(([key, value]) => {
                let li = document.createElement('li');
                li.textContent = `${key}: ${value}`;
                listElement.appendChild(li);
            });
        } else {
            Object.keys(items).forEach(key => {
                let li = document.createElement('li');
                li.textContent = `${key} (detected ${items[key]} times)`;
                listElement.appendChild(li);
            });
        }
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

    toggleLocalStorageButton.addEventListener('click', () => {
        toggleDropdown(localStorageDropdown, toggleLocalStorageButton, 'Mostrar Local Storage', 'Esconder Local Storage');
    });

    toggleSessionStorageButton.addEventListener('click', () => {
        toggleDropdown(sessionStorageDropdown, toggleSessionStorageButton, 'Mostrar Session Storage', 'Esconder Session Storage');
    });

    toggleCanvasButton.addEventListener('click', () => {
        toggleDropdown(canvasDropdown, toggleCanvasButton, 'Mostrar Canvas Fingerprint', 'Esconder Canvas Fingerprint');
    });
});
