module.exports = async (req, res) => {
  try {
    const { data, params } = req.body;
    const cart = data.cart;

    const nexconnect_data = params.nexconnect_data;

    console.log("[NexConnect] Confirmation reçue:", nexconnect_data);

    if (!nexconnect_data || nexconnect_data.status !== "success") {
      return res.status(200).json({
        error: true,
        result: ["Paiement non confirmé par NexConnect"],
      });
    }

    return res.status(200).json({
      error: false,
      result: {
        status: 1,
        pay_reference: nexconnect_data.numero_recu || cart.uuid,
      },
    });

  } catch (err) {
    console.error("[NexConnect] Erreur confirmation:", err.message);
    return res.status(200).json({
      error: true,
      result: [`Erreur confirmation: ${err.message}`],
    });
  }
};
