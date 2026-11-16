const categorias = [
  { id: 1, nome: 'Saúde' },
  { id: 2, nome: 'Estudo' },
  { id: 3, nome: 'Livrar-se de um mau hábito' },
  { id: 4, nome: 'Treino' },
  { id: 5, nome: 'Alimentação' }
];

function carregar(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor ?? padrao;
  } catch {
    return padrao;
  }
}

let habitos = carregar('habitos', []);
let registros = carregar('registros', []);
let perfil = carregar('perfil', { nome: '', metaDiaria: null });

try {
  localStorage.removeItem('categorias');
} catch {}

function salvar() {
  try {
    localStorage.setItem('habitos', JSON.stringify(habitos));
    localStorage.setItem('registros', JSON.stringify(registros));
    localStorage.setItem('perfil', JSON.stringify(perfil));
  } catch {
    alert('Não foi possível salvar os dados neste navegador.');
  }
}

function hoje() {
  return new Date().toLocaleDateString('sv-SE');
}

function diasAtras(n) {
  const data = new Date();
  data.setDate(data.getDate() - n);
  return data.toLocaleDateString('sv-SE');
}

function diaSeguinte(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia + 1).toLocaleDateString('sv-SE');
}

function formatarData(texto) {
  const [, mes, dia] = texto.split('-');
  return dia + '/' + mes;
}

function nomeHabito(h) {
  return h.nome || 'Hábito sem nome';
}

function nomeCategoria(h) {
  const categoria = categorias.find(c => c.id === h.categoriaId);
  return categoria ? categoria.nome : 'Sem categoria';
}

function datasDe(h) {
  return registros.filter(r => r.habitoId === h.id).map(r => r.data);
}

function feitoHoje(h) {
  return datasDe(h).includes(hoje());
}

function contarSequencia(datas) {
  let n = datas.includes(hoje()) ? 0 : 1;
  let total = 0;
  while (datas.includes(diasAtras(n))) {
    total++;
    n++;
  }
  return total;
}

function sequencia(h) {
  return contarSequencia(datasDe(h));
}

function melhorSequencia(datas) {
  const ordenadas = [...new Set(datas)].sort();
  let melhor = 0;
  let atual = 0;
  let anterior = null;
  for (const data of ordenadas) {
    if (anterior && diaSeguinte(anterior) === data) {
      atual++;
    } else {
      atual = 1;
    }
    if (atual > melhor) melhor = atual;
    anterior = data;
  }
  return melhor;
}

function diasRegistrados() {
  return [...new Set(registros.map(r => r.data))].sort();
}

function esc(texto) {
  const trocas = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, letra => trocas[letra]);
}