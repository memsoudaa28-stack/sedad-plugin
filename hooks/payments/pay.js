// hooks/payments/pay.js
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const { data, user } = req.body;

    const cart = data.cart;
    const credentials = data.paymethod_credential.data;

    const TOKEN = credentials.nexconnect_token;
    const CODE_ABONNEMENT = credentials.code_abonnement;
    const API_URL = credentials.api_url 
      || "https://nexpay-653e0b7d7b24.herokuapp.com";
    const PAYMENT_TYPE = credentials.payment_type || "Wallet";

    // id_facture minimum 8 caractères
    const id_facture = String(cart.uuid).substring(0, 20);

    // Appel API NexConnect
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
        nom_payeur: user.name + " " + user.lastname,
        telephone_payeur: user.cellphone,
        date: new Date().toISOString().split("T")[0],
        code_abonnement: CODE_ABONNEMENT,
        type: PAYMENT_TYPE,
        remarque: `Commande ${cart.uuid}`,
      }),
    });

    const nexData = await nexRes.json();

    if (!nexData.code_paiement) {
      return res.status(200).json({
        error: true,
        result: ["Échec initiation paiement NexConnect"],
      });
    }

    // Status 2 = en attente (Flow C asynchrone)
    return res.status(200).json({
      error: false,
      result: {
        status: 2,
        pay_reference: id_facture,
        data: {
          code_paiement: nexData.code_paiement,
          cart_uuid: cart.uuid,
          user_id: cart.user_id,
        },
      },
    });

  } catch (err) {
    return res.status(200).json({
      error: true,
      result: [`Erreur serveur: ${err.message}`],
    });
  }
};
