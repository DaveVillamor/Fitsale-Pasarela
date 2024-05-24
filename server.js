const express = require("express");
const app = express();
const axios = require("axios");
const OpenAI = require("openai");
const fs = require("fs");
const path = require('path');
const pug = require('pug');
const cors = require('cors');

const openai = new OpenAI({
  apiKey: "",
});
// Configuración de Pug como motor de plantillas
app.use(cors());
app.set("view engine", "pug");
app.set("views", "./src/pug");
// Middleware para manejar datos JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ruta principal
app.get("/workout", async (req, res) => {
  // crear el archivo fisico .html en public
  pug.renderFile('./src/pug/workout.pug', { title: 'Workout' }, (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al renderizar la plantilla');
    } else {
      fs.writeFileSync('./public/workout.html', html);
      res.sendFile(path.join(__dirname, 'public', 'workout.html'));
    }
  });
});
app.post("/api/datosIniciales", async (req, res) => {
  console.log("req.body", req.body);
  let data = await axios
    .get(
      "https://app.clez.co/index.php?r=APIfitsale/getUserByIdFitsale&id_tercero=" +
        req.body.id
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

  res.json(data);
});
app.post("/api/terceros/antropometria", async (req, res) => {
  // llegan por json
  console.log(req.body);
  let data = await axios
    .post(
      "https://app.clez.co/index.php?r=APIfitsale/UpdateHistoria",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    )
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
  res.json(data);
});
app.post("/api/generaEntrenamiento", async (req, res) => {
  let json_user = JSON.stringify(req.body);
  console.log("json_user", json_user);
  let resultado = await genera_plan(json_user);
  console.log("resultado", resultado);
  res.json(resultado);
});

app.get("/arpay", async (req, res) => {
  res.render("usdar");
});
app.get("/gym", async (req, res) => {
  const sucursales = [
    { nombre: "Sucursal 1", id: 1 },
    { nombre: "Sucursal 2", id: 2 },
    { nombre: "Sucursal 3", id: 3 },
    { nombre: "Sucursal 4", id: 4 },
  ];
  res.render("gym", { sucursales });
});
app.get("/", async (req, res) => {
  const images = [
    { url: "./img/portada (1).png", shadow: "rgba(255, 0, 0, 0.4)" },
    { url: "./img/portada (2).png", shadow: "rgba(255, 180, 0, 0.4)" },
    { url: "./img/portada (3).png", shadow: "rgba(255, 190, 0, 0.4)" },
  ];

  const products = [
    {
      name: "Producto 1",
      price: "$100",
      image: "https://via.placeholder.com/300x300?text=Producto+1",
      url: "#",
    },
    {
      name: "Producto 2",
      price: "$200",
      image: "https://via.placeholder.com/300x300?text=Producto+2",
      url: "#",
    },
    {
      name: "Producto 3",
      price: "$300",
      image: "https://via.placeholder.com/300x300?text=Producto+3",
      url: "#",
    },
    {
      name: "Producto 4",
      price: "$400",
      image: "https://via.placeholder.com/300x300?text=Producto+4",
      url: "#",
    },
  ];

  const gyms = await generaGyms();
  console.log(gyms);
  res.render("index", { images, products, gyms });
});

function cargarEjercicios() {
  try {
    const data = fs.readFileSync("./ejercicios.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    return [];
  }
}

const ejercicios = cargarEjercicios();
console.log("Ejercicios cargados:", ejercicios.length);

async function genera_plan(json_user) {
  const completion = await openai.chat.completions.create({
    // model: "gpt-3.5-turbo-0125",
    model: "gpt-4o",

    messages: [
      {
        role: "system",
        content: `genera un plan de entrenamiento asigna de 6 a 10 ejercicios diarios. siempre empieza con algun ejercicio de  calentamientos y finaliza con uno de estiramiento.\
            ten en cuenta una coherente progresion de cargas y volumen de entrenamiento, asi como un adecuado equilibrio entre ejercicios de empuje y traccion, y un adecuado equilibrio en los grupos musculares a trabajar cada dia para no generar sobrecargas musculares.
              Responde unicamente en este formato
              json_object:[{ 
                  "plan_entrenamiento": {
                      "dia1": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia2": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia3": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia4": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia5": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia6": [{"id_ejercicio": "", "series": int, "repeticiones": int},...],
                      "dia7": [{"id_ejercicio": "", "series": int, "repeticiones": int},...]
                  }
              }]
            
            DATA: ${JSON.stringify(ejercicios)}`,
      },
      {
        role: "user",
        content: json_user,
      },
    ],
    response_format: { type: "json_object" },
  });
  console.log("completion", completion.choices[0].message.content);

  let texto = completion.choices[0].message.content;

  // Deserializar el texto JSON
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(texto);
  } catch (error) {
    console.error("Error al deserializar el JSON:", error);
    return null;
  }

    let planObj = findPlanEntrenamiento(jsonResponse);
  if (planObj) {
    let ejercicios = fs.readFileSync("./ejercicios.json", "utf8");
    ejercicios = JSON.parse(ejercicios);

    const getNombreEjercicio = (id) => {
        const ejercicio = ejercicios.find(e => e.id_ejercicio === id);
        return ejercicio ? ejercicio.nombre : 'Nombre no encontrado';
    };
    // añaadir nombre de ejercicios
    for (let dia in planObj.plan_entrenamiento) {
      for (let ejercicio of planObj.plan_entrenamiento[dia]) {
        ejercicio.nombre = getNombreEjercicio(ejercicio.id_ejercicio);
      }
    }
    // Imprime el plan con los nombres de los ejercicios
    console.log(
      "Plan con nombres de ejercicios:",
      JSON.stringify(planObj, null, 2)
    );
  } else {
    console.error("No se encontró 'plan_entrenamiento' en la respuesta.");
  }
  // Imprime el plan con los nombres de los ejercicios
  console.log(
    "Plan con nombres de ejercicios:",
    JSON.stringify(planObj, null, 2)
  );

  let url = "https://app.clez.co/index.php?r=APIfitsale/GuardarRutina";
  let data = planObj.plan_entrenamiento;
  console.log("data", data);
  let plan = [];
  json_user = JSON.parse(json_user);
  let numDia = 1;
  for (let dia in data) {
    for (let ejercicio of data[dia]) {
      plan.push({
        id_tercero: json_user.id_tercero,
        id_ejercicio: ejercicio.id_ejercicio,
        num_sesiones: ejercicio.series,
        num_repeticiones: ejercicio.repeticiones,
        dia: numDia,
      });
    }
    numDia++;
  }
  console.log("plan", plan);
  axios
    .post(url, plan, { headers: { "Content-Type": "application/json" } })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  return planObj;
}


function findPlanEntrenamiento(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return null;
    }

    if (obj.hasOwnProperty('plan_entrenamiento')) {
        return obj;
    }

    for (let key in obj) {
        const result = findPlanEntrenamiento(obj[key]);
        if (result) {
            return result;
        }
    }

    
    return null;
}

const generaGyms = async () => {
  try {
    const response = await axios.get(
      "https://app.clez.co/index.php?r=APIfitsale/GymsActivos"
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 37777;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
});
