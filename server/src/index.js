// 1. Importa l'app da app.js (ricorda l'estensione .js)
import app from "./app.js";

// 2. La porta: quella dell'ambiente se c'è, altrimenti 3000
const PORT = process.env.PORT || 3000;

// 3. Accendi l'app su quella porta
//    e quando è pronta stampa in console un messaggio con la porta
app.listen(PORT, () => {
  console.log(`Server in ascolto alla porta n° ${PORT}`);
});
