// Executa o script quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    // ==================================
    // === NAVEGAÇÃO E SELETORES GERAIS ===
    // ==================================

    const navButtons = document.querySelectorAll('nav button');
    const pages = document.querySelectorAll('.page');

    const pageChar = document.getElementById('page-char');
    const pageCalc = document.getElementById('page-calc');
    const pageInfo = document.getElementById('page-info');

    // Mapeia botões para suas respectivas páginas
    const navMap = {
        'nav-char': pageChar,
        'nav-calc': pageCalc,
        'nav-info': pageInfo
    };

    // Função para mostrar a página e atualizar o botão ativo
    function showPage(pageId) {
        // Esconde todas as páginas
        pages.forEach(page => page.classList.remove('page-active'));
        
        // Remove a classe 'active' de todos os botões
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Mostra a página clicada
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.classList.add('page-active');
        }

        // Adiciona a classe 'active' ao botão clicado
        const activeButton = document.getElementById(`nav-${pageId.split('-')[1]}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Adiciona listeners de clique aos botões de navegação
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pageId = navMap[button.id].id;
            showPage(pageId);
        });
    });

    // ==================================
    // === DADOS E HISTÓRICO ===
    // ==================================

    // Objeto para armazenar os dados base do personagem
    let charData = {
        baseAtk: 0,
        percentAtk: 0,
        baseHp: 0,
        percentHp: 0,
        totalBaseAtk: 0, // Armazena o total calculado para usar na pág 'calc'
        totalBaseHp: 0   // Armazena o total calculado para usar na pág 'calc'
    };

    // Array para o histórico
    let calculationHistory = [];
    const infoTerminal = document.getElementById('info-terminal');

    // Função para formatar números para o padrão pt-BR
    function formatPTBR(value) {
        if (isNaN(value) || !isFinite(value)) return '0,00';
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Função para logar no histórico (página Info)
    function logToHistory(message) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const logEntry = `[${timestamp}] ${message}\n\n`;
        calculationHistory.push(logEntry);
        
        // Atualiza o terminal
        infoTerminal.textContent = calculationHistory.join('');
        // Rola para o final
        infoTerminal.scrollTop = infoTerminal.scrollHeight;
    }

    // Inicializa o terminal
    logToHistory("Sistema iniciado.");


    // ==================================
    // === LÓGICA DA PÁGINA CHAR ======
    // ==================================

    const charBaseAtk = document.getElementById('char-base-atk');
    const charPercentAtk = document.getElementById('char-percent-atk');
    const charBaseHp = document.getElementById('char-base-hp');
    const charPercentHp = document.getElementById('char-percent-hp');
    const charSubmit = document.getElementById('char-submit');

    // Seletores da página CALC (para atualizar os valores base)
    const calcBaseAtkTotal = document.getElementById('calc-base-atk-total');
    const calcBaseHpTotal = document.getElementById('calc-base-hp-total');

    // Áreas de resultado da pág CALC (para resetar)
    const calcResultAreaAtk = document.getElementById('calc-result-area-atk');
    const calcResultAreaHp = document.getElementById('calc-result-area-hp');

    charSubmit.addEventListener('click', () => {
        // 1. Coletar e parsear os dados
        // Usa "|| 0" para tratar campos vazios como 0 (não obrigatório)
        charData.baseAtk = parseFloat(charBaseAtk.value) || 0;
        charData.percentAtk = parseFloat(charPercentAtk.value) || 0;
        charData.baseHp = parseFloat(charBaseHp.value) || 0;
        charData.percentHp = parseFloat(charPercentHp.value) || 0;

        // 2. Calcular os totais base (Fórmula 1)
        // ((atk base * atk porcento / 100) + atk base)
        charData.totalBaseAtk = (charData.baseAtk * charData.percentAtk / 100) + charData.baseAtk;
        charData.totalBaseHp = (charData.baseHp * charData.percentHp / 100) + charData.baseHp;

        // 3. Atualizar a UI na página CALC com os new totais
        calcBaseAtkTotal.textContent = formatPTBR(charData.totalBaseAtk);
        calcBaseHpTotal.textContent = formatPTBR(charData.totalBaseHp);

        // 4. Resetar os campos e resultados da página CALC
        document.getElementById('calc-adt-atk').value = '';
        document.getElementById('calc-new-percent-atk').value = '';
        document.getElementById('calc-adt-hp').value = '';
        document.getElementById('calc-new-percent-hp').value = '';
        calcResultAreaAtk.style.display = 'none';
        calcResultAreaHp.style.display = 'none';

        // 5. Logar a ação
        logToHistory(`Dados 'Char' enviados:\n  - ATK Base: ${formatPTBR(charData.baseAtk)} | ATK %: ${formatPTBR(charData.percentAtk)}% -> Total: ${formatPTBR(charData.totalBaseAtk)}\n  - HP Base: ${formatPTBR(charData.baseHp)} | HP %: ${formatPTBR(charData.percentHp)}% -> Total: ${formatPTBR(charData.totalBaseHp)}`);

        // 6. Navegar para a página CALC
        showPage('page-calc');
    });


    // ==================================
    // === LÓGICA DA PÁGINA CALC ======
    // ==================================

    // --- Seção ATK ---
    const calcAdtAtk = document.getElementById('calc-adt-atk');
    const calcNewPercentAtk = document.getElementById('calc-new-percent-atk');
    const calcSubmitAtk = document.getElementById('calc-submit-atk');
    
    const calcResultAtk = document.getElementById('calc-result-atk');
    const calcDiffAtkNum = document.getElementById('calc-diff-atk-num');
    const calcDiffAtkPerc = document.getElementById('calc-diff-atk-perc');

    calcSubmitAtk.addEventListener('click', () => {
        // 1. Coletar valores adicionais (|| 0 para campos vazios)
        const adtAtk = parseFloat(calcAdtAtk.value) || 0;
        // Usa o novo percentual, ou o original (de charData) se o campo estiver vazio
        const newPercent = parseFloat(calcNewPercentAtk.value) || charData.percentAtk;

        // 2. Calcular novo base e novo total (Fórmula 2)
        // (((atk base + adt atk base) * new percent atk / 100) + (atk base + adt atk base))
        const newBaseAtk = charData.baseAtk + adtAtk;
        const newTotalAtk = (newBaseAtk * newPercent / 100) + newBaseAtk;

        // 3. Calcular diferenças
        const diffNum = newTotalAtk - charData.totalBaseAtk;
        // Evita divisão por zero
        const diffPerc = charData.totalBaseAtk > 0 ? ((newTotalAtk / charData.totalBaseAtk) - 1) * 100 : (newTotalAtk > 0 ? Infinity : 0);

        // 4. Exibir resultados
        calcResultAtk.textContent = formatPTBR(newTotalAtk);
        calcDiffAtkNum.textContent = formatPTBR(diffNum);
        calcDiffAtkPerc.textContent = `${formatPTBR(diffPerc)}%`;

        // 5. Estilizar ganho/perda
        const gainClass = diffNum >= 0 ? 'diff-gain' : 'diff-loss';
        calcDiffAtkNum.className = gainClass;
        calcDiffAtkPerc.className = gainClass;

        // 6. Mostrar área de resultado
        calcResultAreaAtk.style.display = 'block';

        // 7. Logar
        logToHistory(`Cálculo ATK:\n  - Base: ${formatPTBR(charData.baseAtk)} + ${formatPTBR(adtAtk)}\n  - Percent: ${formatPTBR(newPercent)}%\n  - Original: ${formatPTBR(charData.totalBaseAtk)} | Novo: ${formatPTBR(newTotalAtk)}\n  - Ganho: ${formatPTBR(diffNum)} (${formatPTBR(diffPerc)}%)`);
    });

    // --- Seção HP ---
    const calcAdtHp = document.getElementById('calc-adt-hp');
    const calcNewPercentHp = document.getElementById('calc-new-percent-hp');
    const calcSubmitHp = document.getElementById('calc-submit-hp');
    
    const calcResultHp = document.getElementById('calc-result-hp');
    const calcDiffHpNum = document.getElementById('calc-diff-hp-num');
    const calcDiffHpPerc = document.getElementById('calc-diff-hp-perc');

    calcSubmitHp.addEventListener('click', () => {
        // 1. Coletar valores adicionais
        const adtHp = parseFloat(calcAdtHp.value) || 0;
        const newPercent = parseFloat(calcNewPercentHp.value) || charData.percentHp;

        // 2. Calcular novo base e novo total (Fórmula 2)
        const newBaseHp = charData.baseHp + adtHp;
        const newTotalHp = (newBaseHp * newPercent / 100) + newBaseHp;

        // 3. Calcular diferenças
        const diffNum = newTotalHp - charData.totalBaseHp;
        const diffPerc = charData.totalBaseHp > 0 ? ((newTotalHp / charData.totalBaseHp) - 1) * 100 : (newTotalHp > 0 ? Infinity : 0);

        // 4. Exibir resultados
        calcResultHp.textContent = formatPTBR(newTotalHp);
        calcDiffHpNum.textContent = formatPTBR(diffNum);
        calcDiffHpPerc.textContent = `${formatPTBR(diffPerc)}%`;

        // 5. Estilizar ganho/perda
        const gainClass = diffNum >= 0 ? 'diff-gain' : 'diff-loss';
        calcDiffHpNum.className = gainClass;
        calcDiffHpPerc.className = gainClass;

        // 6. Mostrar área de resultado
        calcResultAreaHp.style.display = 'block';

        // 7. Logar
        logToHistory(`Cálculo HP:\n  - Base: ${formatPTBR(charData.baseHp)} + ${formatPTBR(adtHp)}\n  - Percent: ${formatPTBR(newPercent)}%\n  - Original: ${formatPTBR(charData.totalBaseHp)} | Novo: ${formatPTBR(newTotalHp)}\n  - Ganho: ${formatPTBR(diffNum)} (${formatPTBR(diffPerc)}%)`);
    });

});