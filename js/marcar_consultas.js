document.addEventListener('DOMContentLoaded', function() {
    
    // Pega o estado atual (Mês/Ano)
    let dataAtual = new Date();
    let mesAtual = dataAtual.getMonth();
    let anoAtual = dataAtual.getFullYear();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    /**
     * FUNÇÃO 1: Gerar o Calendário
     */
    function gerarCalendario(mes, ano, containerCalendario) {
        containerCalendario.innerHTML = ''; // Limpa o calendário antigo
        
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        const diasNoMes = ultimoDia.getDate();
        const diaSemanaPrimeiro = primeiroDia.getDay();
        
        const header = document.createElement('div');
        header.classList.add('calendario-header');
        
        const btnAnterior = document.createElement('button');
        btnAnterior.classList.add('nav-calendario');
        btnAnterior.id = 'btn-anterior';
        btnAnterior.textContent = '<';
        
        const mesAnoTexto = document.createElement('span');
        mesAnoTexto.textContent = `${meses[mes]} ${ano}`;
        
        const btnProximo = document.createElement('button');
        btnProximo.classList.add('nav-calendario');
        btnProximo.id = 'btn-proximo';
        btnProximo.textContent = '>';
        
        header.appendChild(btnAnterior);
        header.appendChild(mesAnoTexto);
        header.appendChild(btnProximo);
        containerCalendario.appendChild(header);

        const grid = document.createElement('div');
        grid.classList.add('calendario-grid');
        
        const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        diasSemana.forEach(dia => {
            const diaEl = document.createElement('div');
            diaEl.classList.add('dia-semana');
            diaEl.textContent = dia;
            grid.appendChild(diaEl);
        });
        
        for (let i = 0; i < diaSemanaPrimeiro; i++) {
            const diaEl = document.createElement('div');
            diaEl.classList.add('dia-calendario', 'dia-vazio');
            grid.appendChild(diaEl);
        }
        
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const diaEl = document.createElement('div');
            diaEl.classList.add('dia-calendario');
            diaEl.textContent = dia;
            diaEl.dataset.dia = dia;
            
            const dataDia = new Date(ano, mes, dia);
            const diaSemana = dataDia.getDay();

            if (diaSemana === 0 || diaSemana === 6) {
                diaEl.classList.add('fim-de-semana');
            }
            if (dataDia < hoje) {
                diaEl.classList.add('dia-passado');
            }
            grid.appendChild(diaEl);
        }
        containerCalendario.appendChild(grid);

        btnAnterior.onclick = () => {
            mesAtual--;
            if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
            gerarCalendario(mesAtual, anoAtual, containerCalendario);
        };
        
        btnProximo.onclick = () => {
            mesAtual++;
            if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
            gerarCalendario(mesAtual, anoAtual, containerCalendario);
        };
    }

    /**
     * FUNÇÃO 2: Gerar os Horários
     */
    function gerarHorarios(containerHorarios) {
        containerHorarios.innerHTML = '';
        const gridHorarios = document.createElement('div');
        gridHorarios.classList.add('horarios-grid');
        
        for (let hora = 9; hora <= 18; hora++) {
            if (hora !== 12 && hora !== 15) { // Pula 12h e 15h
                const btn = document.createElement('button');
                btn.classList.add('btn-horario');
                btn.textContent = `${hora}:00`;
                btn.dataset.hora = `${hora}:00`;
                gridHorarios.appendChild(btn);
            }
        }
        containerHorarios.appendChild(gridHorarios);
        containerHorarios.style.display = 'block';
    }

    /**
     * FUNÇÃO 3: Lógica de Clique Principal (Botão "Marcar")
     */
    document.querySelectorAll('.btn-marcar').forEach(botao => {
        botao.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const areaAgendamento = document.getElementById(targetId);
            const containerCalendario = areaAgendamento.querySelector('.calendario-container');
            const estaAberto = areaAgendamento.style.display === 'block';

            // --- FECHAR TUDO (Reset) ---
            document.querySelectorAll('.area-agendamento-condicional').forEach(area => {
                area.style.display = 'none';
            });
            document.querySelectorAll('.btn-marcar').forEach(btn => {
                btn.textContent = 'Marcar';
                btn.classList.remove('ativo');
            });
            // --- FIM DO RESET ---

            if (!estaAberto) {
                areaAgendamento.style.display = 'block';
                this.textContent = 'Fechar';
                this.classList.add('ativo');
                mesAtual = new Date().getMonth();
                anoAtual = new Date().getFullYear();
                gerarCalendario(mesAtual, anoAtual, containerCalendario);
            }
        });
    });

    /**
     * FUNÇÃO 4: Lógica de Clique (Delegação de Eventos)
     */
    document.body.addEventListener('click', function(e) {
        
        // --- Se clicar em um DIA VÁLIDO ---
        if (e.target.classList.contains('dia-calendario') && 
            !e.target.classList.contains('fim-de-semana') &&
            !e.target.classList.contains('dia-vazio') &&
            !e.target.classList.contains('dia-passado')) {
            
            document.querySelectorAll('.dia-calendario').forEach(d => d.classList.remove('selecionado'));
            e.target.classList.add('selecionado');
            
            const areaAgendamento = e.target.closest('.area-agendamento-condicional');
            const containerHorarios = areaAgendamento.querySelector('.horarios-container');
            
            // Esconde o painel de confirmação se ele estava aberto
            areaAgendamento.querySelector('.confirmacao-container').style.display = 'none';
            
            gerarHorarios(containerHorarios);
        }

        // --- Se clicar em um HORÁRIO ---
        if (e.target.classList.contains('btn-horario')) {
            document.querySelectorAll('.btn-horario').forEach(h => h.classList.remove('selecionado'));
            e.target.classList.add('selecionado');

            // Pega o "container-pai" de tudo
            const containerPai = e.target.closest('.item-procedimento-container');
            
            // Pega o valor do procedimento
            const nomeProcedimentoEl = containerPai.querySelector('.nome-procedimento');
            const valorProc = nomeProcedimentoEl.dataset.valor;

            // Acha o painel de confirmação
            const painelConfirmacao = containerPai.querySelector('.confirmacao-container');
            
            // Acha o span de valor e atualiza
            const spanValor = painelConfirmacao.querySelector('.valor-consulta');
            spanValor.textContent = valorProc;

            // Mostra o painel de confirmação
            painelConfirmacao.style.display = 'block';
        }

        // --- Se clicar no botão "CONFIRMAR" FINAL ---
        if (e.target.classList.contains('btn-confirmar-final')) {
            e.preventDefault(); // Impede o envio do formulário

            // Mostra o overlay
            document.getElementById('overlay-confirmacao').style.display = 'flex';

            // Espera 2.5 segundos e redireciona
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2500); // 2500 milissegundos = 2.5 segundos
        }
    });

});