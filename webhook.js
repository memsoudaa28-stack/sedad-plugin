// webhook.js
module.exports = function registerWebhook(app, hooks, settings) {

  app.post("/plugins/nexconnect/callback", async (req, res) => {
    const {
      id_facture,
      id_transaction,
      date_paiement,
      montant,
      numero_recu,
    } = req.body;

    // Validation basique
    if (!id_facture || !id_transaction || !numero_recu) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    try {
      // Passer la commande en statut "Payée" via le hook Ordering
      await hooks.updateOrderStatus({
        orderId: id_facture,
        status: "paid",
        metadata: {
          id_transaction,
          date_paiement,
          montant,
          numero_recu,
        },
      });

      // IMPÉRATIF : retourner 200 pour valider côté NexConnect
      return res.status(200).json({ 
        status: "ok",
        message: "Paiement confirmé" 
      });

    } catch (err) {
      console.error("[NexConnect Webhook Error]", err.message);
      // Tout autre code = NexConnect considère le paiement échoué
      return res.status(500).json({ error: err.message });
    }
  });

};
