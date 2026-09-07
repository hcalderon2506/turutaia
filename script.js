const state = {

  step: 1,

  data: {
    destination: "Cusco",
    days: "2 - 3 días",
    budget: "Moderado",
    interests: [
      "Cultura",
      "Gastronomía"
    ]
  },

  matrix: null,

  selectedActivity: null,

  currentRoute: null,

  savedRoute: null,

  ready: false

};


const $ = (id) =>
  document.getElementById(id);


const screens = () =>
  document.querySelectorAll(".screen");


const els = {

  start: $("startButton"),

  next: $("next"),

  steps: $("steps"),

  bar: $("bar"),

  stepText: $("stepText"),

  plannerError: $("plannerError"),

  search: $("destinationSearch"),

  searchResults: $("searchResults"),

  interests: $("interestChips"),

  profileInterests: $("profileInterests"),

  destinationGrid: $("destinationGrid"),

  loadTitle: $("loadTitle"),

  loadText: $("loadText"),

  routeTitle: $("routeTitle"),

  routeMeta: $("routeMeta"),

  reason: $("reason"),

  days: $("days"),

  saved: $("saved"),

  detailTitle: $("detailTitle"),

  detailRating: $("detailRating"),

  detailStats: $("detailStats"),

  detailDescription: $("detailDescription"),

  detailReason: $("detailReason")

};


/* =========================
   NAVEGACIÓN
   ========================= */

function showScreen(id){

  screens().forEach((screen) => {

    screen.classList.toggle(
      "active",
      screen.id === id
    );

  });


  const nav = $("bottomNav");


  /*
   * La navegación inferior NO aparece
   * en la pantalla de bienvenida.
   */

  nav.style.display =
    id === "welcome"
      ? "none"
      : "grid";


  document
    .querySelectorAll("#bottomNav [data-nav]")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.nav === id
      );

    });


  window.scrollTo(0, 0);

}


/* =========================
   INICIO
   ========================= */

function startApp(){

  if(!state.ready){
    return;
  }

  showScreen("home");

}


/* =========================
   PLANIFICADOR
   ========================= */

function resetPlanner(){

  state.step = 1;

  state.data.days = "2 - 3 días";

  state.data.budget = "Moderado";

  state.data.interests = [
    "Cultura",
    "Gastronomía"
  ];

  renderPlanner();

}


function openPlanner(destination = null){

  if(!state.ready){
    return;
  }


  if(destination){

    state.data.destination =
      destination;

  }


  resetPlanner();


  if(destination){

    renderPlanner();

  }


  showScreen("planner");

}


/* =========================
   INTERESES
   ========================= */

function selectInterest(interest){

  if(
    state.data.interests
      .includes(interest)
  ){

    state.data.interests =
      state.data.interests
        .filter(
          (item) => item !== interest
        );

  }else{

    state.data.interests.push(
      interest
    );

  }


  renderHome();

}


/* =========================
   HOME
   ========================= */

function renderHome(){

  if(!state.matrix){
    return;
  }


  const interests =
    state.matrix.interest_options || [];


  els.interests.innerHTML =
    interests
      .map((interest) => `

        <button
          type="button"
          class="${
            state.data.interests.includes(interest)
              ? "selected"
              : ""
          }"
          data-interest="${escapeHtml(interest)}"
        >
          ${escapeHtml(interest)}
        </button>

      `)
      .join("");


  els.profileInterests.innerHTML =
    (
      state.data.interests.length
        ? state.data.interests
        : ["Elige tus intereses"]
    )
    .map(
      (interest) =>
        `<span>${escapeHtml(interest)}</span>`
    )
    .join("");


  const destinations =
    state.matrix.destinations || [];


  els.destinationGrid.innerHTML =
    destinations
      .slice(0, 8)
      .map((destination) => {

        const route =
          state.matrix.routes.find(
            (item) =>
              item.destination === destination
          );


        const cats =
          route?.activities
            ?.flatMap(
              (activity) =>
                activity.category || []
            ) || [];


        const uniqueCats =
          [
            ...new Set(cats)
          ]
          .slice(0, 2)
          .join(" · ");


        return `

          <button
            type="button"
            data-destination="${escapeHtml(destination)}"
          >

            <b>
              ${escapeHtml(destination)}
            </b>

            <small>
              ${escapeHtml(
                uniqueCats ||
                "Experiencias · Perú"
              )}
            </small>

          </button>

        `;

      })
      .join("");

}


/* =========================
   BUSCADOR
   ========================= */

function renderSearchResults(
  query = ""
){

  const destinations =
    state.matrix?.destinations || [];


  const q =
    query
      .trim()
      .toLowerCase();


  const matches =
    q
      ? destinations
          .filter(
            (destination) =>
              destination
                .toLowerCase()
                .includes(q)
          )
          .slice(0, 5)
      : [];


  if(!matches.length){

    els.searchResults.hidden =
      true;

    els.searchResults.innerHTML =
      "";

    return;

  }


  els.searchResults.hidden =
    false;


  els.searchResults.innerHTML =
    matches
      .map(
        (destination) => `

          <button
            type="button"
            data-search-destination="${escapeHtml(destination)}"
          >
            ⌖ &nbsp;
            ${escapeHtml(destination)}
          </button>

        `
      )
      .join("");

}


/* =========================
   PLANIFICADOR
   ========================= */

function renderPlanner(){

  if(!state.matrix){
    return;
  }


  const {
    step,
    data,
    matrix
  } = state;


  let html = "";


  /* PASO 1 */

  if(step === 1){

    html =
      `<h3>¿A dónde quieres ir?</h3>` +

      (
        matrix.destinations || []
      )
      .map(
        (destination) =>
          optionButton(
            "destination",
            destination,
            data.destination === destination
          )
      )
      .join("");

  }


  /* PASO 2 */

  if(step === 2){

    html =
      `<h3>¿Cuánto tiempo tienes?</h3>` +

      (
        matrix.time_options || []
      )
      .map(
        (value) =>
          optionButton(
            "days",
            value,
            data.days === value
          )
      )
      .join("");

  }


  /* PASO 3 */

  if(step === 3){

    html =
      `<h3>¿Cuál es tu presupuesto?</h3>` +

      (
        matrix.budget_options || []
      )
      .map(
        (value) =>
          optionButton(
            "budget",
            value,
            data.budget === value,
            "💰 "
          )
      )
      .join("");

  }


  /* PASO 4 */

  if(step === 4){

    html =
      `<h3>¿Qué te interesa?</h3>
       <p>Selecciona uno o más intereses.</p>` +

      (
        matrix.interest_options || []
      )
      .map(
        (value) => `

          <button
            type="button"
            class="
              option
              ${
                data.interests
                  .includes(value)
                  ? "selected"
                  : ""
              }
            "
            data-interest-option="${escapeHtml(value)}"
          >
            ${escapeHtml(value)}
          </button>

        `
      )
      .join("");

  }


  els.steps.innerHTML =
    html;


  els.stepText.textContent =
    `Paso ${step} de 4`;


  els.bar.style.width =
    `${step * 25}%`;


  els.next.innerHTML =
    step === 4
      ? `Crear mi ruta <span>→</span>`
      : `Continuar <span>→</span>`;


  els.plannerError.hidden =
    true;

}


/* =========================
   OPCIONES
   ========================= */

function optionButton(
  key,
  value,
  selected,
  prefix = ""
){

  return `

    <button
      type="button"
      class="
        option
        ${selected ? "selected" : ""}
      "
      data-pick-key="${key}"
      data-pick-value="${escapeHtml(value)}"
    >

      ${prefix}${escapeHtml(value)}

    </button>

  `;

}


/* =========================
   SIGUIENTE PASO
   ========================= */

function nextStep(){

  if(!state.ready){
    return;
  }


  if(state.step < 4){

    state.step += 1;

    renderPlanner();

    return;

  }


  if(!state.data.interests.length){

    els.plannerError.textContent =
      "Selecciona al menos un interés para personalizar tu ruta.";

    els.plannerError.hidden =
      false;

    return;

  }


  generateRoute();

}


/* =========================
   GENERAR RUTA
   ========================= */

function generateRoute(){

  showScreen("loading");


  const messages = [

    [
      "Creando tu ruta...",
      "Cruzando destino, tiempo, presupuesto e intereses."
    ],

    [
      "Personalizando opciones...",
      "Priorizando actividades según tus intereses."
    ],

    [
      "Buscando experiencias locales...",
      "Aplicando las reglas de la matriz."
    ],

    [
      "¡Tu ruta está lista!",
      "Encontramos una ruta para ti."
    ]

  ];


  let index = 0;


  els.loadTitle.textContent =
    messages[0][0];


  els.loadText.textContent =
    messages[0][1];


  const timer =
    setInterval(() => {

      index += 1;


      if(index >= messages.length){

        clearInterval(timer);

        buildRoute();

        return;

      }


      els.loadTitle.textContent =
        messages[index][0];


      els.loadText.textContent =
        messages[index][1];

    }, 550);

}


/* =========================
   CONSTRUIR RUTA
   ========================= */

function buildRoute(){

  const {
    destination,
    days,
    budget,
    interests
  } = state.data;


  const routes =
    state.matrix.routes || [];


  const candidates =
    routes.filter(
      (route) =>
        route.destination === destination
    );


  if(!candidates.length){

    showError(
      "No encontramos rutas para ese destino. Elige otro destino."
    );

    return;

  }


  const route =
    candidates.find(
      (item) =>
        item.time === days
    ) ||
    candidates[0];


  const activities =
    [
      ...(route.activities || [])
    ]
    .sort(
      (a, b) =>
        scoreActivity(
          b,
          interests,
          budget
        ) -
        scoreActivity(
          a,
          interests,
          budget
        )
    );


  state.currentRoute =
    route;


  els.routeTitle.textContent =
    route.route ||
    `Ruta por ${destination}`;


  els.routeMeta.textContent =
    `${route.destination} · ${route.time} · ${budget}`;


  els.reason.textContent =
    `Seleccionamos ${
      route.route ||
      "esta ruta"
    } para ${destination} y priorizamos actividades relacionadas con ${
      interests.join(", ")
    }. El presupuesto seleccionado fue ${
      budget.toLowerCase()
    }.`;


  els.days.innerHTML = `

    <div class="day">

      <b>
        Ruta recomendada
      </b>

      ${
        activities
          .map(
            (activity) =>
              activityCard(activity)
          )
          .join("")
      }

    </div>

  `;


  showScreen("route");

}


/* =========================
   PUNTUACIÓN
   ========================= */

function scoreActivity(
  activity,
  interests,
  budget
){

  let score =

    (activity.category || [])
      .reduce(
        (total, category) =>
          total +
          (
            interests.includes(category)
              ? 5
              : 0
          ),
        0
      );


  const cost =
    extractCost(activity.cost);


  if(
    budget === "Económico"
  ){

    score +=
      cost <= 40
        ? 3
        : cost <= 80
          ? 1
          : -2;

  }


  if(
    budget === "Moderado"
  ){

    score +=
      cost <= 120
        ? 2
        : 0;

  }


  if(
    budget === "Premium"
  ){

    score +=
      cost >= 80
        ? 3
        : 0;

  }


  return score;

}


/* =========================
   COSTO
   ========================= */

function extractCost(
  text = ""
){

  if(/gratis/i.test(text)){
    return 0;
  }


  const numbers =
    (
      text.match(
        /\d+(?:\.\d+)?/g
      ) || []
    )
    .map(Number);


  return numbers.length
    ? Math.max(...numbers)
    : 60;

}


/* =========================
   TARJETA DE ACTIVIDAD
   ========================= */

function activityCard(activity){

  const categories =
    (
      activity.category || []
    ).join(" · ");


  const encodedName =
    encodeURIComponent(
      activity.name ||
      "Experiencia"
    );


  return `

    <div class="activity">

      <span class="activity-time">
        ${escapeHtml(
          activity.time || ""
        )}
      </span>

      <b>
        ${escapeHtml(
          activity.name ||
          "Experiencia"
        )}
      </b>

      <span class="activity-meta">
        ${escapeHtml(categories)}
        ·
        ${escapeHtml(
          activity.cost ||
          "Consultar"
        )}
      </span>

      <br>

      <button
        type="button"
        data-activity="${encodedName}"
      >
        Ver detalle →
      </button>

    </div>

  `;

}


/* =========================
   DETALLE
   ========================= */

function showDetail(name){

  const decoded =
    decodeURIComponent(name);


  const activity =
    state.currentRoute
      ?.activities
      ?.find(
        (item) =>
          item.name === decoded
      )
    ||
    state.matrix.routes
      .flatMap(
        (route) =>
          route.activities || []
      )
      .find(
        (item) =>
          item.name === decoded
      );


  if(!activity){
    return;
  }


  state.selectedActivity =
    activity;


  els.detailTitle.textContent =
    activity.name;


  els.detailRating.textContent =
    `★ 4.8 · ${state.data.destination}`;


  els.detailStats.innerHTML = `

    <span>
      ⏱
      <b>
        ${escapeHtml(
          activity.time ||
          "Flexible"
        )}
      </b>
    </span>

    <span>
      ◉
      <b>
        ${escapeHtml(
          activity.cost ||
          "Consultar"
        )}
      </b>
    </span>

    <span>
      ⌖
      <b>
        ${escapeHtml(
          state.data.destination
        )}
      </b>
    </span>

  `;


  els.detailDescription.textContent =
    `Una experiencia seleccionada dentro de tu ruta por ${state.data.destination}, alineada con tus preferencias de ${state.data.interests.join(", ")}.`;


  els.detailReason.textContent =
    `Coincide con tus intereses y se adapta a la planificación de ${state.data.days} y al presupuesto ${state.data.budget.toLowerCase()}.`;


  showScreen("detail");

}


/* =========================
   GUARDAR RUTA
   ========================= */

function saveRoute(){

  if(!state.currentRoute){
    return;
  }


  state.savedRoute = {

    route:
      state.currentRoute.route,

    destination:
      state.data.destination,

    days:
      state.data.days,

    budget:
      state.data.budget,

    savedAt:
      new Date().toISOString()

  };


  localStorage.setItem(
    "turutaia_saved_route",
    JSON.stringify(
      state.savedRoute
    )
  );


  renderSaved();


  $("saveRoute").innerHTML =
    `Ruta guardada <span>✓</span>`;

}


/* =========================
   CARGAR RUTA GUARDADA
   ========================= */

function loadSaved(){

  try{

    state.savedRoute =
      JSON.parse(
        localStorage.getItem(
          "turutaia_saved_route"
        )
      ) || null;

  }catch{

    state.savedRoute =
      null;

  }


  renderSaved();

}


/* =========================
   MOSTRAR RUTA GUARDADA
   ========================= */

function renderSaved(){

  if(!state.savedRoute){

    els.saved.className =
      "empty";


    els.saved.innerHTML = `

      <b>
        Aún no tienes viajes guardados
      </b>

      <p>
        Crea una ruta y guárdala aquí.
      </p>

    `;

    return;

  }


  const route =
    state.savedRoute;


  els.saved.className =
    "card";


  els.saved.innerHTML = `

    <b>
      ${escapeHtml(
        route.route
      )}
    </b>

    <p>
      ${escapeHtml(
        route.destination
      )}
      ·
      ${escapeHtml(
        route.days
      )}
      ·
      ${escapeHtml(
        route.budget
      )}
    </p>

  `;

}


/* =========================
   ERROR
   ========================= */

function showError(message){

  showScreen("home");

  alert(message);

}


/* =========================
   SEGURIDAD HTML
   ========================= */

function escapeHtml(value){

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================
   CARGAR MATRIZ
   ========================= */

async function loadMatrix(){

  try{

    const response =
      await fetch(
        "./routes.json",
        {
          cache:"no-store"
        }
      );


    if(!response.ok){

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    state.matrix =
      await response.json();


    if(
      !Array.isArray(
        state.matrix.destinations
      ) ||
      !Array.isArray(
        state.matrix.routes
      )
    ){

      throw new Error(
        "La matriz no tiene la estructura esperada."
      );

    }


    state.ready =
      true;


    els.start.disabled =
      false;


    els.start.innerHTML = `
      <span>Comenzar</span>
      <span aria-hidden="true">→</span>
    `;


    renderHome();

    renderPlanner();


  }catch(error){

    console.error(
      "Error cargando routes.json:",
      error
    );


    els.start.disabled =
      false;


    els.start.innerHTML = `
      <span>Reintentar</span>
      <span aria-hidden="true">↻</span>
    `;


    els.start.dataset.retry =
      "true";

  }

}


/* =========================
   EVENTOS DE BOTONES
   ========================= */

document.addEventListener(
  "click",
  (event) => {

    const target =
      event.target.closest(
        "button"
      );


    if(!target){
      return;
    }


    /* BIENVENIDA */

    if(
      target === els.start
    ){

      if(
        target.dataset.retry
      ){

        target.dataset.retry =
          "";

        target.disabled =
          true;

        loadMatrix();

      }else{

        startApp();

      }

      return;

    }


    /* NAVEGACIÓN */

    const nav =
      target.dataset.nav;


    if(nav){

      showScreen(nav);

      return;

    }


    /* ATRÁS */

    const back =
      target.dataset.back;


    if(back){

      showScreen(back);

      return;

    }


    /* INTERESES HOME */

    const interest =
      target.dataset.interest;


    if(interest){

      selectInterest(
        interest
      );

      return;

    }


    /* DESTINO */

    const destination =
      target.dataset.destination;


    if(destination){

      openPlanner(
        destination
      );

      return;

    }


    /* BUSCADOR */

    const searchDestination =
      target.dataset
        .searchDestination;


    if(searchDestination){

      state.data.destination =
        searchDestination;


      els.search.value =
        searchDestination;


      els.searchResults.hidden =
        true;


      openPlanner(
        searchDestination
      );

      return;

    }


    /* OPCIONES DEL PLANIFICADOR */

    const pickKey =
      target.dataset.pickKey;


    if(pickKey){

      state.data[pickKey] =
        target.dataset.pickValue;


      renderPlanner();

      return;

    }


    /* INTERESES DEL PLANIFICADOR */

    const interestOption =
      target.dataset
        .interestOption;


    if(interestOption){

      if(
        state.data.interests
          .includes(
            interestOption
          )
      ){

        state.data.interests =
          state.data.interests
            .filter(
              (item) =>
                item !== interestOption
            );

      }else{

        state.data.interests.push(
          interestOption
        );

      }


      renderPlanner();

      return;

    }


    /* DETALLE */

    const activity =
      target.dataset.activity;


    if(activity){

      showDetail(
        activity
      );

      return;

    }


    /* CONTINUAR */

    if(
      target === els.next
    ){

      nextStep();

      return;

    }


    /* CREAR RUTA */

    if(
      target ===
      $("createRouteButton")
    ){

      openPlanner();

      return;

    }


    /* GUARDAR */

    if(
      target ===
      $("saveRoute")
    ){

      saveRoute();

      return;

    }

  }
);


/* =========================
   BUSCADOR
   ========================= */

els.search.addEventListener(
  "input",
  () =>
    renderSearchResults(
      els.search.value
    )
);


els.search.addEventListener(
  "focus",
  () =>
    renderSearchResults(
      els.search.value
    )
);


/* =========================
   CERRAR RESULTADOS
   ========================= */

document.addEventListener(
  "click",
  (event) => {

    if(
      !event.target.closest(
        ".search-wrap"
      ) &&
      !event.target.closest(
        ".search-results"
      )
    ){

      els.searchResults.hidden =
        true;

    }

  }
);


/* =========================
   INICIALIZACIÓN
   ========================= */

showScreen("welcome");

loadSaved();

loadMatrix();
