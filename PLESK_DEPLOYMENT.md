# NavetteClub - Guide de Déploiement Plesk

## Variables d'Environnement Obligatoires

### 🔐 Sécurité (CRITIQUES - L'APPLICATION NE DÉMARRERA PAS SANS CES VARIABLES)

```bash
# Mot de passe admin - OBLIGATOIRE
# Générer avec: openssl rand -base64 32
ADMIN_PASSWORD=votre_mot_de_passe_admin_fort

# Secret de session - OBLIGATOIRE
# Générer avec: openssl rand -base64 32
SESSION_SECRET=votre_secret_de_session_fort
```

**⚠️ IMPORTANT** : L'application refusera de démarrer sur Plesk si `ADMIN_PASSWORD` ou `SESSION_SECRET` ne sont pas définis. Ceci est une mesure de sécurité pour éviter l'utilisation de valeurs par défaut faibles.

### 🗄️ Base de Données

```bash
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=votre_host
PGPORT=5432
PGUSER=votre_user
PGPASSWORD=votre_password
PGDATABASE=votre_database
```

### 🗺️ Google Maps API

```bash
GOOGLE_MAPS_API_KEY=votre_cle_google_maps
VITE_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
```

### 💳 Paiement Konnect

```bash
KONNECT_API_KEY=votre_cle_konnect
KONNECT_RECEIVER_WALLET=votre_wallet_id
```

### 📧 SendGrid Email

```bash
SENDGRID_API_KEY=votre_cle_sendgrid
SENDGRID_FROM_EMAIL=noreply@navetteclub.com
```

### 🌐 Environnement

```bash
NODE_ENV=production
APP_DOMAIN=navetteclub.com
```

## Configuration Node.js dans Plesk

1. **Paramètres Application**
   - Node.js Version: `20.19.5`
   - Application Root: `/httpdocs`
   - Document Root: `/httpdocs/dist`
   - Application Startup File: `app.cjs`
   - Application Mode: `production`

2. **Installation et Build**

   ```bash
   cd /var/www/vhosts/navetteclub.com/httpdocs
   export PATH=/opt/plesk/node/20/bin:$PATH
   npm install
   npm run build
   ```

3. **Démarrer l'Application**
   - Dans Plesk → Node.js, cliquez sur **"Enable Node.js"**
   - Ou **"Restart App"** si déjà en cours d'exécution

## ⚠️ Limitations sur Plesk

### Upload d'Images Désactivé
- L'upload de fichiers nécessite Replit Object Storage (non disponible sur Plesk)
- **Solution** : Utilisez des URLs d'images hébergées sur un service externe :
  - Cloudinary
  - ImageKit
  - AWS S3
  - Tout autre service d'hébergement d'images

### Authentification Simplifiée
- Sur Plesk : authentification admin par mot de passe uniquement
- Sur Replit : authentification complète Replit Auth (OpenID Connect)

## 🔒 Sécurité

### Générer des Secrets Forts

```bash
# Générer ADMIN_PASSWORD (32 caractères alphanumériques)
openssl rand -base64 32

# Générer SESSION_SECRET (base64, 32 octets)
openssl rand -base64 32
```

### Protection Routes Admin

Toutes les routes suivantes sont protégées par authentification :
- `/api/providers` (POST, PATCH, DELETE)
- `/api/vehicles` (POST, PATCH, DELETE)
- `/api/tours` (POST, PATCH, DELETE)
- `/api/homepage-content` (POST, PATCH, DELETE)
- `/api/contact-info` (POST, PATCH)
- `/api/social-media-links` (POST, PATCH, DELETE)
- `/api/objects/upload` (POST)

### Accès Admin

1. Naviguez vers : `https://navetteclub.com/admin`
2. Vous serez redirigé vers : `https://navetteclub.com/admin/login`
3. Entrez le mot de passe défini dans `ADMIN_PASSWORD`

## 📝 Vérifications Post-Déploiement

1. ✅ L'application démarre sans erreur
2. ✅ La page d'accueil s'affiche correctement
3. ✅ `/admin` redirige vers `/admin/login`
4. ✅ Login admin fonctionne avec `ADMIN_PASSWORD`
5. ✅ Les routes API publiques (GET) fonctionnent
6. ✅ Les routes API protégées (POST/PATCH/DELETE) nécessitent authentification
7. ✅ Paiement Konnect fonctionne (test en mode sandbox)
8. ✅ Emails SendGrid sont envoyés

## 🚨 Dépannage

### Erreur "SESSION_SECRET not set"
→ Ajoutez `SESSION_SECRET` dans les variables d'environnement Plesk

### Erreur "ADMIN_PASSWORD not set"
→ Ajoutez `ADMIN_PASSWORD` dans les variables d'environnement Plesk

### Page blanche
→ Vérifiez que `VITE_GOOGLE_MAPS_API_KEY` est défini

### Upload retourne 500
→ Normal sur Plesk. Utilisez des URLs d'images externes

### Build échoue
→ Vérifiez que Node.js 20.19.5 est sélectionné
→ Supprimez `node_modules` et réinstallez : `npm install`

## 📞 Support

Pour toute question, consultez :
- `replit.md` : Architecture complète du projet
- Logs Plesk : Plesk → Node.js → View Logs
- Logs applicatifs : `/httpdocs/logs/`
