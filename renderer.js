const logEl = document.getElementById("log");
const chartEl = document.getElementById("chart");
let relatorio = "";
let falhas = [];
let chartData = null;

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function log(msg) {
  logEl.textContent += msg + "\n";
  relatorio += msg + "\n";
}

function marcarFalha(tipo, msg) {
  falhas.push({ tipo, msg });
  log(`[${tipo}] ${msg}`);
}

function decisaoAutomatica() {
  let pontuacao = 100;
  falhas.forEach(f => {
    if(f.tipo==="CRITICO") pontuacao -= 50;
    else if(f.tipo==="MODERADO") pontuacao -= 20;
    else pontuacao -= 5;
  });
  return Math.max(pontuacao,0);
}

function gerarGrafico() {
  try {
    const data = {
      labels:["Crítico","Moderado","Leve"],
      datasets:[{
        label:"Quantidade de Falhas",
        data:[
          falhas.filter(f=>f.tipo==="CRITICO").length,
          falhas.filter(f=>f.tipo==="MODERADO").length,
          falhas.filter(f=>f.tipo==="LEVE").length
        ],
        backgroundColor:["#ff4d4d","#ffcc00","#25D366"]
      }]
    };
    new Chart(chartEl,{type:"bar",data:data});
    chartData = chartEl.toDataURL();
  } catch (err) {
    console.error("Erro ao gerar gráfico:", err);
  }
}

async function iniciar() {
  try {
    logEl.textContent="";
    relatorio="";
    falhas=[];

    log("🧠 Iniciando diagnóstico automático avançado...");
    await sleep(500);

    if(!navigator.onLine) marcarFalha("CRITICO","Internet desconectada");
    else log("✅ Internet OK");

    const d = new Date();
    if(d.getFullYear()<2022) marcarFalha("CRITICO","Data/Hora incorreta");
    else log("✅ Data/Hora OK");

    let devices = [];
    try {
      devices = await window.electronAPI.listarADB();
      if(devices.length === 0) marcarFalha("MODERADO","Nenhum dispositivo ADB conectado");
      else log(`✅ ${devices.length} dispositivo(s) ADB conectado(s)`);
    } catch (e) {
      marcarFalha("CRITICO","Erro ao acessar ADB");
      console.error("Erro ADB:", e);
    }

    await sleep(600);
    marcarFalha("MODERADO","VPN/Proxy pode interferir");
    await sleep(600);
    marcarFalha("LEVE","Cache do app possivelmente corrompido");
    await sleep(600);
    marcarFalha("LEVE","Verificar atualização do app");

    const confianca = decisaoAutomatica();
    log(`\n🧠 Pontuação de confiança do reparo: ${confianca}%`);

    gerarGrafico();

    log("\n📋 Plano de ação recomendado:");
    log("1. Desativar VPN/Proxy");
    log("2. Limpar cache do app no celular");
    log("3. Reiniciar celular");
    log("4. Reiniciar computador");
    log("5. Abrir o app novamente");

    log("\n📄 Gerando relatório PDF...");
    const ok = await window.electronAPI.salvarPDF(relatorio, chartData);
    if(ok) log("✅ Relatório PDF salvo com sucesso!");
    else log("❌ Falha ao salvar PDF.");
  } catch (err) {
    console.error("Erro no diagnóstico:", err);
    log("❌ Ocorreu um erro inesperado. Verifique o console.");
  }
}


