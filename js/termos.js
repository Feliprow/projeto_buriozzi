// Espera o documento HTML ser todo carregado
document.addEventListener('DOMContentLoaded', function() {
    
    const checkboxAceite = document.getElementById('aceite-termos');
    
    // Mudamos o ID para ser um link <a>, não um <button>
    const linkFinalizar = document.getElementById('botao-finalizar');

    function verificarCheckbox() {
        if (checkboxAceite.checked) {
            // Se checado, REMOVE a classe que "desabilita" o link
            linkFinalizar.classList.remove('desabilitado');
        } else {
            // Se não checado, ADICIONA a classe que "desabilita" o link
            linkFinalizar.classList.add('desabilitado');
        }
    }

    // Roda na hora que a página carrega (para garantir que comece desabilitado)
    verificarCheckbox();

    // Roda toda vez que o usuário clica no checkbox
    checkboxAceite.addEventListener('change', verificarCheckbox);

});