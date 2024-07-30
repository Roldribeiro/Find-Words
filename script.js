document.addEventListener('DOMContentLoaded', function() {
    let palavras;
    let palavrasUsadas = {};
    let ultimosUsos = {};
    let ranking = {};

    const categoriaElemento = document.getElementById('categoria');
    const numeroCaracteresElemento = document.getElementById('numero-caracteres');
    const progressoElemento = document.getElementById('progresso');
    const tentativasElemento = document.getElementById('tentativas');
    const tentativaInput = document.getElementById('tentativa');
    const tentarButton = document.getElementById('tentar');
    const letrasErradasElemento = document.getElementById('letras-erradas');
    const selecionarCategoria = document.getElementById('selecionar-categoria');
    const novaPalavraInput = document.getElementById('nova-palavra');
    const iniciarJogoButton = document.getElementById('iniciar-jogo');
    const listaRanking = document.getElementById('lista-ranking');
    const palavraAtualElemento = document.getElementById('palavra-atual');

    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.close-btn');
    const nomeVencedorPopup = document.getElementById('nome-vencedor-popup');
    const salvarVencedorPopupBtn = document.getElementById('salvar-vencedor-popup');

    // Elementos de áudio para sons
    const letraCertaSom = document.getElementById('letra-certa-som');
    const letraErradaSom = document.getElementById('letra-errada-som');

    // Verificar se os elementos de áudio estão carregados
    letraCertaSom.addEventListener('canplaythrough', () => console.log('letraCertaSom pronto para tocar'));
    letraErradaSom.addEventListener('canplaythrough', () => console.log('letraErradaSom pronto para tocar'));

    closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    salvarVencedorPopupBtn.addEventListener('click', function() {
        const nomeVencedor = nomeVencedorPopup.value.trim();
        if (nomeVencedor !== '') {
            adicionarAoRanking(nomeVencedor);
            nomeVencedorPopup.value = '';
            popup.style.display = 'none';
        } else {
            alert('Por favor, insira o nome do vencedor.');
        }
    });

    let palavraAtual = '';
    let letrasCertas = new Set();
    let letrasErradas = new Set();
    let tentativasErradas = 0;
    const maxTentativas = 50;

    function carregarPalavras() {
        fetch('palavras.json')
            .then(response => response.json())
            .then(data => {
                palavras = data;
                preencherSelecionarCategoria();
            })
            .catch(error => console.error('Erro ao carregar as palavras:', error));
    }

    function preencherSelecionarCategoria() {
        selecionarCategoria.innerHTML = '';
        Object.keys(palavras).forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selecionarCategoria.appendChild(option);
        });
    }

    function escolherPalavra() {
        const categoriaSelecionada = selecionarCategoria.value;
        const novaPalavra = novaPalavraInput.value.trim();

        if (novaPalavra) {
            palavraAtual = novaPalavra;
            categoriaElemento.textContent = `Categoria: Personalizada`;
        } else {
            const palavrasDisponiveis = palavras[categoriaSelecionada].filter(palavra => !palavrasUsadas[palavra]);

            if (palavrasDisponiveis.length === 0) {
                palavrasUsadas = {};
                return escolherPalavra();
            }

            palavraAtual = palavrasDisponiveis[Math.floor(Math.random() * palavrasDisponiveis.length)];
            palavrasUsadas[palavraAtual] = true;
            ultimosUsos[categoriaSelecionada] = Date.now();
            categoriaElemento.textContent = `Categoria: ${categoriaSelecionada}`;
        }
        console.log(`Palavra escolhida: ${palavraAtual}`); // Revelar a palavra no console
        numeroCaracteresElemento.textContent = `Número de Letras: ${contarCaracteres(palavraAtual)}`;
        atualizarProgresso();
        tentativasElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
        atualizarLetrasErradas();
        palavraAtualElemento.textContent = `Palavra Atual: ${palavraAtual}`; // Atualiza a palavra na nova posição
    }

    function removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function contarCaracteres(palavra) {
        return palavra.replace(/\s/g, '').length;
    }

    function atualizarProgresso() {
        progressoElemento.innerHTML = palavraAtual.split('').map(letra => {
            if (letra === ' ') {
                return '   '; // Três espaços para separar palavras
            }
            const letraSemAcento = removerAcentos(letra).toLowerCase();
            if (letrasCertas.has(letraSemAcento)) {
                return letra;
            } else if (letrasErradas.has(letraSemAcento)) {
                return `<span style="color: red;">${letra}</span>`;
            } else {
                return '_';
            }
        }).join(' ').replace(/ {3}/g, '   '); // Adiciona um espaço após cada underscore e substitui três espaços por três espaços consecutivos
    }

    function atualizarLetrasErradas() {
        letrasErradasElemento.innerHTML = 'Letras erradas: ' + Array.from(letrasErradas).map(letra => {
            return `<span style="color: red;">${letra}</span>`;
        }).join(', ');
    }

    function verificarFimDeJogo() {
        if (tentativasErradas >= maxTentativas) {
            alert(`Que pena! A palavra era "${palavraAtual}"`);
            reiniciarJogo();
        } else if (Array.from(removerAcentos(palavraAtual.toLowerCase())).every(letra => letrasCertas.has(letra))) {
            popup.style.display = 'block';
        }
    }

    function adicionarAoRanking(nomeVencedor) {
        if (!ranking[nomeVencedor]) {
            ranking[nomeVencedor] = 0;
        }
        ranking[nomeVencedor]++;
        atualizarRanking();
    }

    function atualizarRanking() {
        listaRanking.innerHTML = '';
        const rankingArray = Object.entries(ranking).sort((a, b) => b[1] - a[1]);
        rankingArray.forEach(([nome, pontos]) => {
            const li = document.createElement('li');
            li.textContent = `${nome}: ${pontos} pontos`;
            listaRanking.appendChild(li);
        });
    }

    function reiniciarJogo() {
        palavraAtual = '';
        letrasCertas.clear();
        letrasErradas.clear();
        tentativasErradas = 0;
        escolherPalavra();
    }

    function tentar() {
        const tentativa = tentativaInput.value.trim().toLowerCase();
        tentativaInput.value = '';

        if (tentativa.length === 0) {
            
            return;
        }

        if (tentativa.length > 1) {
            if (removerAcentos(tentativa) === removerAcentos(palavraAtual.toLowerCase())) {
                palavraAtual.split('').forEach(letra => letrasCertas.add(removerAcentos(letra.toLowerCase())));
                try {
                    letraCertaSom.play(); // Toca o som para a palavra correta
                } catch (e) {
                    console.error('Erro ao tocar o som da letra certa:', e);
                }
            } else {
                tentativasErradas++;
                try {
                    letraErradaSom.play(); // Toca o som para a palavra errada
                } catch (e) {
                    console.error('Erro ao tocar o som da letra errada:', e);
                }
            }
        } else {
            const letraSemAcento = removerAcentos(tentativa);
            if (removerAcentos(palavraAtual.toLowerCase()).includes(letraSemAcento)) {
                palavraAtual.split('').forEach(letra => {
                    if (removerAcentos(letra.toLowerCase()) === letraSemAcento) {
                        letrasCertas.add(letraSemAcento);
                    }
                });
                try {
                    letraCertaSom.play(); // Toca o som para a letra correta
                } catch (e) {
                    console.error('Erro ao tocar o som da letra certa:', e);
                }
            } else {
                if (!letrasErradas.has(letraSemAcento)) {
                    letrasErradas.add(letraSemAcento);
                    tentativasErradas++;
                    try {
                        letraErradaSom.play(); // Toca o som para a letra errada
                    } catch (e) {
                        console.error('Erro ao tocar o som da letra errada:', e);
                    }
                }
            }
        }

        atualizarProgresso();
        tentativasElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
        atualizarLetrasErradas();
        verificarFimDeJogo();
    }

    tentarButton.addEventListener('click', tentar);
    tentativaInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            tentar();
        }
    });
    iniciarJogoButton.addEventListener('click', reiniciarJogo);

    carregarPalavras();
});
