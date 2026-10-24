const input = document.querySelector("#menu input");  
const button = document.querySelector("#menu button");
const dataDiv = document.querySelector("#data");       

// L'API donne un numéro pour la météo, ce tableau le traduit en texte + emoji
const CODES_METEO = {
    0: ["Ciel dégagé", "☀️"],
    1: ["Plutôt dégagé", "🌤️"],
    2: ["Partiellement nuageux", "⛅"],
    3: ["Couvert", "☁️"],
    45: ["Brouillard", "🌫️"],
    48: ["Brouillard givrant", "🌫️"],
    51: ["Bruine légère", "🌦️"],
    53: ["Bruine", "🌦️"],
    55: ["Bruine forte", "🌦️"],
    61: ["Pluie légère", "🌧️"],
    63: ["Pluie", "🌧️"],
    65: ["Pluie forte", "🌧️"],
    71: ["Neige légère", "🌨️"],
    73: ["Neige", "🌨️"],
    75: ["Neige forte", "❄️"],
    80: ["Averses légères", "🌦️"],
    81: ["Averses", "🌧️"],
    82: ["Averses violentes", "⛈️"],
    95: ["Orage", "⛈️"],
    96: ["Orage avec grêle", "⛈️"],
    99: ["Orage violent avec grêle", "⛈️"]
};

// Donne le texte et l'emoji pour un numéro de météo
function decrireMeteo(code) {
    return CODES_METEO[code] || ["Conditions inconnues", "❓"];
}

// Va chercher des données sur internet et les transforme en objet JavaScript
function fetchJson(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error("Erreur HTTP " + response.status);
        }
        return response.json();
    });
}

// Protège la page : transforme les caractères spéciaux du texte en texte simple
function echapperHtml(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
}

// textContent affiche le message comme du texte, jamais comme du code HTML
function afficherErreur(message) {
    const p = document.createElement("p");
    p.className = "erreur";
    p.textContent = message;
    dataDiv.replaceChildren(p);
}

// Affiche la météo d'un endroit grâce à sa latitude et sa longitude
function afficherMeteo(lat, lon, nomLieu) {
    dataDiv.textContent = "Chargement de la météo...";

    // Adresse de l'API météo avec Long et latitude
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current_weather=true`
        + `&daily=weathercode,temperature_2m_max,temperature_2m_min`
        + `&timezone=auto`;

    fetchJson(url)
        .then(data => {
            const actuel = data.current_weather;
            const [texte, emoji] = decrireMeteo(actuel.weathercode);

            // On prépare les cartes des jours suivants
            let previsions = "";
            for (let i = 1; i < data.daily.time.length; i++) {
                const jour = new Date(data.daily.time[i]).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric"
                });
                const [, emojiJour] = decrireMeteo(data.daily.weathercode[i]);
                previsions += `
                    <div class="jour">
                        <strong>${jour}</strong>
                        <div>${emojiJour}</div>
                        <div>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
                    </div>`;
            }

            // On met tout dans la page
            dataDiv.innerHTML = `
                <div class="actuel">
                    <h2>${echapperHtml(nomLieu)}</h2>
                    <div><span class="gros">${emoji} ${actuel.temperature}°C</span></div>
                    <p>${texte}</p>
                    <p>Vent : ${actuel.windspeed} km/h</p>
                </div>
                <h3>Prochains jours</h3>
                <div class="previsions">${previsions}</div>
            `;
        })
        .catch(erreur => {
            // Si quelque chose plante (pas d'internet, API en panne...)
            console.error("Erreur météo :", erreur);
            afficherErreur("Impossible de récupérer la météo, réessaie.");
        });
}

// Trouve le nom d'une ville à partir de coordonnées (quand on clique sur la carte)
function fetchCityName(lat, lon) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client`
        + `?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;

    return fetchJson(url).then(data => {
        // On prend le premier nom qui existe
        const ville = data.city || data.locality || data.principalSubdivision;
        if (!ville) {
            return "Position choisie";
        }
        // On ajoute le pays s'il existe
        return data.countryName ? `${ville}, ${data.countryName}` : ville;
    });
}

function rechercherVille() {
    const nom = input.value.trim();
    if (!nom) {
        afficherErreur("Écris le nom d'une ville.");
        return;
    }

    dataDiv.textContent = "Recherche de la ville...";

    // API qui donne les coordonnées d'une ville
    const url = `https://geocoding-api.open-meteo.com/v1/search`
        + `?name=${encodeURIComponent(nom)}&count=1&language=fr`;

    fetchJson(url)
        .then(data => {

            if (!data.results || data.results.length === 0) {
                afficherErreur("Ville introuvable : " + nom);
                return;
            }

            const lieu = data.results[0];
            const lat = lieu.latitude;
            const lon = lieu.longitude;
            placerMarqueur(lat, lon);
            map.setView([lat, lon], 10);

            afficherMeteo(lat, lon, `${lieu.name}, ${lieu.country}`);
        })
        .catch(erreur => {
            console.error("Erreur de recherche :", erreur);
            afficherErreur("Problème de connexion, réessaie.");
        });
}

// On crée la carte, centrée sur la France
const map = L.map("map").setView([46.6, 2.5], 5);

// On charge les images de la carte (OpenStreetMap)
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
}).addTo(map);

// Le marqueur n'existe pas au départ
let marqueur = null;

// Place le marqueur sur la carte (le crée ou le déplace)
function placerMarqueur(lat, lon) {
    if (marqueur) {
        marqueur.setLatLng([lat, lon]);
    } else {
        marqueur = L.marker([lat, lon]).addTo(map);
    }
}

// Quand on clique sur la carte
function onclickMap(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    placerMarqueur(lat, lon);
    dataDiv.textContent = "Recherche du lieu...";
    fetchCityName(lat, lon)
        .then(nom => afficherMeteo(lat, lon, nom))
        .catch(erreur => {
            console.error("Erreur nom de la ville :", erreur);
            afficherMeteo(lat, lon, "Position choisie");
        });
}
map.on("click", onclickMap);
button.addEventListener("click", rechercherVille);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        rechercherVille();
    }
});