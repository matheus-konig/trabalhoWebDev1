
const ola = document.getElementById('ola');
const resumo = document.getElementById('resumo');
const listaHoje = document.getElementById('listaHoje');
const barra = document.getElementById('barra');

PAGINAS.inicio = desenharInicio;

function desenharInicio() {
  ola.textContent = perfil.nome ? `Olá, ${perfil.nome}!` : '';
  ola.hidden = !perfil.nome;

  if (habitos.length === 0) {
    listaHoje.innerHTML = VAZIO;
    resumo.textContent = '';
    atualizarBarra(0);
    return;
  }

  listaHoje.innerHTML = habitos.map(h => {
    const feito = feitoHoje(h);
    const seq = sequencia(h);
    return `
      <div class="habito ${feito ? 'feito' : ''}">
        <input type="checkbox" class="form-check-input" id="h${h.id}" data-id="${h.id}" ${feito ? 'checked' : ''}>
        <label for="h${h.id}">${esc(nomeHabito(h))}
          <span class="badge badge-cat">${esc(nomeCategoria(h))}</span></label>
        <span>${seq} ${seq === 1 ? 'dia seguido' : 'dias seguidos'}</span>
      </div>`;
  }).join('');

  const feitos = habitos.filter(feitoHoje).length;
  let texto = `${feitos} de ${habitos.length} concluídos hoje`;
  if (perfil.metaDiaria) {
    if (feitos >= perfil.metaDiaria) {
      texto += ` · meta diária de ${perfil.metaDiaria} atingida!`;
    } else {
      texto += ` · meta diária: ${perfil.metaDiaria}`;
    }
  }
  resumo.textContent = texto;
  atualizarBarra(Math.round(feitos / habitos.length * 100));
}

function atualizarBarra(pct) {
  barra.style.width = pct + '%';
  barra.parentElement.setAttribute('aria-valuenow', pct);
}

function alternar(id) {
  const h = habitos.find(x => x.id === id);
  if (!h) return;

  if (feitoHoje(h)) {
    registros = registros.filter(r => !(r.habitoId === id && r.data === hoje()));
  } else {
    registros.push({ id: Date.now(), habitoId: id, data: hoje() });
  }
  salvar();
}

listaHoje.addEventListener('change', e => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  alternar(id);
  desenharInicio();
});

const formNovo = document.getElementById('formNovo');
const novoNome = document.getElementById('novoNome');
const novoCategoria = document.getElementById('novoCategoria');
const novoMeta = document.getElementById('novoMeta');
const avisoNovo = document.getElementById('avisoNovo');
const cancelarNovo = document.getElementById('cancelarNovo');

PAGINAS.novo = prepararNovo;

function prepararNovo() {
  avisoNovo.hidden = true;
}

formNovo.addEventListener('submit', e => {
  e.preventDefault();
  const dados = lerFormularioHabito(novoNome, novoCategoria, novoMeta, avisoNovo);
  if (!dados) return;

  habitos.push({ id: Date.now(), ...dados });
  salvar();
  formNovo.reset();
  avisar('Hábito criado!');
  location.hash = '#inicio';
});

cancelarNovo.addEventListener('click', () => {
  formNovo.reset();
  location.hash = '#inicio';
});