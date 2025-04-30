import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client";
import { Provider } from "@meeting-baas/sdk/dist/baas/models/provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { registerBotTools } from "./tools/bots/index";
import { registerEchoTool } from "./tools/utils/echo";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
    baseUrl: "https://api.meetingbaas.com/",
  });

  // Register bot tools
  let updatedServer = registerBotTools(server, baasClient);

  // For Leave Meeting
  updatedServer.tool(
    "leaveMeeting",
    "Remove an AI bot from a meeting. Use this when you want to: 1) End a meeting recording 2) Stop transcription 3) Disconnect the bot from the meeting",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        console.log(`Attempting to remove bot ${botId} from meeting...`);
        const response = await baasClient.defaultApi.leave({
          uuid: botId,
        });
        console.log(
          "Leave meeting response:",
          JSON.stringify(response.data, null, 2)
        );

        if (!response.data) {
          console.error("Leave meeting response missing data");
          return {
            content: [
              {
                type: "text",
                text: "Failed to leave meeting: No response data received",
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Successfully removed bot ${botId} from meeting`,
            },
          ],
        };
      } catch (error) {
        console.error("Failed to leave meeting:", error);
        let errorMessage = "Failed to leave meeting";

        if (error instanceof Error) {
          console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
          errorMessage += `: ${error.message}`;
        } else if (typeof error === "object" && error !== null) {
          console.error("Error object:", JSON.stringify(error, null, 2));
        }

        return {
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Get Meeting Data
  updatedServer.tool(
    "getMeetingData",
    "Get data about a meeting that a bot has joined. Use this when you want to: 1) Check meeting status 2) Get recording information 3) Access transcription data",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        //
        const response = await baasClient.defaultApi.getMeetingData({ botId });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Failed to get meeting data:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to get meeting data",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Delete Data
  updatedServer.tool(
    "deleteData",
    "Delete data associated with a meeting bot. Use this when you want to: 1) Remove meeting recordings 2) Delete transcription data 3) Clean up bot data",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        const response = await baasClient.defaultApi.deleteData({
          uuid: botId,
        });
        return {
          content: [
            {
              type: "text",
              text: "Successfully deleted meeting data",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to delete meeting data:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to delete meeting data",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Create Calendar
  updatedServer.tool(
    "createCalendar",
    "Create a new calendar integration. Use this when you want to: 1) Set up automatic meeting recordings 2) Configure calendar-based bot scheduling 3) Enable recurring meeting coverage",
    {
      oauthClientId: z.string(),
      oauthClientSecret: z.string(),
      oauthRefreshToken: z.string(),
      platform: z.enum(["Google", "Microsoft"]),
      rawCalendarId: z.string().optional(),
    },
    async ({
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken,
      platform,
      rawCalendarId,
    }) => {
      try {
        const calendarParams = {
          oauthClientId,
          oauthClientSecret,
          oauthRefreshToken,
          platform:
            platform === "Google" ? Provider.google : Provider.microsoft,
          rawCalendarId,
        };

        const response = await baasClient.calendarsApi.createCalendar({
          createCalendarParams: calendarParams,
        });

        return {
          content: [
            {
              type: "text",
              text: "Successfully created calendar",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to create calendar:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to create calendar",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For List Calendar
  updatedServer.tool(
    "listCalendars",
    "List all calendar integrations. Use this when you want to: 1) View configured calendars 2) Check calendar status 3) Manage calendar integrations",
    {},
    async () => {
      try {
        const response = await baasClient.calendarsApi.listCalendars();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Failed to list calendars:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to list calendars",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Get Calendar
  updatedServer.tool(
    "getCalendar",
    "Get details about a specific calendar integration. Use this when you want to: 1) View calendar configuration 2) Check calendar status 3) Verify calendar settings",
    { calendarId: z.string() },
    async ({ calendarId }: { calendarId: string }) => {
      try {
        const response = await baasClient.calendarsApi.getCalendar({
          uuid: calendarId,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Failed to get calendar:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to get calendar",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For delete Calendar
  updatedServer.tool(
    "deleteCalendar",
    "Delete a calendar integration. Use this when you want to: 1) Remove a calendar connection 2) Stop automatic recordings 3) Clean up calendar data",
    { calendarId: z.string() },
    async ({ calendarId }: { calendarId: string }) => {
      try {
        const response = await baasClient.calendarsApi.deleteCalendar({
          uuid: calendarId,
        });
        return {
          content: [
            {
              type: "text",
              text: "Successfully deleted calendar",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to delete calendar:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to delete calendar",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Bots with meta data
  updatedServer.tool(
    "botsWithMetadata",
    "Get a list of all bots with their metadata. Use this when you want to: 1) View active bots 2) Check bot status 3) Monitor bot activity",
    {},
    async () => {
      try {
        //
        const response = await baasClient.defaultApi.botsWithMetadata();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Failed to get bots with metadata:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to get bots with metadata",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For List All Events
  updatedServer.tool(
    "listEvents",
    "List all scheduled events. Use this when you want to: 1) View upcoming recordings 2) Check scheduled transcriptions 3) Monitor planned bot activity",
    { calendarId: z.string() },
    async ({ calendarId }) => {
      try {
        //
        const response = await baasClient.calendarsApi.listEvents({
          calendarId,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Failed to list events:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to list events",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Schedule Record Events
  updatedServer.tool(
    "scheduleRecordEvent",
    "Schedule a recording. Use this when you want to: 1) Set up automatic recording 2) Schedule future transcriptions 3) Plan meeting recordings",
    {
      eventUuid: z.string(),
      botName: z.string(),
      extra: z.record(z.unknown()).optional(),
      allOccurrences: z.boolean().optional(),
    },
    async ({ eventUuid, botName, extra, allOccurrences }) => {
      try {
        const botParams = {
          botName,
          extra: extra || {},
        };

        const response = await baasClient.calendarsApi.scheduleRecordEvent({
          uuid: eventUuid,
          botParam2: botParams,
          allOccurrences: allOccurrences || false,
        });

        return {
          content: [
            {
              type: "text",
              text: "Successfully scheduled event recording",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to schedule event recording:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to schedule event recording",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Un-Schedule Record Events
  updatedServer.tool(
    "unscheduleRecordEvent",
    "Cancel a scheduled recording. Use this when you want to: 1) Cancel automatic recording 2) Stop planned transcription 3) Remove scheduled bot activity",
    {
      eventUuid: z.string(),
      allOccurrences: z.boolean().optional(),
    },
    async ({ eventUuid, allOccurrences }) => {
      try {
        const response = await baasClient.calendarsApi.unscheduleRecordEvent({
          uuid: eventUuid,
          allOccurrences: allOccurrences || false,
        });

        return {
          content: [
            {
              type: "text",
              text: "Successfully unscheduled event recording",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to unschedule event recording:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to unschedule event recording",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // For Update Calendar
  updatedServer.tool(
    "updateCalendar",
    "Update a calendar integration configuration. Use this when you want to: 1) Modify calendar settings 2) Update connection details 3) Change calendar configuration",
    {
      calendarId: z.string(),
      oauthClientId: z.string(),
      oauthClientSecret: z.string(),
      oauthRefreshToken: z.string(),
      platform: z.enum(["Google", "Microsoft"]),
    },
    async ({
      calendarId,
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken,
      platform,
    }) => {
      try {
        const updateParams = {
          oauthClientId,
          oauthClientSecret,
          oauthRefreshToken,
          platform:
            platform === "Google" ? Provider.google : Provider.microsoft,
        };

        const response = await baasClient.calendarsApi.updateCalendar({
          uuid: calendarId,
          updateCalendarParams: updateParams,
        });

        return {
          content: [
            {
              type: "text",
              text: "Successfully updated calendar",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to update calendar:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to update calendar",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Add echo tool for testing
  const finalServer = registerEchoTool(updatedServer);

  return finalServer;
}

export default registerTools;
