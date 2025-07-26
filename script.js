document.getElementById('btnConsultar').addEventListener('click', function () {
  const cpfInput = document.getElementById('cpf');
  const cpf = cpfInput.value.replace(/\D/g, '');

  if (!cpf) {
    alert('Por favor, digite o CPF.');
    return;
  }

  const BIN_ID = '688170747b4b8670d8a644bd';
  const API_KEY = '$2a$10$3lkYs/aCgaVcJYyFIJbcmeeMi2Az8ppeMpQNgZXNJbCdqMsSQIb.q';

  fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': API_KEY
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na consulta à base de dados.');
      }
      return response.json();
    })
    .then(json => {
      const dados = json.record[cpf];

if (dados) {
  document.getElementById('titulo').textContent = 'Bem-vindo';
  document.getElementById('descricao2').textContent = dados.escola;
  document.getElementById('descricao1').textContent = '--------------------------------------';
  document.getElementById('subtitulo').textContent = dados.nome;
  document.getElementById('subtitulo').style.fontSize = "24px";
  document.getElementById('areaImagem').classList.add('visivel');

  cpfInput.remove();

  document.getElementById('campoExtra').innerHTML = `
  <p class="descricao">--------------------------------------</p>
    <p class="descricao">Série do aluno: ${dados.serie}</p>
    <p class="descricao">--------------------------------------</p>
  `;

  const btn = document.getElementById('btnConsultar');
  btn.textContent = 'Sair';
  btn.onclick = () => window.location.href = 'index.html';
  const imagemDiv = document.getElementById('areaImagem');

  let htmlNotas = '<ul>';
  for (const [disciplina, nota] of Object.entries(dados.notas)) {
    htmlNotas += `<li>${disciplina}: <strong>${nota}</strong></li>`;
  }
  htmlNotas += '</ul>';

  let htmlAvisos = '<ul>';
  for (const aviso of dados.avisos) {
    htmlAvisos += `<li>${aviso}</li>`;
  }
  htmlAvisos += '</ul>';

imagemDiv.innerHTML = `
  <div class="dados-aluno">
    <div class="card">
      <h2><i class="fa-solid fa-user-check"></i> Frequência</h2>
      <ul style="font-size: 15px;color:#082f6a">
        ${Object.entries(dados.frequencia).map(([semana, dias]) => `
          <li>
            <strong>${semana.replace('_', ' ')}:</strong>
            <ul style="font-size: 12px;">
              ${Object.entries(dias).map(([data, status]) => `
                <li style="margin-bottom: 0;">
                  ${data}: <span style="color: ${status === 'ausente' ? 'red' : 'green'}">${status}</span>
                </li>
              `).join('')}
            </ul>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="card">
      <h2><i class="fa-solid fa-book"></i> Notas</h2>
      <ul>
        ${Object.entries(dados.notas).map(([disciplina, nota]) => `
          <li>
            <strong>${disciplina}:</strong> 
            <span style="color: ${nota < 6 ? 'red' : 'darkblue'}">${nota}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="card">
      <h2><i class="fa-solid fa-bell"></i> Avisos</h2>
      <ul>
        ${dados.avisos.map(aviso => `<li>${aviso}</li>`).join('')}
      </ul>
    </div>
  </div>
`;

  imagemDiv.style.padding = "1rem";
  imagemDiv.style.background = "transparent";
  imagemDiv.style.border = "1px solid #ccc";
  imagemDiv.style.borderRadius = "8px";
  imagemDiv.style.transform = "scale(1)";
  imagemDiv.style.marginTop = "0";
      } else {
        alert('CPF não encontrado.');
      }
    })
    .catch(error => {
      alert('Erro: ' + error.message);
    });
});
