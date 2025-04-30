import { initializeMcpApiHandler } from "../lib/mcp-api-handler";
import registerTools from "./tools";

const handler = initializeMcpApiHandler(
  (server, apiKey) => {
    // Register Meeting BaaS SDK tools with the provided API key
    server = registerTools(server, apiKey);
  },
  {
    capabilities: {
      tools: {
        // Meeting Management Category
        joinMeeting: {
          description:
            "Send an AI bot to join a video meeting. The bot can record the meeting, transcribe speech (enabled by default using Gladia), and provide real-time audio streams.",
          category: "Meeting Management",
        },
        joinSpeakingMeeting: {
          description:
            "Send an AI speaking bot to join a video meeting. The bot can assist in meetings with voice AI capabilities.",
          category: "Meeting Management",
        },
        leaveMeeting: {
          description: "Remove an AI bot from a meeting.",
          category: "Meeting Management",
        },
        leaveSpeakingMeeting: {
          description: "Remove a speaking bot from a meeting by its ID.",
          category: "Meeting Management",
        },
        getMeetingData: {
          description: "Get data about a meeting that a bot has joined.",
          category: "Meeting Management",
        },
        deleteData: {
          description: "Delete data associated with a meeting bot.",
          category: "Meeting Management",
        },

        // Calendar Management Category
        createCalendar: {
          description: "Create a new calendar integration.",
          category: "Calendar Management",
        },
        listCalendars: {
          description: "List all calendar integrations.",
          category: "Calendar Management",
        },
        getCalendar: {
          description: "Get details about a specific calendar integration.",
          category: "Calendar Management",
        },
        deleteCalendar: {
          description: "Delete a calendar integration.",
          category: "Calendar Management",
        },
        resyncAllCalendars: {
          description: "Resynchronize all calendar integrations.",
          category: "Calendar Management",
        },
        listEvents: {
          description: "List all scheduled events.",
          category: "Calendar Management",
        },
        scheduleRecordEvent: {
          description: "Schedule a recording.",
          category: "Calendar Management",
        },
        unscheduleRecordEvent: {
          description: "Cancel a scheduled recording.",
          category: "Calendar Management",
        },
        updateCalendar: {
          description: "Update a calendar integration configuration.",
          category: "Calendar Management",
        },

        // Bot Management Category
        botsWithMetadata: {
          description: "Get a list of all bots with their metadata.",
          category: "Bot Management",
        },

        // Utility Category
        echo: {
          description: "Echo a message back.",
          category: "Utility",
        },
      },
    },
  }
);

export default handler;
