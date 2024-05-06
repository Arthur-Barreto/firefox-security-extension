document.addEventListener('DOMContentLoaded', function () {
    const countDiv = document.getElementById('count');
    const toggleButton = document.getElementById('toggleButton');
    const dropdown = document.getElementById('dropdown');
    const resultsElement = document.getElementById('results');

    // Obtém o ID da aba atual
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tabId = tabs[0].id;  // Assume que sempre haverá pelo menos uma aba

        browser.runtime.sendMessage({ action: "get_connections", tabId: tabId }, function (response) {
            resultsElement.innerHTML = ''; // Limpa os resultados antigos
            if (response && response.connections) {
                let connections = response.connections;
                if (Object.keys(connections).length > 0) {
                    Object.keys(connections).forEach(url => {
                        const count = connections[url];
                        let li = document.createElement('li');
                        li.textContent = `${url} (acessado ${count} vezes)`;
                        resultsElement.appendChild(li);
                    });
                    toggleButton.style.display = 'block'; // Mostra o botão se existirem conexões
                    toggleButton.textContent = 'Mostrar Conexões'; // Define o texto inicial do botão
                    countDiv.textContent = `Conexões Externas: ${Object.keys(connections).length}`;
                } else {
                    countDiv.textContent = "Nenhuma conexão de terceira parte detectada.";
                    toggleButton.style.display = 'none'; // Esconde o botão se não existirem conexões
                }
            }
        });
    });

    toggleButton.addEventListener('click', () => {
        const isShowing = dropdown.style.display === 'block';
        dropdown.style.display = isShowing ? 'none' : 'block';
        toggleButton.textContent = isShowing ? 'Mostrar Conexões' : 'Esconder Conexões';
    });
});
