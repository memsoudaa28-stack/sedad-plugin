// nexconnect.js
// Wrapper pour les appels à l'API NexConnect

const fetch = require("node-fetch");

module.exports = function NexConnect(credentials) {
  const TOKEN = credentials.nexconnect_token;
  const API_URL = credentials.api_url 
    || "https://nexpay-653e0b7d7b24.herokuapp.com";
  const CODE_ABONNEMENT = credentials.code_abonnement;
  const PAYMENT_TYPE = credentials.payment_type || "Wallet";

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // ─── 1. Demande de paiement ───────────────────────
  async function demandePaiement(cart, user) {
    const id_facture = String(cart.uuid).substring(0, 20);

    const body = {
      id_facture,
      montant: String(cart.balance || cart.total),
      nom_payeur: `${user.name} ${user.lastname}`,
      telephone_payeur: user.cellphone,
      date: new Date().toISOString().split("T")[0],
      code_abonnement: CODE_ABONNEMENT,
      type: PAYMENT_TYPE,
      remarque: `Commande ${cart.uuid}`,
    };

    const res = await fetch(`${API_URL}/demande_paiement`, {
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

  // ─── 2. Consultation statut (secours) ─────────────
  async function consultationStatut(numero_recu) {
    const res = await fetch(`${API_URL}/consultation_statut`, {
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
