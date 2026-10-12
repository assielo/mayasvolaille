<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Table des Fermes
        Schema::create('fermes', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->string('nom');
            $table->string('localisation')->nullable();
            $table->string('responsable_id')->nullable();
            $table->timestamps();
        });

        // 2. Table des Bâtiments
        Schema::create('batiments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('ferme_id')->constrained('fermes')->onDelete('cascade');
            $table->string('nom');
            $table->integer('capacite')->nullable();
            $table->timestamps();
        });

        // 3. Table des Lots (Poulets de chair ou Pondeuses)
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->string('code_lot')->unique();
            $table->foreignId('ferme_id')->constrained('fermes')->onDelete('cascade');
            $table->foreignId('batiment_id')->constrained('batiments')->onDelete('cascade');
            $table->enum('type_production', ['chair', 'pondeuses']);
            $table->string('souche')->nullable();
            $table->date('date_entree');
            $table->integer('effectif_initial');
            $table->string('fournisseur')->nullable();
            $table->string('objectif')->nullable();
            $table->enum('statut', ['en_cours', 'termine', 'cloture'])->default('en_cours');
            $table->timestamps();
        });

        // 4. Table des Rapports Quotidiens (Mode hors ligne)
        Schema::create('rapports_quotidiens', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('lot_id')->constrained('lots')->onDelete('cascade');
            $table->date('date_rapport');
            $table->integer('effectif_vivant')->nullable();
            $table->integer('mortalite_jour')->default(0);
            $table->decimal('aliments_distribues_kg', 8, 2)->default(0);
            $table->decimal('eau_consommee_litres', 8, 2)->default(0);
            $table->decimal('poids_moyen_g', 8, 2)->nullable();
            
            // Spécifique pondeuses
            $table->integer('oeufs_pondus')->default(0);
            $table->integer('oeufs_casses')->default(0);
            $table->integer('oeufs_declasses')->default(0);
            
            $table->text('observations')->nullable();
            $table->enum('sync_status', ['synchronise', 'en_attente', 'en_erreur'])->default('synchronise');
            $table->timestamp('device_created_at')->nullable();
            $table->timestamps();
        });

        // 5. Table des Articles et Stocks
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('ferme_id')->constrained('fermes')->onDelete('cascade');
            $table->string('nom');
            $table->enum('categorie', ['aliment', 'poussin', 'medicament', 'emballage', 'materiel']);
            $table->decimal('stock_actuel', 10, 2)->default(0);
            $table->string('unite');
            $table->decimal('seuil_alerte', 10, 2)->default(0);
            $table->timestamps();
        });

        // 6. Table des Transactions (Achats, Ventes, Dépenses)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('ferme_id')->constrained('fermes')->onDelete('cascade');
            $table->enum('type', ['achat', 'vente', 'depense']);
            $table->string('tiers_nom')->nullable();
            $table->decimal('montant_total', 12, 2);
            $table->decimal('montant_paye', 12, 2)->default(0);
            $table->enum('statut_paiement', ['paye', 'partiel', 'impaye'])->default('impaye');
            $table->date('date_transaction');
            $table->timestamps();
        });

        // 7. Table des Alertes Logs (SMS, WhatsApp, Push)
        Schema::create('alertes_logs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('ferme_id')->nullable()->constrained('fermes')->onDelete('cascade');
            $table->string('type_alerte');
            $table->text('message');
            $table->string('destinataire');
            $table->enum('canal', ['sms', 'whatsapp', 'push'])->default('whatsapp');
            $table->enum('statut', ['envoye', 'echec', 'en_attente'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes_logs');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('rapports_quotidiens');
        Schema::dropIfExists('lots');
        Schema::dropIfExists('batiments');
        Schema::dropIfExists('fermes');
    }
};
