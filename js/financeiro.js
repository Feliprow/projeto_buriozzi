document.addEventListener('DOMContentLoaded', function() {
    
    // Pega os botões e painéis principais
    const btnPagar = document.getElementById('btn-toggle-pagar');
    const btnHistorico = document.getElementById('btn-toggle-historico');
    
    const painelPagar = document.getElementById('painel-pagar');
    const painelHistorico = document.getElementById('painel-historico');

    // Pega os novos elementos (débito e opções)
    const debito1 = document.getElementById('debito-1');
    const opcoesDebito1 = document.getElementById('opcoes-debito-1');

    // "Vigia" o clique no botão PAGAR
    btnPagar.addEventListener('click', function() {
        if (btnPagar.classList.contains('ativo')) {
            // Se já está ativo, fecha tudo
            btnPagar.classList.remove('ativo');
            painelPagar.style.display = 'none';
            opcoesDebito1.style.display = 'none'; // Garante que as opções fechem também
        } else {
            // Se não, ativa ele
            btnPagar.classList.add('ativo');
            painelPagar.style.display = 'block';
            
            // E desativa/fecha o outro (Histórico)
            btnHistorico.classList.remove('ativo');
            painelHistorico.style.display = 'none';
        }
    });

    // "Vigia" o clique no botão HISTÓRICO
    btnHistorico.addEventListener('click', function() {
        if (btnHistorico.classList.contains('ativo')) {
            btnHistorico.classList.remove('ativo');
            painelHistorico.style.display = 'none';
        } else {
            btnHistorico.classList.add('ativo');
            painelHistorico.style.display = 'block';
            
            // E desativa/fecha o outro (Pagar)
            btnPagar.classList.remove('ativo');
            painelPagar.style.display = 'none';
            opcoesDebito1.style.display = 'none'; // Garante que as opções fechem
        }
    });

    // --- MUDANÇA AQUI ---
    // "Vigia" o clique no DÉBITO PENDENTE
    debito1.addEventListener('click', function() {
        // Verifica se as opções estão abertas ou fechadas
        const estaAberto = opcoesDebito1.style.display === 'block';

        if (estaAberto) {
            opcoesDebito1.style.display = 'none';
        } else {
            opcoesDebito1.style.display = 'block';
        }
    });

});