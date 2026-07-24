// nexconnect.js
const fetch = require("node-fetch");

module.exports = function NexConnect(settings) {
  const config = require("./config")(settings);

  const headers = {
    Authorization: `Bearer ${config.TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // ─── 1. Initiation paiement ───────────────────────────
  async function demandePaiement(order) {
    // id_facture doit faire minimum 8 caractères
    const id_facture = String(order.id).padStart(8, "0");

    const body = {
      id_facture,
      montant: String(order.total),
      nom_payeur: order.customer?.name || "Client",
      telephone_payeur: order.customer?.phone || "",
      date: new Date().toISOString().split("T")[0],
      code_abonnement: config.CODE_ABONNEMENT,
      type: config.PAYMENT_TYPE,
      remarque: `Commande #${order.id}`,
    };

    const res = await fetch(`${config.API_URL}/demande_paiement`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`NexConnect error: ${res.status}`);
    }

    return res.json();
    // Retourne { code, Message, code_paiement }
  }

  // ─── 2. Consultation statut (secours) ─────────────────
  async function consultationStatut(numero_recu) {
    const res = await fetch(`${config.API_URL}/consultation_statut`, {
      method: "POST",
      headers,
      body: JSON.stringify({ numero_recu }),
    });

    if (!res.ok) {
      throw new Error(`Consultation error: ${res.status}`);
    }

    return res.json();
  }

  return { demandePaiement, consultationStatut };
};
