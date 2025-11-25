import express from "express";
import multer from "multer";
import { readFileSync } from "fs";
import { JsonRpcProvider, Wallet, Contract, keccak256, isAddress } from "ethers";
import "dotenv/config";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const upload = multer({ dest: "uploads/" });
const app = express();

// Servir archivos estáticos desde la carpeta `public/`
// (frontend simple que añadimos para interactuar con la API)
app.use(express.static("public"));

const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.CONTRACT_ADDRESS;
if (!isAddress(contractAddress)) {
  console.error("CONTRACT_ADDRESS inválida. Actualiza .env con la dirección desplegada (0x...)");
  process.exit(1);
}

const abi = [
  "function notarize(bytes32 fileHash, string uri)",
  "function isNotarized(bytes32) view returns (bool,address,uint256,string)",
];

const contract = new Contract(contractAddress, abi, wallet);

app.post("/notarize", upload.single("file"), async (req, res) => {
  try {
    const fileBuf = readFileSync(req.file.path);
    const fileHash = keccak256(fileBuf);
    const tx = await contract.notarize(fileHash, "");
    const receipt = await tx.wait();
  // Convertir blockNumber a string (puede ser BigInt) para evitar errores de serialización
  const blockNumber = receipt.blockNumber?.toString?.() ?? String(receipt.blockNumber);
  res.json({ fileHash, txHash: tx.hash, blockNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const { hash } = req.query;
    const [exists, owner, timestamp, uri] = await contract.isNotarized(hash);
    // timestamp may be a BigInt / BigNumber depending on ethers version.
    // Convert to string to avoid JSON serialization errors: "Do not know how to serialize a BigInt"
    res.json({ exists, owner, timestamp: timestamp?.toString?.() ?? String(timestamp), uri });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

app.get("/certificado/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const [exists, owner, timestamp, uri] = await contract.isNotarized(hash);

    if (!exists) {
      res.status(404).send("No existe registro para ese hash");
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrData = `${baseUrl}/verify?hash=${hash}`;
    const qrImageBuffer = await QRCode.toBuffer(qrData, { type: "png", width: 220 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificado-${hash}.pdf`);

    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(22).text('Certificado de Notarización', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Hash registrado: ${hash}`);
    doc.text(`Propietario: ${owner}`);
    doc.text(`Fecha de registro: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    if (uri) doc.text(`URI asociada: ${uri}`);

    doc.moveDown();
    doc.text("Verificación QR:", { align: "left" });
    doc.image(qrImageBuffer, { width: 120, align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando certificado: " + String(err?.message || err));
  }
});



app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
