/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mayas: {
          green: '#28A745',     // Vert du texte "MAYAS VOLAILLE"
          greenDark: '#1E7E34', // Vert foncé pour le survol/accents
          yellow: '#FFC107',    // Jaune/Or de l'œuf et du soleil
          orange: '#FF8500',    // Orange du rayon de soleil
          dark: '#333333',      // Gris foncé du sous-titre
          light: '#F8F9FA',     // Fond de page clair
        }
      }
    },
  },
  plugins: [],
}