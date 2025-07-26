const binId = "688170747b4b8670d8a644bd";
const apiKey = "$2a$10$3lkYs/aCgaVcJYyFIJbcmeeMi2Az8ppeMpQNgZXNJbCdqMsSQIb.q";
const baseUrl = `https://api.jsonbin.io/v3/b/${binId}`;
let escolaSelecionada = "";

async function carregarDados() {
    const res = await fetch(baseUrl + "/latest", {
    headers: { "X-Master-Key": apiKey }
    });
    const data = await res.json();
    return data.record || {};
}

async function salvarDados(dados) {
    await fetch(baseUrl, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey
    },
    body: JSON.stringify(dados)
    });
}

function mostrarPainel(id, btn) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.painel').forEach(p => p.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'painelNotas') atualizarNotas();
    if (id === 'painelAvisos') atualizarAvisos();
}

function mascararCPF(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

async function verificarSenha() {
    const escola = document.getElementById("escolaLogin").value;
    const senha = document.getElementById("senhaLogin").value.trim();
    const dados = await carregarDados();
    if (dados.escolas?.[escola]?.senha === senha) {
    escolaSelecionada = escola;
    document.getElementById("telaLogin").classList.add("hidden");
    document.getElementById("painelPrincipal").classList.remove("hidden");
    } else {
    alert("Senha incorreta.");
    }
}

async function preencherEscolas() {
    const dados = await carregarDados();
    const select = document.getElementById("escolaLogin");
    for (const escola in dados.escolas) {
    const opt = document.createElement("option");
    opt.value = escola;
    opt.textContent = escola;
    select.appendChild(opt);
    }
}

document.getElementById("cadastroForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    let cpf = document.getElementById("cpf").value.trim();
    cpf = cpf.replace(/\D/g, '');
    const nome = document.getElementById("nome").value.trim();
    const serie = document.getElementById("serie").value.trim();

    const dados = await carregarDados();
    dados[cpf] = { nome, escola: escolaSelecionada, serie, notas: {}, frequencia: {}, avisos: [] };
    await salvarDados(dados);
    this.reset();
    alert("Aluno cadastrado!");
});

async function atualizarNotas() {
    const container = document.getElementById("listaNotas");
    container.innerHTML = "";
    const dados = await carregarDados();
    for (const cpf in dados) {
        if (cpf === "escolas") continue;
        const aluno = dados[cpf];
        if (aluno.escola !== escolaSelecionada) continue;
        const div = document.createElement("div");
        div.className = "aluno-card";
        div.innerHTML = `
            <strong>${aluno.nome}</strong> (${aluno.serie})<br>
            <label>Português: <input type="number" id="pt-${cpf}" value="${aluno.notas?.['Português'] || ''}"></label><br>
            <label>Matemática: <input type="number" id="mat-${cpf}" value="${aluno.notas?.['Matemática'] || ''}"></label><br>
            <label>Ciências: <input type="number" id="cien-${cpf}" value="${aluno.notas?.['Ciências'] || ''}"></label><br>
            <label>História: <input type="number" id="hist-${cpf}" value="${aluno.notas?.['História'] || ''}"></label><br>
            <label>Geografia: <input type="number" id="geo-${cpf}" value="${aluno.notas?.['Geografia'] || ''}"></label><br>
            <label>Inglês: <input type="number" id="ing-${cpf}" value="${aluno.notas?.['Inglês'] || ''}"></label><br>
            <label>Frequência: <input type="text" id="freq-${cpf}" placeholder="25/07 - presente"></label><br>
            <button class="botao" style="padding: 10px 10px" onclick="salvarNotasFrequencia('${cpf}')">Salvar</button>
        `;
        container.appendChild(div);
    }
}

async function salvarNotasFrequencia(cpf) {
    const dados = await carregarDados();
    const aluno = dados[cpf];

    aluno.notas = {
        "Português": parseFloat(document.getElementById(`pt-${cpf}`).value) || 0,
        "Matemática": parseFloat(document.getElementById(`mat-${cpf}`).value) || 0,
        "Ciências": parseFloat(document.getElementById(`cien-${cpf}`).value) || 0,
        "História": parseFloat(document.getElementById(`hist-${cpf}`).value) || 0,
        "Geografia": parseFloat(document.getElementById(`geo-${cpf}`).value) || 0,
        "Inglês": parseFloat(document.getElementById(`ing-${cpf}`).value) || 0
    };

    const entrada = document.getElementById(`freq-${cpf}`).value.trim();
    if (entrada) {
        const [data, status] = entrada.split('-').map(e => e.trim());
        const hoje = new Date();
        const semana = `Semana_${Math.ceil(hoje.getDate() / 7)}`;
        aluno.frequencia[semana] = aluno.frequencia[semana] || {};
        aluno.frequencia[semana][data] = status.toLowerCase();
    }

    await salvarDados(dados);
    alert("Notas e frequência salvos!");
}


async function atualizarAvisos() {
    const container = document.getElementById("listaAvisos");
    container.innerHTML = "";
    const dados = await carregarDados();
    for (const cpf in dados) {
    if (cpf === "escolas") continue;
    const aluno = dados[cpf];
    if (aluno.escola !== escolaSelecionada) continue;
    const div = document.createElement("div");
    div.className = "aluno-card";
    div.innerHTML = `
        <strong>${aluno.nome}</strong> (${aluno.serie})<br>
        <label>Novo Aviso:
        <input type="text" id="aviso-${cpf}" placeholder="Digite o aviso">
        </label><br>
        <button class="botao" style="padding: 10px 10px onclick="salvarAviso('${cpf}')">Adicionar Aviso</button><br><br>
    `;
    container.appendChild(div);
    }
}

async function salvarAviso(cpf) {
    const input = document.getElementById(`aviso-${cpf}`);
    const texto = input.value.trim();
    if (!texto) return;
    const dados = await carregarDados();
    dados[cpf].avisos.push(texto);
    await salvarDados(dados);
    input.value = "";
    atualizarAvisos();
}

preencherEscolas();