import z from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";
import registerTools from "./tools";

const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

const handler = initializeMcpApiHandler(
  (server, apiKey) => {
    // Register Meeting BaaS SDK tools with the provided API key
    server = registerTools(server, apiKey);
  },
  {
    parameters: {
      schema: apiKeySchema,
    },
    capabilities: {
      tools: {
        joinMeeting: {
          description: "Join's a meeting using the MeetingBaas api",
        },
        leaveMeeting: {
          description: "Leave a meeting using the MeetingBaas api",
        },
        getMeetingData: {
          description: "Get meeting data using the MeetingBaas api",
        },
        deleteData: {
          description: "Delete meeting data using the MeetingBaas api",
        },
        createCalendar: {
          description: "Create a calendar using the MeetingBaas api",
        },
        listCalendars: {
          description: "List calendars using the MeetingBaas api",
        },
        getCalendar: {
          description: "Get calendar using the MeetingBaas api",
        },
        deleteCalendar: {
          description: "Delete calendar using the MeetingBaas api",
        },
        resyncAllCalendars: {
          description: "Resync all calendars using the MeetingBaas api",
        },
        botsWithMetadata: {
          description: "Get bots with metadata using the MeetingBaas api",
        },
        listEvents: {
          description: "List events using the MeetingBaas api",
        },
        scheduleRecordEvent: {
          description: "Schedule a recording using the MeetingBaas api",
        },
        unscheduleRecordEvent: {
          description: "Unschedule a recording using the MeetingBaas api",
        },
        updateCalendar: {
          description: "Update calendar using the MeetingBaas api",
        },
        echo: {
          description: "Echo a message",
        },
      },
    },
  }
);

export default handler;
