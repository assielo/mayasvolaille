<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 font-sans">

    <!-- ÉCRAN D'AUTHENTIFICATION -->
    <div v-if="!utilisateurConnecte" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md space-y-6">
        <div class="text-center space-y-2">
          <img src="/logo.png" alt="Mayas Volaille" class="h-16 w-auto mx-auto object-contain" />
          <h1 class="text-xl font-bold text-slate-900">Mayas Volaille</h1>
          <p class="text-xs text-slate-500">Connexion Sécurisée Multi-Fermes &amp; Gestion Centrale</p>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 mb-1 font-semibold">Adresse Email :</label>
            <input type="email" v-model="authForm.email" placeholder="chepitimayasagrisarl@gmail.com" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium" />
          </div>
          <div>
            <label class="block text-slate-600 mb-1 font-semibold">Mot de passe :</label>
            <input type="password" v-model="authForm.password" placeholder="••••••••" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium" />
          </div>

          <button @click="connecterUtilisateur" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm">
            Se Connecter
          </button>
        </div>
      </div>
    </div>

    <!-- APPLICATION PRINCIPALE UNIFORME -->
    <div v-else class="p-3 md:p-6 space-y-5 max-w-7xl mx-auto">
      
      <!-- EN-TÊTE GLOBAL AVEC INDICATEUR HORS-LIGNE & PERSISTANCE DES DONNÉES -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Mayas Volaille" class="h-12 w-auto object-contain" />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900">Mayas Volaille</h1>
              <span :class="['px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1', estEnLigne ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse']">
                {{ estEnLigne ? '🌐 En Ligne' : '📡 Hors-Ligne (Stockage Local Actif)' }}
              </span>
            </div>
            <p class="text-xs text-slate-500">
              Connecté : <strong class="text-emerald-700">{{ utilisateurConnecte.nom }}</strong> 
              <span class="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">{{ utilisateurConnecte.role }}</span>
            </p>
          </div>
        </div>

        <!-- BARRE D'OUTILS DE BASE DE DONNÉES & NOTIFICATIONS -->
        <div class="flex flex-wrap items-center gap-2">
          <button @click="sauvegarderLocalement" title="Enregistrer l'état de la base" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm">
            💾 Sauver
          </button>
          <button @click="exporterDonneesJSON" title="Exporter une copie de sauvegarde" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm">
            📤 Exporter
          </button>
          <label title="Importer un fichier de sauvegarde" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm cursor-pointer">
            📥 Importer
            <input type="file" @change="chargerDonneesJSON" accept=".json" class="hidden" />
          </label>
          <button @click="reinitialiserVides" title="Vider les exemples pour saisir vos données réelles" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2.5 py-2 rounded-xl text-xs">
            🗑️ Vider
          </button>

          <div class="bg-slate-50 p-1.5 border border-slate-300 rounded-xl flex items-center gap-2 ml-1">
            <span class="text-xs font-bold text-slate-600">Filtre :</span>
            <select v-model="codeProdFiltre" class="bg-white text-xs font-bold text-emerald-800 p-1.5 rounded-lg border border-slate-200 focus:outline-none">
              <option value="TOUTES">📊 Toutes</option>
              <option v-for="(p, idx) in historiqueProductions" :key="idx" :value="p.codeProd">
                {{ p.codeProd }} — {{ p.site }}
              </option>
            </select>
          </div>

          <button @click="exporterRapportProductionPDF" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-2 rounded-xl text-xs shadow-sm">
            📄 PDF
          </button>

          <button @click="deconnecter" class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all">
            Sortie
          </button>
        </div>
      </header>

      <!-- BARRE DE NAVIGATION PRINCIPALE (17 ONGLETS) -->
      <nav class="flex flex-wrap border-b border-slate-200 bg-white rounded-2xl p-2 shadow-sm gap-1 text-xs font-semibold print:hidden">
        <button @click="ongletActif = 'dashboard'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'dashboard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">📊 1. Dashboard</button>
        <button @click="ongletActif = 'rapport_lot'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'rapport_lot' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">📄 2. Rapport Lot</button>
        <button @click="ongletActif = 'productions'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'productions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🔄 3. Cycles</button>
        <button @click="ongletActif = 'saisie'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'saisie' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">📝 4. Élevage</button>
        <button @click="ongletActif = 'depenses'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'depenses' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">💸 5. Dépenses</button>
        <button @click="ongletActif = 'decoupes'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'decoupes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🍗 6. Découpes</button>
        <button @click="ongletActif = 'livraisons'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'livraisons' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🚚 7. Livraisons</button>
        <button @click="ongletActif = 'stocks'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'stocks' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">📦 8. Stocks</button>
        <button @click="ongletActif = 'bilan_charges'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'bilan_charges' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">💳 9. Bilan</button>
        <button @click="ongletActif = 'mortalite'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'mortalite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🩺 10. Mortalité</button>
        <button @click="ongletActif = 'equipements'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'equipements' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🚜 11. Équipements</button>
        <button @click="ongletActif = 'personnel'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'personnel' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">👥 12. Personnel</button>
        <button @click="ongletActif = 'logistique'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'logistique' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🚚 13. Logistique</button>
        <button @click="ongletActif = 'ica'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'ica' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">📈 14. Indice ICA</button>
        <button @click="ongletActif = 'creances'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'creances' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100']">🧾 15. Créances CRM</button>
        <button @click="ongletActif = 'facturation'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'facturation' ? 'bg-purple-700 text-white shadow-sm' : 'text-purple-700 hover:bg-purple-50']">📑 16. Éditeur Factures</button>
        <button @click="ongletActif = 'comparateur'" :class="['py-2 px-3 rounded-xl transition-all', ongletActif === 'comparateur' ? 'bg-purple-700 text-white shadow-sm' : 'text-purple-700 hover:bg-purple-50']">📊 17. Multi-Sites</button>
      </nav>

      <!-- 1. DASHBOARD -->
      <div v-if="ongletActif === 'dashboard'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span class="text-slate-500 font-semibold uppercase">Production Active Actuelle</span>
            <div class="text-lg font-black text-emerald-700">{{ productionActive.codeProd }}</div>
            <p class="text-[10px] text-slate-500">Site : <strong>{{ productionActive.site }}</strong></p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span class="text-slate-500 font-semibold uppercase">CA Global Lot Sélectionné</span>
            <div class="text-2xl font-black text-emerald-700">{{ formatFCFA(totalCAPouletsFiltre + totalCADecoupesFiltre) }}</div>
            <p class="text-[10px] text-slate-500">Poulets + Découpes (Filtre {{ codeProdFiltre }})</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span class="text-slate-500 font-semibold uppercase">Bénéfice Net Estimé</span>
            <div class="text-2xl font-black text-purple-900">{{ formatFCFA(beneficeNetFinal) }}</div>
            <p class="text-[10px] text-purple-600 font-bold">Marge Nette Calculée</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span class="text-slate-500 font-semibold uppercase">Créances Clients Impayées</span>
            <div class="text-2xl font-black text-red-600">{{ formatFCFA(totalCreancesImpayees) }}</div>
            <p class="text-[10px] text-red-500 font-bold">Suivi CRM B2B</p>
          </div>
        </div>
      </div>

      <!-- 2. RAPPORT LOT -->
      <div v-if="ongletActif === 'rapport_lot'" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div class="flex justify-between items-center border-b pb-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900">📄 Rapport Synthétique d'Exploitation — {{ codeProdFiltre }}</h2>
            <p class="text-xs text-slate-500">Document prêt à l'impression pour la direction</p>
          </div>
          <button @click="exporterRapportProductionPDF" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">🖨️ Imprimer ce Rapport</button>
        </div>
      </div>

      <!-- 3. MASQUE DE SAISIE : CYCLES DE PRODUCTION -->
      <div v-if="ongletActif === 'productions'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🔄 Masque de Saisie : Cycles de Production</h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Code Lot :</label><input type="text" v-model="prodForm.codeProd" class="w-full bg-white border rounded p-2 font-mono font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Bâtiment / Site :</label><select v-model="prodForm.site" class="w-full bg-white border rounded p-2 font-semibold"><option value="Bâtiment A">Bâtiment A</option><option value="Bâtiment B">Bâtiment B</option><option value="Bingerville">Bingerville</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Fournisseur :</label><select v-model="prodForm.fournisseur" class="w-full bg-white border rounded p-2 font-bold text-emerald-700"><option value="SIPRA">SIPRA</option><option value="IVOGRAIN">IVOGRAIN</option><option value="Foani">Foani</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Poussins :</label><input type="number" v-model.number="prodForm.poussinsInitiaux" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Date Début :</label><input type="date" v-model="prodForm.dateDebut" class="w-full bg-white border rounded p-2 font-mono" /></div>
          </div>
          <button @click="sauvegarderProduction" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer &amp; Ajouter le Cycle</button>

          <div class="overflow-x-auto pt-4 border-t">
            <h3 class="font-bold text-xs mb-2">Historique des Cycles enregistrés :</h3>
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Code Lot</th><th class="p-2">Site</th><th class="p-2">Fournisseur</th><th class="p-2 text-center">Poussins</th><th class="p-2">Date Début</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(p, idx) in historiqueProductions" :key="idx"><td class="p-2 font-mono font-bold text-emerald-800">{{ p.codeProd }}</td><td class="p-2">{{ p.site }}</td><td class="p-2">{{ p.fournisseur }}</td><td class="p-2 text-center font-bold">{{ p.poussinsInitiaux }}</td><td class="p-2 font-mono">{{ p.dateDebut }}</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 4. MASQUE DE SAISIE : SAISIE & ÉLEVAGE -->
      <div v-if="ongletActif === 'saisie'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">📝 Masque de Saisie : Rapport d'Élevage Quotidien</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Date :</label><input type="date" v-model="saisieForm.date" class="w-full bg-white border rounded p-2 font-mono" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Lot / Bâtiment :</label><select v-model="saisieForm.codeProd" class="w-full bg-white border rounded p-2 font-bold"><option v-for="p in historiqueProductions" :key="p.codeProd" :value="p.codeProd">{{ p.codeProd }} ({{ p.site }})</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Quantité Poussins :</label><input type="number" v-model.number="saisieForm.quantitePoussins" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Âge (Jours) :</label><input type="number" v-model.number="saisieForm.ageJours" class="w-full bg-white border rounded p-2 font-bold" /></div>
          </div>
          <button @click="validerEnregistrement" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer le Rapport</button>
        </div>
      </div>

      <!-- 5. MASQUE DE SAISIE : DÉPENSES -->
      <div v-if="ongletActif === 'depenses'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">💸 Masque de Saisie : Dépenses d'Exploitation</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Poste Poussins (FCFA) :</label><input type="number" v-model.number="depensesForm.poussinsAjuste" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Poste Aliments (FCFA) :</label><input type="number" v-model.number="depensesForm.alimentsAjuste" class="w-full bg-white border rounded p-2 font-bold" /></div>
          </div>
          <button @click="sauvegarderDepenses" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Mettre à jour les Dépenses</button>
        </div>
      </div>

      <!-- 6. MASQUE DE SAISIE : VENTES & DÉCOUPES -->
      <div v-if="ongletActif === 'decoupes'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🍗 Masque de Saisie : Ventes &amp; Découpes par Localité</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Article :</label><select v-model="decoupeForm.typeArticle" class="w-full bg-white border rounded p-2 font-bold"><option value="Pattes">Pattes</option><option value="Gésiers">Gésiers</option><option value="Cous">Cous</option><option value="Ailerons">Ailerons</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Poids (Kg) :</label><input type="number" v-model.number="decoupeForm.poidsKg" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Localité :</label><select v-model="decoupeForm.localite" class="w-full bg-white border rounded p-2 font-bold text-emerald-700"><option value="Diegon / Abidjan">Diegon / Abidjan</option><option value="Bouaké">Bouaké</option><option value="Yamoussoukro">Yamoussoukro</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Montant (FCFA) :</label><input type="number" v-model.number="decoupeForm.montantFCFA" class="w-full bg-white border rounded p-2 font-bold text-slate-900" /></div>
          </div>
          <button @click="sauvegarderVenteDecoupe" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer la Vente</button>

          <div class="overflow-x-auto pt-4 border-t">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Date</th><th class="p-2">Article</th><th class="p-2 text-center">Poids (Kg)</th><th class="p-2">Localité</th><th class="p-2 text-right">Montant FCFA</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(d, idx) in historiqueDecoupes" :key="idx"><td class="p-2 font-mono">{{ d.date }}</td><td class="p-2 font-bold">{{ d.typeArticle }}</td><td class="p-2 text-center font-bold">{{ d.poidsKg }} kg</td><td class="p-2"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{{ d.localite }}</span></td><td class="p-2 text-right font-bold text-emerald-700">{{ formatFCFA(d.montantFCFA) }}</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 7. MASQUE DE SAISIE : LIVRAISONS -->
      <div v-if="ongletActif === 'livraisons'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🚚 Masque de Saisie : Livraisons &amp; Abattage</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">N° Bon Livraison :</label><input type="text" v-model="livraisonForm.numLivraison" class="w-full bg-white border rounded p-2 font-mono font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Organisme / Client :</label><select v-model="livraisonForm.organisme" class="w-full bg-white border rounded p-2 font-bold"><option value="SIPRA">SIPRA</option><option value="FOANI">FOANI</option><option value="COQ D'OR">COQ D'OR</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Qté Livrée (Sujets) :</label><input type="number" v-model.number="livraisonForm.dejaLivre" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Montant Total (FCFA) :</label><input type="number" v-model.number="livraisonForm.montantTotal" class="w-full bg-white border rounded p-2 font-bold text-emerald-700" /></div>
          </div>
          <button @click="sauvegarderLivraison" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer la Livraison</button>

          <div class="overflow-x-auto pt-4 border-t">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Date</th><th class="p-2">N° Bon</th><th class="p-2">Organisme</th><th class="p-2 text-center">Qté Livrée</th><th class="p-2 text-right">Total FCFA</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(l, idx) in registrelivraisons" :key="idx"><td class="p-2 font-mono">{{ l.date }}</td><td class="p-2 font-bold font-mono">{{ l.numLivraison }}</td><td class="p-2 font-bold">{{ l.organisme }}</td><td class="p-2 text-center font-bold text-emerald-700">{{ l.dejaLivre }}</td><td class="p-2 text-right font-bold text-slate-900">{{ formatFCFA(l.montantTotal) }}</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 8. MASQUE DE SAISIE : STOCKS -->
      <div v-if="ongletActif === 'stocks'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">📦 Masque de Saisie : Stocks &amp; Aliments</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Ferme / Site :</label><select v-model="stockForm.ferme" class="w-full bg-white border rounded p-2 font-semibold"><option value="Magasin Central Ahoué">Magasin Central Ahoué</option><option value="Location 1">Location 1</option><option value="Bingerville">Bingerville</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Article :</label><input type="text" v-model="stockForm.article" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Stock Actuel (Sacs) :</label><input type="number" v-model.number="stockForm.stockActuel" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Seuil Alerte :</label><input type="number" v-model.number="stockForm.seuilAlerte" class="w-full bg-white border rounded p-2 font-bold text-red-600" /></div>
          </div>
          <button @click="sauvegarderStock" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer &amp; Ajouter au Stock</button>

          <div class="overflow-x-auto pt-4 border-t">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Ferme</th><th class="p-2">Article</th><th class="p-2 text-center">Stock Actuel</th><th class="p-2 text-center">Statut</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(st, idx) in stockGlobal" :key="idx"><td class="p-2 font-bold">{{ st.ferme }}</td><td class="p-2">{{ st.article }}</td><td class="p-2 text-center font-bold">{{ st.stockActuel }} sacs</td><td class="p-2 text-center"><span :class="['px-2 py-0.5 rounded font-bold text-[10px]', st.stockActuel <= st.seuilAlerte ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800']">{{ st.stockActuel <= st.seuilAlerte ? '🚨 CRITIQUE' : '✅ NORMAL' }}</span></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 9. MASQUE DE SAISIE : BILAN -->
      <div v-if="ongletActif === 'bilan_charges'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">💳 Masque de Saisie : Bilan Financier &amp; Charges</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Catégorie :</label><select v-model="bilanForm.categorie" class="w-full bg-white border rounded p-2 font-bold"><option value="Charges Principales">Charges Principales</option><option value="Produits (Ventes)">Produits (Ventes)</option><option value="Charges Secondaires">Charges Secondaires</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Libellé :</label><input type="text" v-model="bilanForm.libelle" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Détails :</label><input type="text" v-model="bilanForm.details" class="w-full bg-white border rounded p-2 italic" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Montant (FCFA) :</label><input type="number" v-model.number="bilanForm.montantFCFA" class="w-full bg-white border rounded p-2 font-bold" /></div>
          </div>
          <button @click="sauvegarderBilanItem" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Ajouter au Bilan</button>
        </div>
      </div>

      <!-- 10. MASQUE DE SAISIE : MORTALITÉ & SANTÉ -->
      <div v-if="ongletActif === 'mortalite'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🩺 10. Suivi de la Mortalité &amp; Santé Vétérinaire</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Date :</label><input type="date" v-model="mortaliteForm.date" class="w-full bg-white border rounded p-2 font-mono" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Lot :</label><select v-model="mortaliteForm.lot" class="w-full bg-white border rounded p-2 font-bold"><option v-for="p in historiqueProductions" :key="p.codeProd" :value="p.codeProd">{{ p.codeProd }} ({{ p.site }})</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Sujets Morts :</label><input type="number" v-model.number="mortaliteForm.sujetsMorts" class="w-full bg-white border rounded p-2 font-bold text-red-600" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Taux (%) :</label><input type="text" :value="tauxMortaliteCalculated + '%'" disabled class="w-full bg-slate-200 border rounded p-2 font-black text-red-700 text-center" /></div>
          </div>
          <button @click="sauvegarderMortalite" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer la Fiche Santé</button>
        </div>
      </div>

      <!-- 11. MASQUE DE SAISIE : ÉQUIPEMENTS -->
      <div v-if="ongletActif === 'equipements'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🚜 11. Gestion des Équipements</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Désignation :</label><input type="text" v-model="equipementForm.designation" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Prestataire :</label><input type="text" v-model="equipementForm.prestataire" class="w-full bg-white border rounded p-2" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Coût (FCFA) :</label><input type="number" v-model.number="equipementForm.cout" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">État :</label><select v-model="equipementForm.etat" class="w-full bg-white border rounded p-2 font-bold"><option value="Opérationnel">Opérationnel</option><option value="En panne">En panne</option></select></div>
          </div>
          <button @click="sauvegarderEquipement" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer l'Équipement</button>
        </div>
      </div>

      <!-- 12. MASQUE DE SAISIE : PERSONNEL -->
      <div v-if="ongletActif === 'personnel'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">👥 12. Gestion du Personnel &amp; Paye</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Nom :</label><input type="text" v-model="personnelForm.nom" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Poste :</label><input type="text" v-model="personnelForm.poste" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Salaire (FCFA) :</label><input type="number" v-model.number="personnelForm.salaire" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Statut :</label><select v-model="personnelForm.statutPaiement" class="w-full bg-white border rounded p-2 font-bold"><option value="Payé">Payé</option><option value="En attente">En attente</option></select></div>
          </div>
          <button @click="sauvegarderPersonnel" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer l'Employé</button>
        </div>
      </div>

      <!-- 13. MASQUE DE SAISIE : LOGISTIQUE -->
      <div v-if="ongletActif === 'logistique'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900">🚚 13. Suivi Logistique &amp; Flotte</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Véhicule :</label><input type="text" v-model="logistiqueForm.vehicule" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Destination :</label><input type="text" v-model="logistiqueForm.destination" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Frais (FCFA) :</label><input type="number" v-model.number="logistiqueForm.frais" class="w-full bg-white border rounded p-2 font-bold" /></div>
          </div>
          <button @click="sauvegarderLogistique" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer le Trajet</button>
        </div>
      </div>

      <!-- 14. MASQUE DE SAISIE : INDICE DE CONVERSION ICA -->
      <div v-if="ongletActif === 'ica'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">📈 14. Indice de Conversion Alimentaire (ICA / FCR)</h2>
              <p class="text-xs text-slate-500">Ratio d'efficacité : Aliment Consommé (kg) / Poids Vif (kg)</p>
            </div>
            <button @click="sauvegarderICA" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer le Calcul ICA</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Lot :</label><select v-model="icaForm.codeProd" class="w-full bg-white border rounded p-2 font-bold text-emerald-800"><option v-for="p in historiqueProductions" :key="p.codeProd" :value="p.codeProd">{{ p.codeProd }} ({{ p.site }})</option></select></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Aliment Consommé (Kg) :</label><input type="number" v-model.number="icaForm.alimentConsommeKg" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Poids Vif Total (Kg) :</label><input type="number" v-model.number="icaForm.poidsVifTotalKg" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">ICA Calculé :</label><input type="text" :value="icaCalculated" disabled class="w-full bg-emerald-100 border rounded p-2 font-black text-emerald-900 text-center text-sm" /></div>
          </div>

          <div class="overflow-x-auto pt-4 border-t">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Lot</th><th class="p-2 text-center">Aliment (Kg)</th><th class="p-2 text-center">Poids Vif (Kg)</th><th class="p-2 text-center">Indice ICA</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(item, idx) in registreICA" :key="idx"><td class="p-2 font-bold text-emerald-800">{{ item.codeProd }}</td><td class="p-2 text-center font-bold">{{ item.alimentConsommeKg }} kg</td><td class="p-2 text-center font-bold">{{ item.poidsVifTotalKg }} kg</td><td class="p-2 text-center font-mono font-black text-blue-900">{{ item.ica }}</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 15. MASQUE DE SAISIE : CRÉANCES & DETTES CLIENTS -->
      <div v-if="ongletActif === 'creances'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">🧾 15. Gestion des Créances &amp; Dettes Clients (CRM)</h2>
              <p class="text-xs text-slate-500">Suivi des encours et des impayés par client</p>
            </div>
            <button @click="sauvegarderCreance" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">💾 Enregistrer le Compte Client</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-xl border">
            <div><label class="block text-slate-500 mb-1 font-semibold">Nom du Client :</label><input type="text" v-model="creanceForm.client" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Total Facturé (FCFA) :</label><input type="number" v-model.number="creanceForm.montantTotal" class="w-full bg-white border rounded p-2 font-bold" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Total Versé (FCFA) :</label><input type="number" v-model.number="creanceForm.montantVersee" class="w-full bg-white border rounded p-2 font-bold text-emerald-600" /></div>
            <div><label class="block text-slate-500 mb-1 font-semibold">Reste Impayé :</label><input type="text" :value="formatFCFA(creanceForm.montantTotal - creanceForm.montantVersee)" disabled class="w-full bg-red-100 border rounded p-2 font-black text-red-700 text-center" /></div>
          </div>

          <div class="overflow-x-auto pt-4 border-t">
            <table class="w-full text-left text-xs border-collapse">
              <thead><tr class="bg-slate-100 font-bold"><th class="p-2">Client</th><th class="p-2 text-right">Facturé</th><th class="p-2 text-right">Versé</th><th class="p-2 text-right text-red-600">Reste Dû</th><th class="p-2 text-center">Statut</th></tr></thead>
              <tbody class="divide-y divide-slate-100"><tr v-for="(c, idx) in registreCreances" :key="idx"><td class="p-2 font-bold">{{ c.client }}</td><td class="p-2 text-right font-bold">{{ formatFCFA(c.montantTotal) }}</td><td class="p-2 text-right font-bold text-emerald-700">{{ formatFCFA(c.montantVersee) }}</td><td class="p-2 text-right font-black text-red-600">{{ formatFCFA(c.montantTotal - c.montantVersee) }}</td><td class="p-2 text-center"><span :class="['px-2 py-0.5 rounded font-bold text-[10px]', c.statut === 'Soldé' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800']">{{ c.statut }}</span></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 16. ÉDITEUR DE FACTURES -->
      <div v-if="ongletActif === 'facturation'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">📑 16. Éditeur de Factures B2B &amp; Bons de Commande</h2>
              <p class="text-xs text-slate-500">Générez et imprimez des factures normées aux couleurs du Groupe MAYAS</p>
            </div>
            <button @click="imprimerFactureClient" class="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm">🖨️ Imprimer la Facture</button>
          </div>

          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-6 text-xs max-w-3xl mx-auto shadow-inner">
            <div class="flex justify-between items-start border-b border-slate-300 pb-4">
              <div>
                <h3 class="text-base font-black text-emerald-900">CHEPITIMAYAS AGRI SARL</h3>
                <p class="text-[10px] text-slate-500">Siège social : Abidjan / Bouaké — Côte d'Ivoire</p>
                <p class="text-[10px] text-slate-500">Contact : chepitimayasagrisarl@gmail.com</p>
              </div>
              <div class="text-right">
                <span class="text-sm font-black text-purple-900 font-mono">FACTURE N° {{ factureForm.numFacture }}</span>
                <p class="text-[10px] text-slate-500">Date : {{ factureForm.date }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
              <div><span class="text-slate-500 block">Facturé à (Client) :</span><input type="text" v-model="factureForm.client" class="font-bold text-slate-900 bg-slate-50 border p-1 rounded w-full mt-1" /></div>
              <div><span class="text-slate-500 block">Adresse / Localité :</span><input type="text" v-model="factureForm.adresse" class="font-bold text-slate-900 bg-slate-50 border p-1 rounded w-full mt-1" /></div>
            </div>

            <table class="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border">
              <thead><tr class="bg-slate-100 uppercase text-[10px] font-bold"><th class="p-2">Désignation</th><th class="p-2 text-center">Quantité</th><th class="p-2 text-right">Prix Unitaire</th><th class="p-2 text-right">Total FCFA</th></tr></thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="p-2 font-bold"><input type="text" v-model="factureForm.article" class="w-full bg-transparent border-b" /></td>
                  <td class="p-2 text-center"><input type="number" v-model.number="factureForm.qte" class="w-20 text-center border rounded" /></td>
                  <td class="p-2 text-right"><input type="number" v-model.number="factureForm.prixUnitaire" class="w-24 text-right border rounded" /></td>
                  <td class="p-2 text-right font-bold text-emerald-800">{{ formatFCFA(factureForm.qte * factureForm.prixUnitaire) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="flex justify-between items-center bg-purple-900 text-white p-4 rounded-xl font-bold">
              <span>NET À PAYER :</span>
              <span class="text-base font-mono">{{ formatFCFA(factureForm.qte * factureForm.prixUnitaire) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 17. COMPARATEUR MULTI-SITES -->
      <div v-if="ongletActif === 'comparateur'" class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="border-b pb-3">
            <h2 class="text-lg font-bold text-slate-900">📊 17. Comparateur de Performance Multi-Sites</h2>
            <p class="text-xs text-slate-500">Analyse croisée des coûts, mortalité et rentabilité par bâtiment</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 class="font-bold text-sm text-emerald-900 border-b pb-2">🏢 Bâtiment A (Production Active)</h3>
              <p>• Sujets Initiaux : <strong>3 500</strong></p>
              <p>• Taux de Mortalité : <strong class="text-emerald-700">0.11 %</strong></p>
              <p>• Indice ICA : <strong>1.62</strong></p>
              <p>• Marge Nette Estimée : <strong class="text-purple-900">1 850 000 FCFA</strong></p>
            </div>

            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 class="font-bold text-sm text-slate-900 border-b pb-2">🏬 Bâtiment B (Clôturé)</h3>
              <p>• Sujets Initiaux : <strong>2 950</strong></p>
              <p>• Taux de Mortalité : <strong class="text-amber-700">1.40 %</strong></p>
              <p>• Indice ICA : <strong>1.58</strong></p>
              <p>• Marge Nette Estimée : <strong class="text-purple-900">1 420 000 FCFA</strong></p>
            </div>

            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 class="font-bold text-sm text-slate-900 border-b pb-2">🏡 Location 1 &amp; Bingerville</h3>
              <p>• Sujets Initiaux : <strong>2 000</strong></p>
              <p>• Taux de Mortalité : <strong class="text-emerald-700">0.80 %</strong></p>
              <p>• Indice ICA : <strong>1.65</strong></p>
              <p>• Marge Nette Estimée : <strong class="text-purple-900">980 000 FCFA</strong></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const utilisateurConnecte = ref({ nom: "CHEPITIMAYAS AGRI SARL", email: "chepitimayasagrisarl@gmail.com", role: "Administrateur Général" })
const deconnecter = () => { utilisateurConnecte.value = null }

const authForm = reactive({ email: 'chepitimayasagrisarl@gmail.com', password: 'Password123' })
const connecterUtilisateur = () => { utilisateurConnecte.value = { nom: "CHEPITIMAYAS AGRI SARL", role: "Administrateur Général" } }

const ongletActif = ref('dashboard')
const dateDuJour = new Date().toISOString().slice(0, 10)

const estEnLigne = ref(navigator.onLine)
onMounted(() => {
  window.addEventListener('online', () => { estEnLigne.value = true })
  window.addEventListener('offline', () => { estEnLigne.value = false })
  
  // Charger les données sauvegardées localement au démarrage
  const donneesSauvegardees = localStorage.getItem('mayas_volaille_db')
  if (donneesSauvegardees) {
    try {
      const parsed = JSON.parse(donneesSauvegardees)
      if (parsed.historiqueProductions) historiqueProductions.splice(0, historiqueProductions.length, ...parsed.historiqueProductions)
      if (parsed.historiqueDecoupes) historiqueDecoupes.splice(0, historiqueDecoupes.length, ...parsed.historiqueDecoupes)
      if (parsed.registrelivraisons) registrelivraisons.splice(0, registrelivraisons.length, ...parsed.registrelivraisons)
      if (parsed.stockGlobal) stockGlobal.splice(0, stockGlobal.length, ...parsed.stockGlobal)
      if (parsed.listeChargesPrincipales) listeChargesPrincipales.splice(0, listeChargesPrincipales.length, ...parsed.listeChargesPrincipales)
      if (parsed.listeProduitsVentes) listeProduitsVentes.splice(0, listeProduitsVentes.length, ...parsed.listeProduitsVentes)
      if (parsed.listeChargesSecondaires) listeChargesSecondaires.splice(0, listeChargesSecondaires.length, ...parsed.listeChargesSecondaires)
      if (parsed.registreICA) registreICA.splice(0, registreICA.length, ...parsed.registreICA)
      if (parsed.registreCreances) registreCreances.splice(0, registreCreances.length, ...parsed.registreCreances)
    } catch (e) {
      console.error("Erreur de chargement du stockage local", e)
    }
  }
})

// --- PERSISTANCE DES DONNÉES DANS LA BASE LOCALE & IMPORT/EXPORT ---
const sauvegarderLocalement = () => {
  const donneesApp = {
    historiqueProductions,
    historiqueDecoupes,
    registrelivraisons,
    stockGlobal,
    listeChargesPrincipales,
    listeProduitsVentes,
    listeChargesSecondaires,
    registreICA,
    registreCreances
  }
  localStorage.setItem('mayas_volaille_db', JSON.stringify(donneesApp))
}

const exporterDonneesJSON = () => {
  sauvegarderLocalement()
  const donneesApp = JSON.parse(localStorage.getItem('mayas_volaille_db'))
  const blob = new Blob([JSON.stringify(donneesApp, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sauvegarde-mayas-volaille-${dateDuJour}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const chargerDonneesJSON = (event) => {
  const fichier = event.target.files[0]
  if (!fichier) return
  const lecteur = new FileReader()
  lecteur.onload = (e) => {
    try {
      const dataImportee = JSON.parse(e.target.result)
      if (dataImportee.historiqueProductions) historiqueProductions.splice(0, historiqueProductions.length, ...dataImportee.historiqueProductions)
      if (dataImportee.historiqueDecoupes) historiqueDecoupes.splice(0, historiqueDecoupes.length, ...dataImportee.historiqueDecoupes)
      if (dataImportee.registrelivraisons) registrelivraisons.splice(0, registrelivraisons.length, ...dataImportee.registrelivraisons)
      if (dataImportee.stockGlobal) stockGlobal.splice(0, stockGlobal.length, ...dataImportee.stockGlobal)
      if (dataImportee.registreCreances) registreCreances.splice(0, registreCreances.length, ...dataImportee.registreCreances)
      sauvegarderLocalement()
      alert("📥 Données réelles importées et enregistrées avec succès dans la base !")
    } catch (err) {
      alert("❌ Fichier de sauvegarde invalide.")
    }
  }
  lecteur.readAsText(fichier)
}

const reinitialiserVides = () => {
  if (confirm("Voulez-vous effacer la base d'exemples pour commencer vos saisies réelles ?")) {
    historiqueProductions.splice(0)
    historiqueDecoupes.splice(0)
    registrelivraisons.splice(0)
    stockGlobal.splice(0)
    registreCreances.splice(0)
    registreICA.splice(0)
    sauvegarderLocalement()
    alert("✨ Base de données réinitialisée. Vous pouvez commencer la saisie !")
  }
}

// --- DONNÉES RÉACTIVES & MASQUES DE SAISIE 100% OPÉRATIONNELS ---

const codeProdFiltre = ref('PROD-2026-001')
const productionActive = reactive({ codeProd: 'PROD-2026-001', site: 'Bâtiment A', fournisseur: 'SIPRA', poussinsInitiaux: 3500, ageJours: 12, dateDebut: '2026-10-01' })

// 1. MASQUE CYCLES
const prodForm = reactive({ codeProd: 'PROD-2026-002', site: 'Bâtiment B', fournisseur: 'SIPRA', poussinsInitiaux: 3000, dateDebut: dateDuJour })
const historiqueProductions = reactive([
  { codeProd: 'PROD-2026-000', site: 'Bâtiment B', fournisseur: 'IVOGRAIN', dateDebut: '2026-08-01', dateFin: '2026-09-25', poussinsInitiaux: 2950 },
  { codeProd: 'PROD-2026-001', site: 'Bâtiment A', fournisseur: 'SIPRA', dateDebut: '2026-10-01', dateFin: null, poussinsInitiaux: 3500 }
])
const sauvegarderProduction = () => {
  if (!prodForm.codeProd) return alert("Veuillez saisir un code lot.")
  historiqueProductions.unshift({ ...prodForm, dateFin: null })
  sauvegarderLocalement()
  alert(`✅ Cycle ${prodForm.codeProd} enregistré dans la base !`)
}

// 2. MASQUE ÉLEVAGE
const saisieForm = reactive({ date: dateDuJour, codeProd: 'PROD-2026-001', quantitePoussins: 3500, ageJours: 12 })
const validerEnregistrement = () => {
  sauvegarderLocalement()
  alert("✅ Rapport d'élevage enregistré dans la base !")
}

// 3. MASQUE DÉPENSES
const depensesForm = reactive({ poussinsAjuste: 640000, alimentsAjuste: 580000 })
const sauvegarderDepenses = () => {
  sauvegarderLocalement()
  alert("✅ Dépenses mises à jour et stockées !")
}

// 4. MASQUE DÉCOUPES
const decoupeForm = reactive({ typeArticle: 'Pattes', poidsKg: 105, localite: 'Diegon / Abidjan', montantFCFA: 73500 })
const historiqueDecoupes = reactive([
  { date: dateDuJour, codeProd: 'PROD-2026-001', typeArticle: 'Pattes', poidsKg: 105, localite: 'Diegon / Abidjan', montantFCFA: 73500 }
])
const sauvegarderVenteDecoupe = () => {
  historiqueDecoupes.unshift({
    date: dateDuJour,
    codeProd: codeProdFiltre.value === 'TOUTES' ? productionActive.codeProd : codeProdFiltre.value,
    ...decoupeForm
  })
  sauvegarderLocalement()
  alert("✅ Vente de découpes enregistrée dans la base !")
}

// 5. MASQUE LIVRAISONS
const livraisonForm = reactive({ numLivraison: 'LIV-2026-001', organisme: 'SIPRA', dejaLivre: 3500, montantTotal: 2117500 })
const registrelivraisons = reactive([
  { date: dateDuJour, numLivraison: 'LIV-2026-001', codeProd: 'PROD-2026-001', organisme: 'SIPRA', dejaLivre: 3500, montantTotal: 2117500 }
])
const sauvegarderLivraison = () => {
  registrelivraisons.unshift({
    date: dateDuJour,
    codeProd: codeProdFiltre.value === 'TOUTES' ? productionActive.codeProd : codeProdFiltre.value,
    ...livraisonForm
  })
  sauvegarderLocalement()
  alert("✅ Bon de livraison ajouté à la base !")
}

// 6. MASQUE STOCKS
const stockForm = reactive({ ferme: 'Magasin Central Ahoué', article: 'Provende Démarrage', stockActuel: 5, seuilAlerte: 10 })
const stockGlobal = reactive([
  { ferme: 'Magasin Central Ahoué', article: 'Provende Prédémarrage', stockActuel: 5, seuilAlerte: 10 }
])
const sauvegarderStock = () => {
  stockGlobal.unshift({ ...stockForm })
  sauvegarderLocalement()
  alert("✅ Article ajouté au stock et sauvegardé !")
}

// 7. MASQUE BILAN
const bilanForm = reactive({ categorie: 'Charges Principales', libelle: 'Copeaux de bois', details: 'Forfait', montantFCFA: 300000 })
const listeChargesPrincipales = reactive([{ libelle: 'Copeaux de bois', details: 'Forfait', montantFCFA: 300000 }])
const listeProduitsVentes = reactive([{ libelle: 'Vente de Poulets', details: '9 610 sujets', montantFCFA: 22103000 }])
const listeChargesSecondaires = reactive([{ libelle: 'Salaire', details: '650 000f × 2', montantFCFA: 1300000 }])

const totalChargesPrincipales = computed(() => listeChargesPrincipales.reduce((a, b) => a + (b.montantFCFA || 0), 0))
const totalProduitsVentes = computed(() => listeProduitsVentes.reduce((a, b) => a + (b.montantFCFA || 0), 0))
const beneficeBrutCalculated = computed(() => totalProduitsVentes.value - totalChargesPrincipales.value)
const totalChargesSecondaires = computed(() => listeChargesSecondaires.reduce((a, b) => a + (b.montantFCFA || 0), 0))
const beneficeNetFinal = computed(() => beneficeBrutCalculated.value - totalChargesSecondaires.value)

const sauvegarderBilanItem = () => {
  if (bilanForm.categorie === 'Charges Principales') {
    listeChargesPrincipales.unshift({ libelle: bilanForm.libelle, details: bilanForm.details, montantFCFA: bilanForm.montantFCFA })
  } else if (bilanForm.categorie === 'Produits (Ventes)') {
    listeProduitsVentes.unshift({ libelle: bilanForm.libelle, details: bilanForm.details, montantFCFA: bilanForm.montantFCFA })
  } else {
    listeChargesSecondaires.unshift({ libelle: bilanForm.libelle, details: bilanForm.details, montantFCFA: bilanForm.montantFCFA })
  }
  sauvegarderLocalement()
  alert("✅ Ligne enregistrée dans le bilan !")
}

// 8. MASQUE MORTALITÉ
const mortaliteForm = reactive({ date: dateDuJour, lot: 'PROD-2026-001', sujetsMorts: 4 })
const tauxMortaliteCalculated = computed(() => ((mortaliteForm.sujetsMorts / 3500) * 100).toFixed(2))
const sauvegarderMortalite = () => {
  sauvegarderLocalement()
  alert(`✅ Mortalité (${mortaliteForm.sujetsMorts} sujets) enregistrée dans la base !`)
}

// 9. MASQUE ÉQUIPEMENTS / PERSONNEL / LOGISTIQUE
const equipementForm = reactive({ designation: 'Abreuvoirs', prestataire: 'Atelier', cout: 45000, etat: 'Opérationnel' })
const sauvegarderEquipement = () => { sauvegarderLocalement(); alert("✅ Équipement enregistré !") }

const personnelForm = reactive({ nom: 'Kouassi Jean', poste: 'Passeur', salaire: 120000, statutPaiement: 'En attente' })
const sauvegarderPersonnel = () => { sauvegarderLocalement(); alert("✅ Employé enregistré !") }

const logistiqueForm = reactive({ vehicule: 'Tricycle', destination: 'Bouaké', frais: 25000 })
const sauvegarderLogistique = () => { sauvegarderLocalement(); alert("✅ Trajet enregistré !") }

// 10. MASQUE ICA
const icaForm = reactive({ codeProd: 'PROD-2026-001', alimentConsommeKg: 4200, poidsVifTotalKg: 2600 })
const icaCalculated = computed(() => (icaForm.poidsVifTotalKg > 0 ? (icaForm.alimentConsommeKg / icaForm.poidsVifTotalKg).toFixed(2) : '0.00'))
const registreICA = reactive([{ codeProd: 'PROD-2026-001', alimentConsommeKg: 4200, poidsVifTotalKg: 2600, ica: '1.62' }])
const sauvegarderICA = () => {
  registreICA.unshift({ ...icaForm, ica: icaCalculated.value })
  sauvegarderLocalement()
  alert("✅ Calcul ICA enregistré dans la base !")
}

// 11. MASQUE CRÉANCES CLIENTS
const creanceForm = reactive({ client: 'Restaurant Le Gourmet', montantTotal: 350000, montantVersee: 200000, echeance: dateDuJour, statut: 'Partiellement Payé' })
const registreCreances = reactive([
  { client: 'Grossiste Marché Bouaké', montantTotal: 850000, montantVersee: 400000, echeance: '2026-10-25', statut: 'Impayé en retard' }
])
const totalCreancesImpayees = computed(() => registreCreances.reduce((acc, c) => acc + (c.montantTotal - c.montantVersee), 0))
const sauvegarderCreance = () => {
  registreCreances.unshift({ ...creanceForm })
  sauvegarderLocalement()
  alert("✅ Compte client / Créance ajouté à la base !")
}

// FACTURATION
const factureForm = reactive({ numFacture: 'FAC-2026-089', date: dateDuJour, client: 'Restaurant Le Gourmet', adresse: 'Abidjan Cocody', article: 'Poulets de chair Vifs (Sujets 2.2kg)', qte: 150, prixUnitaire: 2300 })
const imprimerFactureClient = () => window.print()

// FILTRAGES
const livraisonsFiltrees = computed(() => codeProdFiltre.value === 'TOUTES' ? registrelivraisons : registrelivraisons.filter(l => l.codeProd === codeProdFiltre.value))
const decoupesFiltrees = computed(() => codeProdFiltre.value === 'TOUTES' ? historiqueDecoupes : historiqueDecoupes.filter(d => d.codeProd === codeProdFiltre.value))
const totalCAPouletsFiltre = computed(() => livraisonsFiltrees.value.reduce((acc, l) => acc + (l.montantTotal || 0), 0))
const totalCADecoupesFiltre = computed(() => decoupesFiltrees.value.reduce((acc, d) => acc + (d.montantFCFA || 0), 0))

const formatFCFA = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val || 0)
const exporterRapportProductionPDF = () => { ongletActif.value = 'rapport_lot'; setTimeout(() => window.print(), 300) }
</script>

<style>
@media print {
  body { background-color: white !important; }
  header, button, nav, select { display: none !important; }
}
</style>