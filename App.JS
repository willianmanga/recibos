// ============================================================
// CONFIGURAÇÃO — substitua com suas credenciais do Supabase
// ============================================================
const SUPABASE_URL = 'https://ghioifouqhrcrskkhywz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaW9pZm91cWhyY3Jza2toeXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzA5OTQsImV4cCI6MjA4OTAwNjk5NH0.npZ-CBnrzl88NSCUy1th1Akij5WjTRoURPMGqexAW2s';
// ============================================================

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let funcionarios = [{ nome: '', cpf: '', valor: '' }];
let todosRecibos = [];
let currentUser = null;

// ─── AUTH ────────────────────────────────────────────────────

async function login() {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-password').value;
  document.getElementById('auth-error').textContent = '';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) {
    document.getElementById('auth-error').textContent = 'E-mail ou senha incorretos.';
    return;
  }
  currentUser = data.user;
  iniciarApp();
}

async function logout() {
  await sb.auth.signOut();
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    currentUser = data.session.user;
    iniciarApp();
  }
}

function iniciarApp() {
  const email = currentUser.email;
  const initials = email.substring(0, 2).toUpperCase();
  document.getElementById('user-initials').textContent = initials;
  document.getElementById('user-name-display').textContent = email.split('@')[0];
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  renderFuncs();
  carregarDashboard();
  carregarHistorico();
}

// ─── NAVEGAÇÃO ───────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  event.currentTarget.classList.add('active');
  if (id === 'historico') carregarHistorico();
  if (id === 'dashboard') carregarDashboard();
}

// ─── VALOR POR EXTENSO ───────────────────────────────────────

function valorPorExtenso(v) {
  const raw = String(v).replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return 'VALOR EM BRANCO';
  const cents = Math.round((n % 1) * 100);
  const inteiro = Math.floor(n);
  const u = ['', 'UM', 'DOIS', 'TRÊS', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE',
    'DEZ', 'ONZE', 'DOZE', 'TREZE', 'QUATORZE', 'QUINZE', 'DEZESSEIS', 'DEZESSETE', 'DEZOITO', 'DEZENOVE'];
  const d = ['', '', 'VINTE', 'TRINTA', 'QUARENTA', 'CINQUENTA', 'SESSENTA', 'SETENTA', 'OITENTA', 'NOVENTA'];
  const c = ['', 'CEM', 'DUZENTOS', 'TREZENTOS', 'QUATROCENTOS', 'QUINHENTOS',
    'SEISCENTOS', 'SETECENTOS', 'OITOCENTOS', 'NOVECENTOS'];
  const m = (n) => {
    if (n === 0) return '';
    let s = '';
    if (n >= 100) { s += c[Math.floor(n / 100)]; n %= 100; if (n > 0) s += ' E '; }
    if (n >= 20) { s += d[Math.floor(n / 10)]; n %= 10; if (n > 0) s += ' E '; }
    if (n > 0) s += u[n];
    return s;
  };
  let res = '';
  if (inteiro >= 1000) {
    const mi = Math.floor(inteiro / 1000);
    res += m(mi) + (mi === 1 ? ' MIL' : ' MIL');
    const r = inteiro % 1000;
    if (r > 0) res += ' E ' + m(r);
  } else if (inteiro > 0) {
    res = m(inteiro);
  }
  if (cents > 0) {
    if (res) res += ' E ';
    res += m(cents) + ' CENTAVOS';
  }
  if (inteiro > 1 && cents === 0) res += ' REAIS';
  else if (inteiro === 1 && cents === 0) res += ' REAL';
  else if (inteiro > 0) res += ' REAIS';
  return res.trim();
}

function formatValor(v) {
  const raw = String(v).replace(',', '.').replace(/[^\d.]/g, '');
  const n = parseFloat(raw);
  if (isNaN(n)) return 'R$0,00';
  return 'R$' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// ─── FORMULÁRIO DE FUNCIONÁRIOS ──────────────────────────────

function addFunc() {
  funcionarios.push({ nome: '', cpf: '', valor: '' });
  renderFuncs();
}

function removeFunc(i) {
  if (funcionarios.length === 1) return;
  funcionarios.splice(i, 1);
  renderFuncs();
}

function renderFuncs() {
  const tbody = document.getElementById('func-body');
  tbody.innerHTML = '';
  funcionarios.forEach((f, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" placeholder="NOME COMPLETO" value="${f.nome}"
        oninput="funcionarios[${i}].nome=this.value.toUpperCase();this.value=funcionarios[${i}].nome;atualizarPreview()" style="text-transform:uppercase"/></td>
      <td><input type="text" placeholder="000.000.000-00" value="${f.cpf}"
        oninput="funcionarios[${i}].cpf=this.value;atualizarPreview()"/></td>
      <td><input type="text" placeholder="0,00" value="${f.valor}"
        oninput="funcionarios[${i}].valor=this.value;atualizarPreview()"/></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeFunc(${i})">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
  atualizarPreview();
}

// ─── PREVIEW ─────────────────────────────────────────────────

function buildTextoRecibo(f) {
  const mesRef = document.getElementById('f-mes-ref').value;
  const dia = document.getElementById('f-dia').value;
  const mesRec = document.getElementById('f-mes-recibo').value;
  const anoRec = document.getElementById('f-ano-recibo').value;
  const nome = (f.nome || '**NOME**').toUpperCase();
  const cpf = f.cpf || '*****';
  const vFmt = formatValor(f.valor);
  const vExt = valorPorExtenso(f.valor);
  const texto = `Eu ${nome}, Portador(a) do CPF de nº${cpf} ,declaro que recebi a quantia de ${vFmt} (${vExt})\u00a0 da empresa Administradora Cartão de Todos Ceilândia LTDA, inscrita no CNPJ 29.334.427/0001-08, referente a premiação por atingimento de meta do mês de ${mesRef}.`;
  const data = `BRASÍLIA-DF ${dia} DE ${mesRec} ${anoRec}.`;
  return { texto, data };
}

function atualizarPreview() {
  const f = funcionarios[0];
  const { texto, data } = buildTextoRecibo(f);
  document.getElementById('preview-box').innerHTML =
    `<strong>RECIBO</strong>${texto}\n\n${data}\n\n____________________________________\nASSINATURA`;
}

// ─── SALVAR NO SUPABASE ──────────────────────────────────────

async function salvarRecibos() {
  const validos = funcionarios.filter(f => f.nome.trim() && f.cpf.trim() && f.valor.trim());
  if (validos.length === 0) { toast('Preencha ao menos um funcionário completo.', true); return null; }

  const setor = document.getElementById('f-setor').value;
  const mesRef = document.getElementById('f-mes-ref').value;
  const anoRef = document.getElementById('f-ano-ref').value;
  const dia = document.getElementById('f-dia').value;
  const mesRec = document.getElementById('f-mes-recibo').value;
  const anoRec = document.getElementById('f-ano-recibo').value;

  const rows = validos.map(f => ({
    setor,
    nome: f.nome.trim().toUpperCase(),
    cpf: f.cpf.trim(),
    valor: parseFloat(String(f.valor).replace(',', '.').replace(/[^\d.]/g, '')) || 0,
    mes_referencia: mesRef,
    ano_referencia: parseInt(anoRef),
    dia_recibo: parseInt(dia),
    mes_recibo: mesRec,
    ano_recibo: parseInt(anoRec),
    criado_por: currentUser.email,
  }));

  const { error } = await sb.from('recibos').insert(rows);
  if (error) { toast('Erro ao salvar: ' + error.message, true); return null; }
  toast('Recibos salvos com sucesso!');
  carregarHistorico();
  carregarDashboard();
  return { validos, setor, mesRef, anoRef, dia, mesRec, anoRec };
}

// ─── EXCEL ───────────────────────────────────────────────────

async function salvarESalvar() {
  const result = await salvarRecibos();
  if (!result) return;
  gerarExcel(result);
}

function gerarExcel(result) {
  const { validos, setor, mesRef, dia, mesRec, anoRec } = result;
  const wb = XLSX.utils.book_new();
  const wsData = [];

  validos.forEach((f, idx) => {
    const { texto, data } = buildTextoRecibo(f);
    wsData.push(['RECIBO']);
    wsData.push(['']);
    wsData.push([texto]);
    wsData.push(['']);
    wsData.push([data]);
    wsData.push(['']);
    wsData.push(['']);
    wsData.push(['']);
    wsData.push(['\u00a0____________________________________']);
    wsData.push(['\u00a0ASSINATURA']);
    if (idx < validos.length - 1) {
      wsData.push(['']);
      wsData.push(['']);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 120 }];
  XLSX.utils.book_append_sheet(wb, ws, setor);
  XLSX.writeFile(wb, `Recibos_${setor}_${mesRef}.xlsx`);
}

// ─── PDF ─────────────────────────────────────────────────────

async function salvarEPDF() {
  const result = await salvarRecibos();
  if (!result) return;
  gerarPDF(result);
}

function gerarPDF(result) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { validos } = result;
  const setor = document.getElementById('f-setor').value;

  validos.forEach((f, idx) => {
    if (idx > 0) doc.addPage();
    const { texto, data } = buildTextoRecibo(f);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RECIBO', 20, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(texto, 170);
    doc.text(lines, 20, 45);
    const yData = 45 + lines.length * 7;
    doc.text(data, 20, yData + 10);
    doc.text('____________________________________', 20, yData + 35);
    doc.text('ASSINATURA', 20, yData + 42);
  });

  const mesRef = document.getElementById('f-mes-ref').value;
  doc.save(`Recibos_${setor}_${mesRef}.pdf`);
}

// ─── DASHBOARD ───────────────────────────────────────────────

async function carregarDashboard() {
  const { data } = await sb.from('recibos').select('*').order('created_at', { ascending: false });
  if (!data) return;

  document.getElementById('stat-total').textContent = data.length;

  const now = new Date();
  const meses = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  const mesAtual = meses[now.getMonth()];
  const doMes = data.filter(r => r.mes_referencia === mesAtual && r.ano_referencia === now.getFullYear());
  document.getElementById('stat-mes').textContent = doMes.length;
  document.getElementById('stat-mes-label').textContent = mesAtual + ' ' + now.getFullYear();

  const total = data.reduce((s, r) => s + (parseFloat(r.valor) || 0), 0);
  document.getElementById('stat-valor').textContent = 'R$' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const recentes = data.slice(0, 5);
  const dashEl = document.getElementById('dash-recentes');
  if (recentes.length === 0) {
    dashEl.innerHTML = '<div class="empty-state"><div class="icon">◎</div><p>Nenhum recibo ainda</p></div>';
    return;
  }
  dashEl.innerHTML = `
    <table class="hist-table">
      <thead><tr><th>Nome</th><th>Setor</th><th>Mês ref.</th><th>Valor</th></tr></thead>
      <tbody>
        ${recentes.map(r => `
          <tr>
            <td>${r.nome}</td>
            <td><span class="badge-setor">${r.setor}</span></td>
            <td>${r.mes_referencia}/${r.ano_referencia}</td>
            <td>R$${parseFloat(r.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ─── HISTÓRICO ───────────────────────────────────────────────

async function carregarHistorico() {
  document.getElementById('hist-content').innerHTML = '<div class="loading"><div class="spinner"></div> Carregando...</div>';
  const { data } = await sb.from('recibos').select('*').order('created_at', { ascending: false });
  todosRecibos = data || [];
  filtrarHistorico();
}

function filtrarHistorico() {
  const busca = document.getElementById('hist-busca').value.toLowerCase();
  const setor = document.getElementById('hist-setor').value;
  const mes = document.getElementById('hist-mes').value;

  const filtrados = todosRecibos.filter(r => {
    const nomeOk = !busca || r.nome.toLowerCase().includes(busca) || r.cpf.includes(busca);
    const setorOk = !setor || r.setor === setor;
    const mesOk = !mes || r.mes_referencia === mes;
    return nomeOk && setorOk && mesOk;
  });

  renderHistorico(filtrados);
}

function renderHistorico(lista) {
  const el = document.getElementById('hist-content');
  if (lista.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">◎</div><p>Nenhum recibo encontrado</p></div>';
    return;
  }
  el.innerHTML = `
    <table class="hist-table">
      <thead>
        <tr>
          <th>Nome</th><th>CPF</th><th>Setor</th><th>Mês ref.</th><th>Valor</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(r => `
          <tr>
            <td>${r.nome}</td>
            <td style="color:var(--text3)">${r.cpf}</td>
            <td><span class="badge-setor">${r.setor}</span></td>
            <td>${r.mes_referencia}/${r.ano_referencia}</td>
            <td>R$${parseFloat(r.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-outline btn-sm" onclick="baixarExcelUnico(${r.id})">Excel</button>
                <button class="btn btn-gold btn-sm" onclick="baixarPDFUnico(${r.id})">PDF</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function baixarExcelUnico(id) {
  const r = todosRecibos.find(x => x.id === id);
  if (!r) return;
  const f = { nome: r.nome, cpf: r.cpf, valor: r.valor };
  // Temporarily set form values for buildTextoRecibo
  const prev = {
    mesRef: document.getElementById('f-mes-ref').value,
    dia: document.getElementById('f-dia').value,
    mesRec: document.getElementById('f-mes-recibo').value,
    anoRec: document.getElementById('f-ano-recibo').value,
  };
  document.getElementById('f-mes-ref').value = r.mes_referencia;
  document.getElementById('f-dia').value = r.dia_recibo;
  document.getElementById('f-mes-recibo').value = r.mes_recibo;
  document.getElementById('f-ano-recibo').value = r.ano_recibo;
  gerarExcel({ validos: [f], setor: r.setor, mesRef: r.mes_referencia, dia: r.dia_recibo, mesRec: r.mes_recibo, anoRec: r.ano_recibo });
  // Restore
  document.getElementById('f-mes-ref').value = prev.mesRef;
  document.getElementById('f-dia').value = prev.dia;
  document.getElementById('f-mes-recibo').value = prev.mesRec;
  document.getElementById('f-ano-recibo').value = prev.anoRec;
}

function baixarPDFUnico(id) {
  const r = todosRecibos.find(x => x.id === id);
  if (!r) return;
  const f = { nome: r.nome, cpf: r.cpf, valor: r.valor };
  document.getElementById('f-mes-ref').value = r.mes_referencia;
  document.getElementById('f-dia').value = r.dia_recibo;
  document.getElementById('f-mes-recibo').value = r.mes_recibo;
  document.getElementById('f-ano-recibo').value = r.ano_recibo;
  gerarPDF({ validos: [f] });
}

// ─── TOAST ───────────────────────────────────────────────────

function toast(msg, err = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (err ? ' error' : '');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── INIT ────────────────────────────────────────────────────

checkSession();
