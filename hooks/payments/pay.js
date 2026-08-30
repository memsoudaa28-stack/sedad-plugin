const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const { data, user } = req.body;
    const cart = data.cart;

    const creds = data.paymethod_credential?.data
      || data.paymethod_credential?.data_sandbox
      || {};

    const configs = req.body.configs || {};

    const TOKEN = creds.nexconnect_token
      || configs.nexconnect_token
      || "iGesoVZN.CmXTfZqe8n4uPGEn79uwMI-CuYxBZqXCC";

    const CODE_ABONNEMENT = creds.code_abonnement
      || configs.code_abonnement
      || "deliveryli";

    const API_URL = creds.api_url
      || configs.api_url
      || "https://nexpay-653e0b7d7b24.herokuapp.com/api";

    const PAYMENT_TYPE = creds.payment_type
      || configs.payment_type
      || "Wallet";

    const id_facture = String(cart.uuid).substring(0, 20);

    console.log("[NexConnect] Envoi demande paiement:", {
      id_facture,
      montant: cart.balance || cart.total,
      API_URL
    });

    const nexRes = await fetch(`${API_URL}/demande_paiement`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id_facture,
        montant: String(cart.balance || cart.total),
        nom_payeur: `${user.name} ${user.lastname}`,
        telephone_payeur: user.cellphone,
        date: new Date().toISOString().split("T")[0],
        code_abonnement: CODE_ABONNEMENT,
        type: PAYMENT_TYPE,
        remarque: `Commande ${cart.uuid}`,
      }),
    });

    const nexData = await nexRes.json();
    console.log("[NexConnect] Réponse:", nexData);

    if (!nexData.code_paiement) {
      return res.status(200).json({
        error: true,
        result: ["Échec initiation paiement NexConnect"],
      });
    }

    return res.status(200).json({
      error: false,
      result: {
        status: 2,
        pay_reference: id_facture,
        data: {
          action: {
            type: "redirect",
            redirect_url: `https://sedad-3j5x.onrender.com?montant=${cart.balance || cart.total}&currency=MRU&cart_uuid=${cart.uuid}`
          }
        }
      }
    });

  } catch (err) {
    console.error("[NexConnect] Erreur:", err.message);
    return res.status(200).json({
      error: true,
      result: [`Erreur serveur: ${err.message}`],
    });
  }
};
