import { useState } from 'react';
import axios from 'axios';

const consoles = ["MEGADRIVE", "SNES", "PLAYSTATION", "XBOX"];
const assetTypes = ["CHARACTER", "BACKGROUND", "OBJECT", "PLATFORM"];

export default function Generate() {
  const [consoleSel, setConsoleSel] = useState("MEGADRIVE");
  const [assetType, setAssetType] = useState("CHARACTER");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/image/generate`, {
        console: consoleSel,
        assetType,
        prompt
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setImage(res.data.imageUrl);
    } catch {
      alert("Erro ao gerar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerar Elemento de Jogo</h1>

      <select value={consoleSel} onChange={e => setConsoleSel(e.target.value)} className="select">
        {consoles.map(c => <option key={c}>{c}</option>)}
      </select>

      <select value={assetType} onChange={e => setAssetType(e.target.value)} className="select mt-2">
        {assetTypes.map(a => <option key={a}>{a}</option>)}
      </select>

      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="textarea mt-2 w-full" placeholder="Descreva seu elemento..." />

      <button className="btn mt-4" onClick={handleGenerate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar Imagem"}
      </button>

      {image && <img src={image} alt="Resultado" className="mt-4 rounded shadow-md" />}
    </div>
  );
}
