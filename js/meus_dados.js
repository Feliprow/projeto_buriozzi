document.addEventListener('DOMContentLoaded', function() {
    
    // Pega todos os botões "Editar"
    const botoesEditar = document.querySelectorAll('.btn-editar');
    
    // Pega todos os botões "Salvar"
    const botoesSalvar = document.querySelectorAll('.btn-salvar');

    // Adiciona o "vigia" em cada botão "Editar"
    botoesEditar.forEach(botao => {
        botao.addEventListener('click', function() {
            // Acha o "container-pai" (o .item-editavel)
            const containerPai = this.closest('.item-editavel');
            
            // Esconde o modo "view"
            containerPai.querySelector('.dado-view').style.display = 'none';
            
            // Mostra o modo "edit"
            containerPai.querySelector('.dado-edit').style.display = 'flex';
        });
    });

    // Adiciona o "vigia" em cada botão "Salvar"
    botoesSalvar.forEach(botao => {
        botao.addEventListener('click', function() {
            // Acha o "container-pai"
            const containerPai = this.closest('.item-editavel');
            
            // Pega o <input> e o <span> de valor
            const input = containerPai.querySelector('.input-dado');
            const spanValor = containerPai.querySelector('.valor-editavel');

            // A MÁGICA: "Salva" o novo valor (visualmente)
            if (input.type === 'password') {
                spanValor.textContent = '**********'; // Sempre mostra asteriscos para senha
            } else {
                spanValor.textContent = input.value; // Pega o valor digitado
            }

            // Esconde o modo "edit"
            containerPai.querySelector('.dado-edit').style.display = 'none';
            
            // Mostra o modo "view" (agora atualizado)
            containerPai.querySelector('.dado-view').style.display = 'flex';
        });
    });

});