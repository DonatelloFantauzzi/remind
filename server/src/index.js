// 1. Importa l'app da app.js (ricorda l'estensione .js)
import app from "./app.js";
import config from "./config.js";
import { startWorker } from "./jobs/worker.js";

const PORT = config.port;

// 3. Accendi l'app su quella porta
//    e quando è pronta stampa in console un messaggio con la porta
app.listen(PORT, () => {
  console.log(`Server in ascolto alla porta n° ${PORT}`);
  startWorker();
});
