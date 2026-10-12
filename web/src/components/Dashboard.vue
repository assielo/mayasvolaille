<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- Navigation / Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <!-- Logo Badge -->
        <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
          MV
        </div>
        <div>
          <h1 class="text-xl font-bold text-emerald-600 tracking-wide">MAYAS VOLAILLE</h1>
          <p class="text-xs text-gray-500 italic">De l'élevage à votre assiette.</p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="text-sm font-semibold text-gray-600">Vue consolidée · Toutes les fermes</span>
        <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
          En direct
        </span>
      </div>
    </header>

    <!-- Contenu Principal -->
    <main class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Cartes KPI -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase">Fermes Actives</p>
            <h3 class="text-3xl font-extrabold text-gray-800 mt-1">05</h3>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-2xl">
            🏡
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase">Effectif Vivant</p>
            <h3 class="text-3xl font-extrabold text-gray-800 mt-1">24 850</h3>
          </div>
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-2xl">
            🐔
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase">Alertes Stock</p>
            <h3 class="text-3xl font-extrabold text-rose-600 mt-1">03</h3>
          </div>
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-2xl">
            ⚠️
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase">Dépenses Mois</p>
            <h3 class="text-2xl font-extrabold text-gray-800 mt-1">2,45 M <span class="text-xs font-normal">FCFA</span></h3>
          </div>
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-2xl">
            💳
          </div>
        </div>
      </div>

      <!-- Section Alertes Prioritaires -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <span>🔔</span>
          <span>Alertes prioritaires en temps réel</span>
        </h2>

        <div class="space-y-3">
          <div class="p-4 rounded-lg bg-orange-50 border-l-4 border-orange-500 flex justify-between items-center">
            <div>
              <p class="font-bold text-orange-900">Stock d'aliments bas</p>
              <p class="text-sm text-orange-700">Ferme 02 · Aliment Croissance sous le seuil critique (120 kg restant)</p>
            </div>
            <button class="bg-orange-500 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-orange-600 transition">
              Vérifier le stock
            </button>
          </div>

          <div class="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 flex justify-between items-center">
            <div>
              <p class="font-bold text-amber-900">Traitement à programmer</p>
              <p class="text-sm text-amber-800">Ferme 04 · Rappel vaccin Newcastle — Échéance à confirmer</p>
            </div>
            <button class="bg-amber-500 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-amber-600 transition">
              Voir calendrier
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Composant Tableau de bord Mayas Volaille
</script>