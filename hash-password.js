const bcrypt = require('bcrypt');

// Le mot de passe exact que vous voulez utiliser pour vous connecter
const plainPassword = 'WEsdxc01'; 
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erreur lors du hachage:', err);
    return;
  }
  console.log('--- NOUVEAU HACHAGE ---');
  console.log('Mot de passe haché:', hash);
  console.log('\n--- COMMANDE SQL À EXÉCUTER ---');
  // La commande est déjà pré-remplie avec votre nom d'utilisateur
  console.log(`UPDATE users SET password = '${hash}' WHERE username = 'mickael';`);
});