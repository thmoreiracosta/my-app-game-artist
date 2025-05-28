const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { PrismaClient, Plan } = require("@prisma/client");
const axios = require("axios");

const router = express.Router();
const prisma = new PrismaClient();

const IA_API_URL = "https://api.openai.com/v1/images/generations";
const IA_KEY = process.env.OPENAI_API_KEY;

const resolutionByPlan = {
  BASIC: "256x256",
  STANDARD: "512x512",
  PRO: "1024x1024",
};

const buildPrompt = (console, assetType, userPrompt) => {
  const styles = {
    MEGADRIVE: "pixel art 16-bit, estilo Sonic, cores vibrantes",
    SNES: "pixel art colorido, estilo Super Mario, paleta nostálgica",
    PLAYSTATION: "estilo low-poly 3D, como jogos de 1995",
    XBOX: "alta definição, estilo moderno, 3D realista",
  };

  const assetNames = {
    CHARACTER: "personagem",
    BACKGROUND: "cenário de fundo",
    OBJECT: "objeto do jogo",
    PLATFORM: "plataforma/solo da fase"
  };

  return `Crie um(a) ${assetNames[assetType]} no estilo ${styles[console]}. ${userPrompt}`;
};

router.post("/generate", verifyToken, async (req, res) => {
  const { console, assetType, prompt } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  // Verifica créditos
  if (user.credits <= 0 && user.plan !== Plan.PRO) {
    return res.status(403).json({ error: "Sem créditos suficientes" });
  }

  const fullPrompt = buildPrompt(console, assetType, prompt);

  try {
    const response = await axios.post(
      IA_API_URL,
      {
        prompt: fullPrompt,
        n: 1,
        size: resolutionByPlan[user.plan],
      },
      {
        headers: {
          Authorization: `Bearer ${IA_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const imageUrl = response.data.data[0].url;

    // Salva imagem no histórico
    await prisma.image.create({
      data: {
        url: imageUrl,
        prompt: fullPrompt,
        console,
        assetType,
        userId: user.id
      }
    });

    // Deduz crédito se não for PRO
    if (user.plan !== Plan.PRO) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
      });
    }

    res.json({ imageUrl });
  } catch (e) {
    console.error(e.response?.data || e);
    res.status(500).json({ error: "Erro ao gerar imagem" });
  }
});

module.exports = router;
