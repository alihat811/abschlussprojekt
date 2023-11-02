import bot from './assets/bot.svg';
import user from './assets/user.svg';

//JS für das Front-End

//html document ansprechen
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// einen Intervall für das Anzeigen von 3 nacheinander erscheinenden Punkten
const loader = element => {
  element.textContent = '';

  loadInterval = setInterval (() => {
    element.textContent += '.' ;

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300) 
}

// die von der KI gesendete Antwort Buchstabe für Buchstabe einblenden, 
// ansonsten wird das Ergebnis direkt erscheinen. Wirkt daher professioneller
const typeText = (element, text) => {
    let index = 0;

    // weiteren Intervall deklarieren
    let interval = setInterval(() => {
        if(index < text.lenght) {
            element.innerHTML += text.chartAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// Für jede Frage wird eine eindeutige ID generiert
// dazu nutzen wir Uhrzeit u. Datum und eine zufällige Zahl
// die zufällige Zahl in einen Hexadezimalzeichenfolge umwandeln
const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`
}

// Anzeigebild für KI und Benutzer sowie die Chat-Streifen anzeigen
const chatStripe = (isAi, value, uniqueId) => {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img
                        src="${isAi ? bot : user}"
                        alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>             
    `
    )
}

// das Standardverhalten des Browsers beim Absenden eines Formulars unterbinden
const handleSubmit = async (e) => {
    e.preventDefault();

    // eingegebene Formulardaten abrufen
    const data = new FormData(form);

    // Benutzer-Chatstreifen erstellen
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));    

    // Formulardaten leeren
    form.reset();

    //KI Chatstreifen erstellen
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true," ", uniqueId);

    // beim Laden der Antwort den Chat Container automatisch weiter scrollen
    chatContainer.scrollTop = chatContainer.scrollHeight;

    //Nachricht mit eindeutiger ID an den loader übergeben und zum Fokussieren nach unten scrollen
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await  fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim(); // schneidet alle nachgestellten Leerzeichen/'\n' ab 

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Das hat nicht geklappt"
        alert(err)
    }
}


// falls mit der Eingabetaste der Befehl auch abgesendet werden soll
// diese Taste hat das Kürzel 13

form.addEventListener('submit',  handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})

