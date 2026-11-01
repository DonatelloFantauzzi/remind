import { useEffect, useState } from "react";

function App() {
  const [dati, setDati] = useState(null);

  useEffect(() => {
    const handleDati = async () => {
      const response = await fetch("/api/health");
      const data = await response.json();
      console.log(data);
      setDati(data);
      console.log(dati);
    };
    handleDati();
  }, []);

  return (
    <>
      <section className="text-3xl font-bold">Ciao dal client</section>
      <p>{dati?.status}</p>
    </>
  );
}

export default App;
