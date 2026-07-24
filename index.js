// index.js
const NexConnect = require("./nexconnect");
const registerWebhook = require("./webhook");

module.exports = {
  name: "NexConnect Payment",
  version: "1.0.0",

  /**
   * Méthode appelée par Ordering au chargement du plugin
   * @param {object} app     - Instance Express de la plateforme
   * @param {object} hooks   - Hooks disponibles d'Ordering
   * @param {object} settings - Paramètres saisis dans le dashboard
   */
  install(app, hooks, settings) {
    const nexconnect = NexConnect(settings);

    // ─── Enregistrer le webhook callback ──────────────
    registerWebhook(app, hooks, settings);

    // ─── Hook : avant de placer la commande ───────────
    hooks.on("beforePlaceOrder", async (order, next) => {
      try {
        const result = await nexconnect.demandePaiement(order);

        if (!result.code_paiement) {
          throw new Error("Aucun code de paiement reçu de NexConnect");
        }

        // Attacher le code_paiement à la commande
        // pour l'afficher au client
        order.payment_data = {
          code_paiement: result.code_paiement,
          provider: "nexconnect",
        };

        next(null, order);

      } catch (err) {
        console.error("[NexConnect] Erreur initiation:", err.message);
        next(err);
      }
    });

    // ─── Hook : après placement de commande ───────────
    hooks.on("afterPlaceOrder", async (order) => {
      console.log(
        `[NexConnect] Commande ${order.id} en attente de paiement.`,
        `Code: ${order.payment_data?.code_paiement}`
      );
    });

    // ─── Secours : vérification manuelle du statut ────
    app.get("/plugins/nexconnect/status/:numero_recu", async (req, res) => {
      try {
        const data = await nexconnect.consultationStatut(
          req.params.numero_recu
        );
        return res.json(data);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    console.log("[NexConnect] Plugin chargé avec succès ✅");
  },
};
