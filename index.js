const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/hooks/payments/pay", require("./hooks/payments/pay"));
app.post("/hooks/payments/confirm", require("./hooks/payments/confirm"));

app.post("/callback/nexconnect", async (req, res) => {
  const fetch = require("node-fetch");
  const { id_facture, id_transaction, numero_recu, montant } = req.body;

  try {
    await fetch(
      `https://apiv4.ordering.co/v400/en/project/carts/${id_facture}/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nexconnect_data: { status: "success", numero_recu, id_transaction, montant },
          user_id: req.body.user_id,
        }),
      }
    );
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/config.json", (req, res) => {
  res.sendFile(__dirname + "/config.json");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NexConnect plugin running on port ${PORT}`);
});
