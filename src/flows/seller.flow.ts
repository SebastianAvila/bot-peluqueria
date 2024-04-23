import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";

const WELCOME_MESSAGE =
  "¡Bienvenid@ a GLOWOLOGY! 🌟 Estás list@ para tener la mejor transformación y desarrollar la mejor versión de ti. ¿Cuál es tu nombre? Si gusta proporcionarnos su correo electrónico, así podremos mantenerte al tanto de nuestras novedades y promociones de apertura.";

let welcomeMessageSent = false;

const PROMPT_SELLER = `Eres el asistente virtual en la prestigiosa clínica de medicina estética y rejuvenecimiento facial "GLOWOLOGY", 
ubicada en Prado Norte 460 L103, Lomas de chapultepec. Tu principal responsabilidad es responder a las consultas de los clientes y ayudarles a programar sus citas.

FECHA DE HOY: {CURRENT_DAY}

SOBRE "GLOWOLOGY":
Somos un entro de estética y belleza de vanguardia, ofrecemos una amplia gama de tratamientos diseñados para elevar tu confianza y
 resaltar tu belleza única. Nuestro horario de atención es de lunes a viernes, desde las 11:00am hasta las 20:00pm, y sabado desde las 
 11pm hasta las 4:00pm.  Para más información, visita nuestro Instagram: Glowology_skinba. Aceptamos pagos en efectivo y a través de PayPal.
Recuerda que es necesario programar una cita.

MENU DE SERVICIOS:

1. FILLERS:
   - Rinomodelación:
     - Gama media: $7,399
     - Gama alta: $8,659
   - Perfilado de labios: $4,649
   - Aumento de labios:
     - Gama media: $6,489
     - Gama alta: $7,569
   - Proyección de mentón: $6,489
   - Marcaje mandibular: $8,659
   - Relleno de ojera: $6,489
   - Proyección de pómulos: $6,489
   - Relleno de surcos nasogenianos: $6,489
   - Relleno de líneas de marioneta: $7,569
   - Hidratación facial con ácido hialurónico: Precio según tratamiento

2. BIOESTIMULACIÓN:
   - Hilos lisos: $4,869
   - Hilos espiculados: $5,949
   - NHA en ojera: $3,349
   - Rejuvenecimiento facial con radiesse: $8,659
   - Dermapen: Precio según tratamiento

3. BOTOX:
   - Foxy Eye: $2,169
   - Just Botox: $4,329
   - Bunny lines Botox: $1,729
   - Smokers Liners Botox: $2,169
   - Gingival smile Botox: $2,376
   - Jawline contouring Botox: $4,329
   - Efecto Nefertiti: $4,759
   - Barbie Botox: $7,129
   - Baby Botox: $4,329
   - Non Sweating Treatment: $7,129

4. NUEVA TECNOLOGÍA:
   - Meso NHA: $6,489
   - Meso BTX: $6,489
   - Meso L: $6,489


HISTORIAL DE CONVERSACIÓN:
--------------
{HISTORIAL_CONVERSACION}
--------------

DIRECTRICES DE INTERACCIÓN:
1. Anima a los clientes a llegar 5 minutos antes de su cita para asegurar su turno.
2. Evita sugerir modificaciones en los servicios, añadir extras o ofrecer descuentos.
3. Siempre reconfirma el servicio solicitado por el cliente antes de programar la cita para asegurar su satisfacción.


EJEMPLOS DE RESPUESTAS:
"Claro, ¿cómo puedo ayudarte a programar tu cita?"
"Recuerda que debes agendar tu cita..."
"como puedo ayudarte..."

INSTRUCCIONES:
- Saluda UNA SOLA VEZ 
- Respuestas cortas ideales para enviar por whatsapp con emojis
- Escucha activa: Presta atención a las consultas de los clientes y analiza cuidadosamente el contenido de sus mensajes.
- Si es necesario, pide aclaraciones o detalles adicionales para comprender mejor las necesidades del cliente.


Respuesta útil:`;

export const generatePromptSeller = (history: string) => {
  const nowDate = getFullCurrentDate();
  return PROMPT_SELLER.replace("{HISTORIAL_CONVERSACION}", history).replace(
    "{CURRENT_DAY}",
    nowDate
  );
};

// Agrega una función para detectar si la pregunta incluye la palabra "menú"
const isMenuQuestion = (message) => {
  const menuKeywords = ["menú", "servicios", "tratamientos"];
  return menuKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
};


// Actualiza la función flowSeller para manejar la detección de despedida y proporcionar una respuesta de cierre
const flowSeller = addKeyword(EVENTS.ACTION).addAction(
  async (_, { state, flowDynamic, extensions }) => {
    try {
      const ai = extensions.ai as AIClass;
      const history = getHistoryParse(state);

      if (!welcomeMessageSent) {
        await flowDynamic([
          { body: WELCOME_MESSAGE, delay: generateTimer(150, 250) },
        ]);
        welcomeMessageSent = true;
      } else {
        const prompt = generatePromptSeller(history);

        const text = await ai.createChat([
          {
            role: "system",
            content: prompt,
          },
        ]);

        await handleHistory({ content: text, role: "assistant" }, state);

        // Si la pregunta incluye la palabra "menú", proporciona una respuesta específica sobre el menú
        if (isMenuQuestion(text)) {
          await flowDynamic([
            {
              body: `¡Claro! Aquí tienes nuestro menú de servicios:
              1. FILLERS:
                 - Rinomodelación: Gama media - $7,399, Gama alta - $8,659
                 - Perfilado de labios: $4,649
                 - Aumento de labios: Gama media - $6,489, Gama alta - $7,569
                 - Proyección de mentón: $6,489
                 - Marcaje mandibular: $8,659
                 - Relleno de ojera: $6,489
                 - Proyección de pómulos: $6,489
                 - Relleno de surcos nasogenianos: $6,489
                 - Relleno de líneas de marioneta: $7,569
                 - Hidratación facial con ácido hialurónico: Precio según tratamiento
              2. BIOESTIMULACIÓN:
                 - Hilos lisos: $4,869
                 - Hilos espiculados: $5,949
                 - NHA en ojera: $3,349
                 - Rejuvenecimiento facial con radiesse: $8,659
                 - Dermapen: Precio según tratamiento
              3. BOTOX:
                 - Foxy Eye: $2,169
                 - Just Botox: $4,329
                 - Bunny lines Botox: $1,729
                 - Smokers Liners Botox: $2,169
                 - Gingival smile Botox: $2,376
                 - Jawline contouring Botox: $4,329
                 - Efecto Nefertiti: $4,759
                 - Barbie Botox: $7,129
                 - Baby Botox: $4,329
                 - Non Sweating Treatment: $7,129
              4. NUEVA TECNOLOGÍA:
                 - Meso NHA: $6,489
                 - Meso BTX: $6,489
                 - Meso L: $6,489`,
              delay: generateTimer(150, 250),
            }
          ]);
        } else {
          // Si no es una pregunta sobre el menú, simplemente envía la respuesta generada por el modelo AI
          const chunks = text.split(/(?<!\d)\.\s+/g);
          for (const chunk of chunks) {
            await flowDynamic([
              { body: chunk.trim(), delay: generateTimer(150, 250) },
            ]);
          }
        }

       
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }
);

export { flowSeller };