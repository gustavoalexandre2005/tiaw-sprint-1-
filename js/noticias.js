const listaNoticias = document.getElementById("listaNoticias");
const areaDev = document.getElementById("areaDev");
const loginDev = document.getElementById("loginDev");
const formNoticia = document.getElementById("formNoticia");
const mensagem = document.getElementById("mensagem");
const loading = document.getElementById("loading");

// URL da API de Notícias - USE A URL QUE FUNCIONOU
const API_URL = 'https://76f08b4f-e4c1-4e2c-9b33-819d2a22a673-00-12vpqmhqy112a.worf.replit.dev/';

const IMAGEM_PADRAO = "https://via.placeholder.com/400x180?text=Mercado+Financeiro";
let noticias = [];
let devLogado = false;

// Credenciais do desenvolvedor
const USUARIO_DEV = "admin";
const SENHA_DEV = "domis2025";

// Função para carregar notícias da API
async function carregarNoticias() {
  try {
    mostrarLoading(true);
    console.log('🚀 Carregando notícias da API...', API_URL);
    
    const resposta = await fetch(API_URL + '/noticias');
    
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
    }
    
    noticias = await resposta.json();
    console.log('✅ Notícias carregadas:', noticias.length, 'notícias');
    renderizarNoticias();
    mostrarMensagem(`✅ ${noticias.length} notícias carregadas com sucesso!`);
  } catch (error) {
    console.error("❌ Erro ao carregar notícias:", error);
    listaNoticias.innerHTML = `
      <div class="erro-carregamento">
        <p>❌ Não foi possível carregar as notícias.</p>
        <p><small>Erro: ${error.message}</small></p>
        <p><small>URL: ${API_URL}/noticias</small></p>
        <button onclick="carregarNoticias()">🔄 Tentar Novamente</button>
      </div>
    `;
  } finally {
    mostrarLoading(false);
  }
}

// Função para mostrar/ocultar loading
function mostrarLoading(mostrar) {
  if (loading) {
    loading.style.display = mostrar ? 'block' : 'none';
  }
  if (listaNoticias) {
    listaNoticias.style.display = mostrar ? 'none' : 'block';
  }
}

// Função para renderizar notícias
function renderizarNoticias() {
  if (!listaNoticias) return;
  
  listaNoticias.innerHTML = "";
  
  if (noticias.length === 0) {
    listaNoticias.innerHTML = `
      <div class="sem-noticias">
        <p>📰 Nenhuma notícia disponível no momento.</p>
        ${devLogado ? '<p><small>Use a área de desenvolvedor para adicionar notícias.</small></p>' : ''}
      </div>
    `;
    return;
  }
  
  noticias.forEach((noticia) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = noticia.imagem && noticia.imagem.trim() !== "" ? noticia.imagem : IMAGEM_PADRAO;
    img.alt = noticia.titulo;
    img.onerror = function() {
      this.src = IMAGEM_PADRAO; // Fallback se a imagem não carregar
    };
    card.appendChild(img);

    const titulo = document.createElement("h2");
    titulo.textContent = noticia.titulo;
    card.appendChild(titulo);

    const descricao = document.createElement("p");
    descricao.textContent = noticia.descricao;
    card.appendChild(descricao);

    // Botões de editar/excluir apenas se desenvolvedor logado
    if (devLogado) {
      const acoes = document.createElement("div");
      acoes.classList.add("acoes");

      const btnEditar = document.createElement("button");
      btnEditar.classList.add("editar");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.onclick = () => editarNoticia(noticia.id);

      const btnExcluir = document.createElement("button");
      btnExcluir.classList.add("excluir");
      btnExcluir.textContent = "🗑️ Excluir";
      btnExcluir.onclick = () => excluirNoticia(noticia.id);

      acoes.appendChild(btnEditar);
      acoes.appendChild(btnExcluir);
      card.appendChild(acoes);
    }

    listaNoticias.appendChild(card);
  });
}

// Função para editar notícia
async function editarNoticia(id) {
  const noticia = noticias.find(n => n.id === id);
  if (!noticia) return;

  const novoTitulo = prompt("Editar título:", noticia.titulo);
  const novaDescricao = prompt("Editar descrição:", noticia.descricao);
  const novaImagem = prompt("Editar URL da imagem:", noticia.imagem);

  if (novoTitulo !== null && novaDescricao !== null) {
    try {
      const resposta = await fetch(API_URL + '/noticias/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: novoTitulo || noticia.titulo,
          descricao: novaDescricao || noticia.descricao,
          imagem: novaImagem && novaImagem.trim() !== "" ? novaImagem : noticia.imagem
        })
      });

      if (!resposta.ok) throw new Error('Erro ao editar notícia');

      mostrarMensagem("✅ Notícia editada com sucesso!");
      await carregarNoticias(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao editar:', error);
      mostrarMensagem("❌ Erro ao editar notícia!", true);
    }
  }
}

// Função para excluir notícia
async function excluirNoticia(id) {
  if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;

  try {
    const resposta = await fetch(API_URL + '/noticias/' + id, {
      method: 'DELETE'
    });

    if (!resposta.ok) throw new Error('Erro ao excluir notícia');

    mostrarMensagem("✅ Notícia excluída com sucesso!");
    await carregarNoticias(); // Recarrega a lista
  } catch (error) {
    console.error('Erro ao excluir:', error);
    mostrarMensagem("❌ Erro ao excluir notícia!", true);
  }
}

// Login do desenvolvedor
loginDev.addEventListener("click", () => {
  if (!devLogado) {
    const usuario = prompt("Digite o usuário do desenvolvedor:");
    const senha = prompt("Digite a senha do desenvolvedor:");

    if (usuario === USUARIO_DEV && senha === SENHA_DEV) {
      devLogado = true;
      areaDev.style.display = "block";
      loginDev.textContent = "🚪 Sair do Modo Dev";
      renderizarNoticias();
      mostrarMensagem("🔧 Modo desenvolvedor ativado!");
    } else {
      alert("❌ Usuário ou senha incorretos!");
    }
  } else {
    devLogado = false;
    areaDev.style.display = "none";
    loginDev.textContent = "👨‍💻 Entrar como Desenvolvedor";
    renderizarNoticias();
    mostrarMensagem("🔧 Modo desenvolvedor desativado!");
  }
});

// Adicionar nova notícia
formNoticia.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const imagem = document.getElementById("imagem").value.trim();

  if (!titulo || !descricao) {
    mostrarMensagem("❌ Título e descrição são obrigatórios!", true);
    return;
  }

  try {
    const resposta = await fetch(API_URL + '/noticias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo,
        descricao,
        imagem: imagem || IMAGEM_PADRAO
      })
    });

    if (!resposta.ok) throw new Error('Erro ao adicionar notícia');

    const novaNoticia = await resposta.json();
    
    formNoticia.reset();
    mostrarMensagem("✅ Notícia adicionada com sucesso!");
    await carregarNoticias(); // Recarrega a lista com a nova notícia
    
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    mostrarMensagem("❌ Erro ao adicionar notícia!", true);
  }
});

// Função para exibir mensagens
function mostrarMensagem(texto, isErro = false) {
  if (!mensagem) return;
  
  mensagem.textContent = texto;
  mensagem.style.display = "block";
  mensagem.style.background = isErro ? "#ff4444" : "#4CAF50";
  mensagem.style.color = "white";
  
  setTimeout(() => {
    if (mensagem) {
      mensagem.style.display = "none";
    }
  }, 4000);
}

// Testar conexão com a API
async function testarConexao() {
  try {
    const resposta = await fetch(API_URL);
    if (resposta.ok) {
      console.log('✅ Conexão com API estabelecida');
    } else {
      console.log('❌ API respondeu com erro:', resposta.status);
    }
  } catch (error) {
    console.log('❌ Não foi possível conectar com a API:', error.message);
  }
}

// Inicializa o carregamento de notícias
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando sistema de notícias...');
  console.log('📡 API URL:', API_URL);
  testarConexao();
  carregarNoticias();
});