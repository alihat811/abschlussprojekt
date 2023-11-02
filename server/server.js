//gesamte Setup und Konfiguration um die API von openai aufzurufen
// damit können wir auf gpt3 zugreifen sowie auf DALL-E womit Bilder generiert werden können

import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

dotenv.config();

// Übergabe des API-Schlüssel
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY 
  });

// Instanz von open ai erstellen
//const openai = new OpenAIApi(configuration);

const app = express();

// Middleware einrichten, hiermit können wir die ursprungsübergreifenden Anfragen erstellen
// und den Server vom Front-End aus aufrufen
app.use(cors());

// hiermit kann JSON vom Front-End an das Back-End weitergegeben werden
app.use(express.json());

// dummy-root erstellen mit async. Funktion die eine Anfrage und eine Antwort annimmt
// mit der get-Funktion können aber nicht wirklich viele Daten vom Front-End erhalten werden
// daher unten der "post"
app.get('/', async(req, res) => {
    res.status(200).send({
        message: 'Ich bin der CodeX'
    })
});
// das post erlaubt uns einen body zu haben
app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.completions.create({
        //Parameter entnommen von openai.com. Die Parameter werden durch die Auswahl verschiedener Modelle generiert. Mein Model ist "text-davinci-003" 
        model: "text-davinci-003",
        prompt: `${prompt}`,
        temperature: 0, // Höhere Werte bedeuten, dass das Modell mehr Risiken eingeht.
        max_tokens: 3000, // Die maximale Anzahl an Token, die bei der Vervollständigung generiert werden sollen. Die meisten Modelle haben eine Kontextlänge von 2048 Token (mit Ausnahme der neuesten Modelle, die 4096 unterstützen).
        top_p: 1, // Alternative zur Probenahme mit Temperatur, sogenannte Kernprobenahme
        frequency_penalty: 0.5, // Zahl zwischen -2,0 und 2,0. Positive Werte maßregeln neue Token aufgrund ihrer bisherigen Häufigkeit im Text und verringern so die Wahrscheinlichkeit des Modells, dieselbe Zeile wörtlich zu wiederholen.
        presence_penalty: 0, // Zahl zwischen -2,0 und 2,0. Positive Werte maßregeln neue Token basierend darauf, ob sie bisher im Text vorkommen, und erhöhen so die Wahrscheinlichkeit, dass das Modell über neue Themen spricht.
        //stop: ["\"\"\"""], wurde entfernt, wird nicht benötigt
    });

    res.status(200).send({
      bot: response.data.choices[0].text
            
        })
    } catch (error) {
        console.error(error);
        res.status(500).send(error || 'Das hat nicht funktioniert')
    }
} )

// Sicherstellen, dass der Server immer auf neue Anfragen wartet
app.listen(5000, () => console.log('KI Server gestartet auf http://localhost:5000'));








