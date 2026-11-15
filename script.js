const mensagem = document.getElementById('mensagem');
const ola = document.getElementById('ola');
const resumo = document.getElementById('resumo');
const listaHoje = document.getElementById('listaHoje');
const barra = document.getElementById('barra');

const busca = document.getElementById('busca');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroStatus = document.getElementById('filtroStatus');
const limparFiltros = document.getElementById('limparFiltros');
const contador = document.getElementById('contador');
const listaHabitos = document.getElementById('listaHabitos');

const modalEditar = document.getElementById('modalEditar');
const editNome = document.getElementById('editNome');
const editCategoria = document.getElementById('editCategoria');
const editMeta = document.getElementById('editMeta');
const avisoEditar = document.getElementById('avisoEditar');
const salvarEdicao = document.getElementById('salvarEdicao');

const formNovo = document.getElementById('formNovo');
const novoNome = document.getElementById('novoNome');
const novoCategoria = document.getElementById('novoCategoria');
const novoMeta = document.getElementById('novoMeta');
const avisoNovo = document.getElementById('avisoNovo');
const cancelarNovo = document.getElementById('cancelarNovo');

const formPerfil = document.getElementById('formPerfil');
const perfilNome = document.getElementById('perfilNome');
const perfilMeta = document.getElementById('perfilMeta');
const avisoPerfil = document.getElementById('avisoPerfil');
const totalHabitos = document.getElementById('totalHabitos');
const totalDias = document.getElementById('diasRegistrados');
const habitoTop = document.getElementById('habitoTop');

const VAZIO = '<p>Nenhum hábito ainda. <a href="#novo">Crie o primeiro!</a></p>';

const PAGINAS = {
  inicio: desenharInicio,
  habitos: desenharHabitos,
  progresso: desenharProgresso,
  novo: prepararNovo,
  perfil: desenharPerfil
};

function paginaAtual() {
  const nome = location.hash.slice(1);
  return nome in PAGINAS ? nome : 'inicio';
}

function mostrarPagina() {
  const atual = paginaAtual();

  for (const nome in PAGINAS) {
    const secao = document.getElementById('pagina-' + nome);
    if (secao) {
      secao.hidden = nome !== atual;
    }
  }

  document.querySelectorAll('[data-pagina]').forEach(link => {
    const ativo = link.dataset.pagina === atual;
    link.classList.toggle('active', ativo);
    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  fecharMenu();
  PAGINAS[atual]();
  window.scrollTo(0, 0);
}

function fecharMenu() {
  const menu = document.getElementById('navbarNavAltMarkup');
  let aberto = false;
  try {
    aberto = menu.matches(':modal');
  } catch {
    aberto = menu.open;
  }
  if (aberto) {
    menu.querySelector('[data-bs-dismiss="drawer"]').click();
  }
}

function fecharDialog(dialog) {
  dialog.querySelector('[data-bs-dismiss="dialog"]').click();
}

let timerMensagem;

function avisar(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => {
    mensagem.hidden = true;
  }, 3000);
}

function desenharPerfil() {
  perfilNome.value = perfil.nome || '';
  perfilMeta.value = perfil.metaDiaria ?? '';
  avisoPerfil.hidden = true;

  totalHabitos.textContent = habitos.length;
  totalDias.textContent = diasRegistrados().length;

  let top = null;
  let maior = 0;
  for (const h of habitos) {
    const n = new Set(datasDe(h)).size;
    if (n > maior) {
      maior = n;
      top = h;
    }
  }
  habitoTop.textContent = top ? nomeHabito(top) : '—';
}

formPerfil.addEventListener('submit', e => {
  e.preventDefault();
  const textoMeta = perfilMeta.value.trim();
  const meta = textoMeta === '' ? null : Number(textoMeta);

  if (meta !== null && !(Number.isInteger(meta) && meta >= 1 && meta <= 20)) {
    avisoPerfil.hidden = false;
    perfilMeta.focus();
    return;
  }

  perfil = { nome: perfilNome.value.trim(), metaDiaria: meta };
  salvar();
  avisoPerfil.hidden = true;
  avisar('Perfil salvo.');
});

function preencherCategorias(select, primeiraOpcao) {
  let html = `<option value="">${primeiraOpcao}</option>`;
  for (const c of categorias) {
    html += `<option value="${c.id}">${esc(c.nome)}</option>`;
  }
  select.innerHTML = html;
}

function lerFormularioHabito(campoNome, campoCategoria, campoMeta, aviso) {
  const nome = campoNome.value.trim();
  const categoriaId = Number(campoCategoria.value);
  const valido = nome !== '' && categorias.some(c => c.id === categoriaId);

  aviso.hidden = valido;
  if (!valido) {
    if (nome) {
      campoCategoria.focus();
    } else {
      campoNome.focus();
    }
    return null;
  }

  return { nome, categoriaId, meta: campoMeta.value.trim() };
}

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
    const seq = typeof sequencia === 'function' ? sequencia(h) : contarSequencia(datasDe(h));
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

function desenharHabitos() {
  const texto = busca.value.trim().toLowerCase();
  const categoria = Number(filtroCategoria.value);
  const status = filtroStatus.value;

  const filtrados = habitos.filter(h => {
    if (texto && !nomeHabito(h).toLowerCase().includes(texto)) return false;
    if (categoria && h.categoriaId !== categoria) return false;
    if (status === 'feito' && !feitoHoje(h)) return false;
    if (status === 'pendente' && feitoHoje(h)) return false;
    return true;
  });

  contador.textContent = `${filtrados.length} de ${habitos.length} ${habitos.length === 1 ? 'hábito' : 'hábitos'}`;

  if (habitos.length === 0) {
    listaHabitos.innerHTML = VAZIO;
    return;
  }
  if (filtrados.length === 0) {
    listaHabitos.innerHTML = '<p>Nenhum hábito encontrado com esses filtros.</p>';
    return;
  }

  listaHabitos.innerHTML = filtrados.map(h => `
    <div class="habito ${feitoHoje(h) ? 'feito' : ''}">
      <div class="habito-info">
        <strong>${esc(nomeHabito(h))}</strong>
        <span class="badge badge-cat">${esc(nomeCategoria(h))}</span>
        ${h.meta ? `<small class="d-block">${esc(h.meta)}</small>` : ''}
      </div>
      <button type="button" class="btn btn-verde btn-sm" data-editar="${h.id}"
              data-bs-toggle="dialog" data-bs-target="#modalEditar">Editar</button>
      <button type="button" class="btn btn-perigo btn-sm" data-excluir="${h.id}">Excluir</button>
    </div>`).join('');
}

busca.addEventListener('input', desenharHabitos);
filtroCategoria.addEventListener('input', desenharHabitos);
filtroStatus.addEventListener('input', desenharHabitos);

limparFiltros.addEventListener('click', () => {
  busca.value = '';
  filtroCategoria.value = '';
  filtroStatus.value = '';
  desenharHabitos();
});

listaHabitos.addEventListener('click', e => {
  const editar = e.target.closest('[data-editar]');
  const excluir = e.target.closest('[data-excluir]');
  if (editar) abrirEdicao(Number(editar.dataset.editar));
  if (excluir) excluirHabito(Number(excluir.dataset.excluir));
});

let editandoId = null;

function abrirEdicao(id) {
  const h = habitos.find(x => x.id === id);
  if (!h) return;

  editandoId = id;
  editNome.value = h.nome || '';
  editCategoria.value = categorias.some(c => c.id === h.categoriaId) ? h.categoriaId : '';
  editMeta.value = h.meta || '';
  avisoEditar.hidden = true;
}

salvarEdicao.addEventListener('click', () => {
  const dados = lerFormularioHabito(editNome, editCategoria, editMeta, avisoEditar);
  if (!dados) return;

  const h = habitos.find(x => x.id === editandoId);
  if (h) Object.assign(h, dados);

  salvar();
  fecharDialog(modalEditar);
  desenharHabitos();
  avisar('Hábito atualizado.');
});

function excluirHabito(id) {
  const h = habitos.find(x => x.id === id);
  if (!h || !confirm(`Excluir "${nomeHabito(h)}"? O histórico dele também será apagado.`)) return;

  habitos = habitos.filter(x => x.id !== id);
  registros = registros.filter(r => r.habitoId !== id);
  salvar();
  desenharHabitos();
  avisar('Hábito excluído.');
}


const statSequencia = document.getElementById('statSequencia');
const statMelhor = document.getElementById('statMelhor');
const statTotal = document.getElementById('statTotal');
const ultimos7 = document.getElementById('ultimos7');

function desenharProgresso() {
  const dias = diasRegistrados();
  statSequencia.textContent = contarSequencia(dias);
  statMelhor.textContent = melhorSequencia(dias);
  statTotal.textContent = dias.length;

  const ultimos = [6, 5, 4, 3, 2, 1, 0].map(diasAtras);

  if (habitos.length === 0) {
    ultimos7.innerHTML = VAZIO;
    return;
  }

  ultimos7.innerHTML = habitos.map(h => {
    const datas = datasDe(h);
    const feitos = ultimos.filter(d => datas.includes(d)).length;
    const pct = Math.round(feitos / 7 * 100);

    const quadrados = ultimos.map(d => {
      const f = datas.includes(d);
      const legenda = `${formatarData(d)}: ${f ? 'feito' : 'não feito'}`;
      return `<span class="dia ${f ? 'feito' : ''}" title="${legenda}" aria-label="${legenda}"></span>`;
    }).join('');

    return `
      <div class="habito flex-wrap">
        <strong>${esc(nomeHabito(h))}</strong>
        <div class="ms-auto d-flex gap-1">${quadrados}</div>
        <div class="progress w-100" role="progressbar" aria-label="Últimos 7 dias de ${esc(nomeHabito(h))}"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar" style="width: ${pct}%"></div>
        </div>
        <small>${feitos} de 7 dias</small>
      </div>`;
  }).join('');
}

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

preencherCategorias(filtroCategoria, 'Todas');
preencherCategorias(novoCategoria, 'Escolha uma categoria');
preencherCategorias(editCategoria, 'Escolha uma categoria');

window.addEventListener('hashchange', mostrarPagina);
mostrarPagina();