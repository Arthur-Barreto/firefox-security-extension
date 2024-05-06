// Exemplo de como você pode monitorar as solicitações feitas pela página
window.addEventListener('load', function () {
    // Adicione um ouvinte de evento ao objeto XMLHttpRequest para monitorar solicitações AJAX
    XMLHttpRequest.prototype.realOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        console.log('Solicitação AJAX:', url);
        // Você pode adicionar a lógica para notificar o usuário ou tomar outras medidas aqui
        this.realOpen(method, url, async, user, password);
    };

    // Adicione um ouvinte de evento ao objeto fetch para monitorar solicitações fetch
    const realFetch = window.fetch;
    window.fetch = function () {
        console.log('Solicitação fetch:', arguments[0]);
        // Você pode adicionar a lógica para notificar o usuário ou tomar outras medidas aqui
        return realFetch.apply(this, arguments);
    };
});
