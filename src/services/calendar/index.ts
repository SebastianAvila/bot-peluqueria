import { format, addMinutes } from "date-fns";

/**
 * get calendar
 * @returns
 */
const getCurrentCalendar = async (): Promise<string> => {
  const dataCalendarApi = await fetch(
    
    "https://hook.us1.make.com/etv79ap8cjtxi5fm79dsn1977d83h0rt"
  );
  const json: any[] = await dataCalendarApi.json();
  const list = json.reduce((prev, current) => {
    return (prev += [
      `Espacio reservado (no disponible): `,
      `Desde ${format(current.date, "eeee do h:mm a")} `,
      `Hasta ${format(addMinutes(current.date, 45), "eeee do h:mm a")} \n`,
    ].join(" "));
  }, "");
  return list;
};

/**
 * add to calendar
 * @param text
 * @returns
 */
const appToCalendar = async (text: string) => {
  try {
    const payload = JSON.parse(text);
    console.log(payload);
    
    const dataApi = await fetch(
      "https://hook.us1.make.com/5msro2k4raa5oy85y562squosrss35kv",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    return dataApi;
  } catch (err) {
    console.log(`error: `, err);
  }
};

export { getCurrentCalendar, appToCalendar };
