document.addEventListener('DOMContentLoaded', function () {
    const countDiv = document.getElementById('count');
    const toggleButton = document.getElementById('toggleButton');
    const dropdown = document.getElementById('dropdown');
    const results = document.getElementById('results');

    // Solicita as conexões ao abrir o popup
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        browser.runtime.sendMessage({ action: "get_connections", tabId: tabs[0].id }, function (response) {
            const connections = response.connections;
            if (connections && connections.length > 0) {
                countDiv.textContent = `Conexões de Terceiros: ${connections.length}`;
                connections.forEach(url => {
                    let li = document.createElement('li');
                    li.textContent = url;
                    results.appendChild(li);
                });
                toggleButton.style.display = 'block';
                toggleButton.textContent = 'Mostrar Conexões';
            } else {
                countDiv.textContent = "Nenhuma conexão de terceira parte detectada.";
            }
        });
    });

    toggleButton.addEventListener('click', () => {
        const isShowing = dropdown.style.display === 'block';
        dropdown.style.display = isShowing ? 'none' : 'block';
        toggleButton.textContent = isShowing ? 'Mostrar Conexões' : 'Esconder Conexões';
    });
});
