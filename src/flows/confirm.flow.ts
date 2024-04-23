import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import {
  clearHistory,
  handleHistory,
  getHistoryParse,
} from "../utils/handleHistory";
import { getFullCurrentDate } from "../utils/currentDate";
import { appToCalendar } from "src/services/calendar";

const generatePromptToFormatDate = (history: string) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear(); // Obtener el año actual
  const prompt = `Fecha de Hoy: ${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal:...dd / mm ${year} hh:mm`; // Agregar el año actual al mensaje

  return prompt;
};

const generateJsonParse = (info: string) => {
  const prompt = `tu tarea principal es analizar la información proporcionada en el contexto y generar un objeto JSON que se adhiera a la estructura especificada a continuación. 

    Contexto: "${info}"
    
    {
        "name": "Leifer",
        "interest": "n/a",
        "value": "0",
        "email": "fef@fef.com",
        "startDate": "2024/02/15 00:00:00"
    }
    
    Objeto JSON a generar:`;

  return prompt;
};

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    await flowDynamic(
      "¡Claro!, Para te pedire unos datos para personalizar tu experiencia."
    );
    await flowDynamic("¿Cual es tu nombre?");
  })
  .addAction(
    { capture: true },
    async (ctx, { state, flowDynamic, extensions }) => {
      await state.update({ name: ctx.body });
      const ai = extensions.ai as AIClass;
      const history = getHistoryParse(state);
      const text = await ai.createChat(
        [
          {
            role: "system",
            content: generatePromptToFormatDate(history),
          },
        ],
        "gpt-3.5-turbo-16k"
      );

      await handleHistory({ content: text, role: "assistant" }, state);
      await flowDynamic(
        `Para agendar tu cita, ¿Me confirmas fecha y hora ?: ${text}`
      );
      await state.update({ startDate: text });
    }
  )
  .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
    await flowDynamic(`¿Qué tipo de tratamiento te gustaría recibir?`);
  })
  .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
    await state.update({ treatmentType: ctx.body });
    await flowDynamic(`Ultima pregunta ¿Cual es tu email?`);
  })
  .addAction(
    { capture: true },
    async (ctx, { state, extensions, flowDynamic }) => {
      const infoCustomer = `Name: ${state.get("name")}, StarteDate: ${state.get(
        "startDate"
      )}, email: ${ctx.body}, TreatmentType: ${state.get("treatmentType")}`;
      const ai = extensions.ai as AIClass;

      const text = await ai.createChat([
        {
          role: "system",
          content: generateJsonParse(infoCustomer),
        },
      ]);

      await appToCalendar(text);
      clearHistory(state);
      await flowDynamic(
        "¡Gracias por tu interés en GLOWOLOGY! Te confirmamos que hemos recibido tu solicitud de cita. Nuestro equipo se pondrá  en contacto con usted mas adelanta para reconfirmar su cita. ¡Estamos emocionados de verte pronto y ayudarte a alcanzar tus objetivos de belleza y bienestar!"
      );
    }
  );

export { flowConfirm };
