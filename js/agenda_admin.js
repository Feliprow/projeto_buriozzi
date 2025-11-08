document.addEventListener('DOMContentLoaded', function() {
    
    // Pega o grid principal da agenda
    const agendaGrid = document.querySelector('.agenda-grid');
    if (!agendaGrid) return; // Se não estiver na página da agenda, para aqui

    // --- "Banco de Dados" Falso (Placeholders) ---
    const pacientesPlaceholder = [
        "Felipe Neres Vieira", "Matheus Ferreira", "Renato Angeli",
        "David Ben", "Rafael Santiago", "Maria Silva", "João Santos"
    ];
    const procedimentosPlaceholder = [
        "Consulta e Avaliação", "Limpeza (Profilaxia)", "Clareamento",
        "Restauração (Resina)", "Tratamento de Canal", "Extração de Siso", "Implante (Etapa 1)"
    ];

    // --- FUNÇÃO 0: GERAR DIAS DA SEMANA (Pedido 3) ---
    function gerarCabecalhoDias() {
        const hoje = new Date();
        const diaDaSemanaHoje = hoje.getDay(); // 0 (Dom) - 6 (Sáb)
        
        // Ajuste para pegar Segunda (1) como início, mesmo que hoje seja Domingo (0)
        let diffSegunda = hoje.getDate() - diaDaSemanaHoje + (diaDaSemanaHoje === 0 ? -6 : 1);
        const segunda = new Date(hoje.setDate(diffSegunda));

        const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

        for (let i = 0; i < 5; i++) {
            const diaAtual = new Date(segunda);
            diaAtual.setDate(segunda.getDate() + i);
            
            const diaFormatado = diaAtual.getDate().toString().padStart(2, '0');
            const mesFormatado = (diaAtual.getMonth() + 1).toString().padStart(2, '0');
            
            // Acha o header do dia (data-dia-semana="1" para Segunda, etc.)
            const headerEl = agendaGrid.querySelector(`.grid-header[data-dia-semana="${i + 1}"]`);
            if (headerEl) {
                headerEl.innerHTML = `${dias[i]} (${diaFormatado}/${mesFormatado})`;
            }
        }
    }
    
    // --- FUNÇÃO 1: Abrir o Pop-up (Modal) ---
    function abrirModal(titulo, conteudoHtml) {
        fecharModal(); 

        const backdrop = document.createElement('div');
        backdrop.classList.add('admin-modal-backdrop');
        
        const modal = document.createElement('div');
        modal.classList.add('admin-modal-content');
        
        modal.innerHTML = `
            <div class="admin-modal-header">
                <h3>${titulo}</h3>
                <button class="admin-modal-close" id="modal-close-btn">&times;</button>
            </div>
            <div class="admin-modal-body">
                ${conteudoHtml}
            </div>
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        backdrop.onclick = fecharModal;
        document.getElementById('modal-close-btn').onclick = fecharModal;
    }

    // --- FUNÇÃO 2: Fechar o Pop-up (Modal) ---
    function fecharModal() {
        const backdrop = document.querySelector('.admin-modal-backdrop');
        const modal = document.querySelector('.admin-modal-content');
        if (backdrop) backdrop.remove();
        if (modal) modal.remove();
    }

    // --- FUNÇÃO 3: Gerar HTML para os Pop-ups ---

    // (A) Pop-up para ENCAIXAR (horário livre)
    function getHtmlEncaixe(targetSlot) {
        let pacientesOptions = pacientesPlaceholder
            .map(nome => `<option value="${nome}">${nome}</option>`)
            .join('');
        
        let procedimentosOptions = procedimentosPlaceholder
            .map(proc => `<option value="${proc}">${proc}</option>`)
            .join('');

        return `
            <p>Selecione o paciente e o procedimento para este horário.</p>
            <div class="admin-modal-form">
                <label for="paciente-select">Paciente:</label>
                <input type="text" id="paciente-search" placeholder="Buscar paciente...">
                <select id="paciente-select" size="4">
                    ${pacientesOptions}
                </select>
                
                <label for="procedimento-select">Procedimento:</label>
                <select id="procedimento-select">
                    ${procedimentosOptions}
                </select>
                
                <div class="admin-modal-botoes">
                    <button class="btn-admin-modal btn-bloquear" id="btn-bloquear-horario">Bloquear Horário</button>
                    <button class="btn-admin-modal btn-salvar" id="btn-salvar-encaixe">Incluir Agendamento</button>
                </div>
            </div>
        `;
    }

    // (B) Pop-up para ACEITAR (horário pendente)
    function getHtmlPendente(targetSlot) {
        const nome = targetSlot.querySelector('span:nth-of-type(1)').textContent;
        const proc = targetSlot.querySelector('span:nth-of-type(2)').textContent;
        return `
            <p><strong>Paciente:</strong> ${nome}</p>
            <p><strong>Procedimento:</strong> ${proc}</p>
            <p>O paciente solicitou este horário. O que deseja fazer?</p>
            <div class="admin-modal-botoes">
                <button class="btn-admin-modal btn-salvar" id="btn-aceitar-agendamento">Agendar</button>
                <button class="btn-admin-modal btn-reagendar" id="btn-reagendar-agendamento">Reagendar</button>
                <button class="btn-admin-modal btn-cancelar" id="btn-cancelar-agendamento">Cancelar</button>
            </div>
        `;
    }

    // (C) Pop-up para DESMARCAR (horário ocupado)
    function getHtmlOcupado(targetSlot) {
        const nome = targetSlot.querySelector('strong').textContent;
        const proc = targetSlot.querySelector('span').textContent;
        return `
            <p><strong>Paciente:</strong> ${nome}</p>
            <p><strong>Procedimento:</strong> ${proc}</p>
            <div class="admin-modal-botoes">
                <button class="btn-admin-modal btn-cancelar" id="btn-cancelar-agendamento">Cancelar Agendamento</button>
            </div>
        `;
    }

    // (D) Pop-up para DESBLOQUEAR (horário bloqueado) - (Pedido 2)
    function getHtmlBloqueado(targetSlot) {
        const texto = targetSlot.textContent;
        // Não abre pop-up para "Fechado" ou "Almoço", só para "Bloqueado"
        if(texto === "Fechado" || texto === "Almoço") return;

        return `
            <p>Este horário está bloqueado manualmente. Deseja liberá-lo?</p>
            <div class="admin-modal-botoes">
                <button class="btn-admin-modal btn-salvar" id="btn-desbloquear-horario">Desbloquear</button>
            </div>
        `;
    }

    // --- FUNÇÃO 4: O "VIGIA" CHEFE (Onde a mágica acontece) ---
    agendaGrid.addEventListener('click', function(e) {
        
        const targetSlot = e.target.closest('.grid-item');
        if (!targetSlot) return; 

        // --- Caso 1: Clicou num HORÁRIO LIVRE ---
        if (targetSlot.classList.contains('horario-livre')) {
            abrirModal('Encaixar Horário', getHtmlEncaixe(targetSlot));
            
            // Vigia "Incluir"
            document.getElementById('btn-salvar-encaixe').onclick = function() {
                const pacienteSelect = document.getElementById('paciente-select');
                const paciente = pacienteSelect.value || pacientesPlaceholder[0]; 
                const procedimentoSelect = document.getElementById('procedimento-select');
                const procedimento = procedimentoSelect.value || procedimentosPlaceholder[0];
                
                targetSlot.classList.remove('horario-livre');
                targetSlot.classList.add('horario-ocupado'); 
                targetSlot.innerHTML = `
                    <strong>${paciente}</strong>
                    <span>${procedimento}</span>
                    <div class="icone-sino">🔔</div>
                `;
                fecharModal();
            };
            
            // Vigia "Bloquear Horário"
            document.getElementById('btn-bloquear-horario').onclick = function() {
                targetSlot.classList.remove('horario-livre');
                targetSlot.classList.add('horario-bloqueado');
                targetSlot.innerHTML = 'Bloqueado'; // Texto genérico
                fecharModal();
            };

            // Simulação do filtro de busca
            document.getElementById('paciente-search').onkeyup = function() {
                const filtro = this.value.toLowerCase();
                const selects = document.getElementById('paciente-select').options;
                for (let option of selects) {
                    if (option.value.toLowerCase().includes(filtro)) {
                        option.style.display = '';
                    } else {
                        option.style.display = 'none';
                    }
                }
            };
        }

        // --- Caso 2: Clicou num HORÁRIO PENDENTE ---
        if (targetSlot.classList.contains('horario-pendente')) {
            abrirModal('Confirmar Agendamento', getHtmlPendente(targetSlot));

            // Vigia "Agendar"
            document.getElementById('btn-aceitar-agendamento').onclick = function() {
                const nome = targetSlot.querySelector('span:nth-of-type(1)').textContent;
                const proc = targetSlot.querySelector('span:nth-of-type(2)').textContent;
                
                targetSlot.classList.remove('horario-pendente');
                targetSlot.classList.add('horario-ocupado'); 
                targetSlot.innerHTML = `
                    <strong>${nome}</strong>
                    <span>${proc}</span>
                    <div class="icone-sino">🔔</div>
                `;
                fecharModal();
            };
            
            // Vigia "Cancelar"
            document.getElementById('btn-cancelar-agendamento').onclick = function() {
                targetSlot.classList.remove('horario-pendente');
                targetSlot.classList.add('horario-livre');
                targetSlot.innerHTML = '';
                fecharModal();
            };
            
            // Vigia "Reagendar"
            document.getElementById('btn-reagendar-agendamento').onclick = function() {
                fecharModal();
                alert('Simulação: Abrindo painel de reagendamento...');
            };
        }

        // --- Caso 3: Clicou num HORÁRIO OCUPADO ---
        if (targetSlot.classList.contains('horario-ocupado')) {
            if (e.target.classList.contains('icone-sino')) {
                e.target.textContent = '✔️'; 
                e.target.style.cursor = 'default';
                alert('Simulação: Lembrete de notificação enviado ao paciente!');
                return; 
            }
            
            abrirModal('Detalhes do Agendamento', getHtmlOcupado(targetSlot));

            // Vigia "Cancelar"
            document.getElementById('btn-cancelar-agendamento').onclick = function() {
                targetSlot.classList.remove('horario-ocupado');
                targetSlot.classList.add('horario-livre');
                targetSlot.innerHTML = '';
                fecharModal();
            };
        }

        // --- Caso 4: Clicou num HORÁRIO BLOQUEADO ---
        if (targetSlot.classList.contains('horario-bloqueado')) {
            const html = getHtmlBloqueado(targetSlot);
            if (!html) return; // Não faz nada se for "Fechado" ou "Almoço"

            abrirModal('Desbloquear Horário', html);

            // Vigia "Desbloquear"
            document.getElementById('btn-desbloquear-horario').onclick = function() {
                targetSlot.classList.remove('horario-bloqueado');
                targetSlot.classList.add('horario-livre');
                targetSlot.innerHTML = '';
                fecharModal();
            };
        }
    });

    // --- INICIALIZAÇÃO ---
    gerarCabecalhoDias(); // Roda a função para preencher os dias da semana

});