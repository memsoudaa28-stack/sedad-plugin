// config.js
// Les valeurs sont injectées dynamiquement
// par Ordering depuis les settings du manifest

module.exports = function getConfig(settings) {
  return {
    API_URL: settings.nexconnect_api_url 
      || "https://nexpay-653e0b7d7b24.herokuapp.com",
    TOKEN: settings.nexconnect_token,
    CODE_ABONNEMENT: settings.nexconnect_code_abonnement,
    PAYMENT_TYPE: settings.nexconnect_payment_type || "Wallet",
  };
};
