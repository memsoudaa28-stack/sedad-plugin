// hooks/payments/confirm.js
module.exports = async (req, res) => {
  try {
    const { data, params } = req.body;
    const cart = data.cart;

    // Données envoyées par notre callback NexConnect
    const nexconnect_data = params.nexconnect_data;

    if (!nexconnect_data || nexconnect_data.status !== "success") {
      return res.status(200).json({
        error: true,
        result: ["Paiement non confirmé par NexConnect"],
      });
    }

    // Paiement confirmé → status 1 = ordre créé
    return res.status(200).json({
      error: false,
      result: {
        status: 1,
        pay_reference: nexconnect_data.numero_recu || cart.uuid,
      },
    });

  } catch (err) {
    return res.status(200).json({
      error: true,
      result: [`Erreur confirmation: ${err.message}`],
    });
  }
};
