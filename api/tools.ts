import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client";
import { CreateCalendarParams } from "@meeting-baas/sdk/dist/baas/models/create-calendar-params";
import { Provider } from "@meeting-baas/sdk/dist/baas/models/provider";
import { UpdateCalendarParams } from "@meeting-baas/sdk/dist/baas/models/update-calendar-params";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { registerJoinTool } from "./tools/bots/join";
import { registerEchoTool } from "./tools/utils/echo";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
  });

  // Register bot tools
  const updatedServer = registerJoinTool(server, baasClient);

  // Register Meeting BaaS SDK tools
  updatedServer.tool(
    "leaveMeeting",
    "Remove an AI bot from a meeting. Use this when you want to: 1) End a meeting recording 2) Stop transcription 3) Disconnect the bot from the meeting",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        await baasClient.defaultApi.leave({
          headers: { "x-bot-id": botId },
        });
        return {
          content: [
            {
              type: "text",
              text: `Successfully removed bot ${botId} from meeting`,
            },
          ],
        };
      } catch (error) {
        console.error("Error leaving meeting:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to leave meeting",
            },
          ],
          isError: true,
        };
      }
    }
  );

  updatedServer.tool(
    "getMeetingData",
    "Get data about a meeting that a bot has joined. Use this when you want to: 1) Check meeting status 2) Get recording information 3) Access transcription data",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        const response = await baasClient.defaultApi.getMeetingData({
          botId,
        });
        return {
          content: [
            {
              type: "text",
              text: `Meeting data: ${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        console.error("Error getting meeting data:", error);
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

  updatedServer.tool(
    "deleteData",
    "Delete data associated with a meeting bot. Use this when you want to: 1) Remove meeting recordings 2) Delete transcription data 3) Clean up bot data",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        await baasClient.defaultApi.deleteData({
          headers: { "x-bot-id": botId },
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
        console.error("Error deleting data:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to delete data",
            },
          ],
          isError: true,
        };
      }
    }
  );

  updatedServer.tool(
    "createCalendar",
    "Create a new calendar integration. Use this when you want to: 1) Set up automatic meeting recordings 2) Configure calendar-based bot scheduling 3) Enable recurring meeting coverage",
    {
      oauthClientId: z.string(),
      oauthClientSecret: z.string(),
      oauthRefreshToken: z.string(),
      platform: z.enum(["Google", "Microsoft"]),
      rawCalendarId: z.string(),
    },
    async ({
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken,
      platform,
      rawCalendarId,
    }) => {
      try {
        let createCalendarParams: CreateCalendarParams = {
          oauthClientId: oauthClientId,
          oauthClientSecret: oauthClientSecret,
          oauthRefreshToken: oauthRefreshToken,
          platform:
            platform === "Google" ? Provider.google : Provider.microsoft,
          raw_calendar_id: rawCalendarId,
        };
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.createCalendar(
          createCalendarParams
        );
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

  updatedServer.tool(
    "getCalendar",
    "Get details about a specific calendar integration. Use this when you want to: 1) View calendar configuration 2) Check calendar status 3) Verify calendar settings",
    { calendarId: z.string() },
    async ({ calendarId }: { calendarId: string }) => {
      try {
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.getCalendar({
          calendarId: calendarId,
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

  updatedServer.tool(
    "deleteCalendar",
    "Delete a calendar integration. Use this when you want to: 1) Remove a calendar connection 2) Stop automatic recordings 3) Clean up calendar data",
    { calendarId: z.string() },
    async ({ calendarId }: { calendarId: string }) => {
      try {
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.deleteCalendar({
          calendar_id: calendarId,
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

  updatedServer.tool(
    "resyncAllCalendars",
    "Resynchronize all calendar integrations. Use this when you want to: 1) Update calendar data 2) Fix sync issues 3) Refresh calendar connections",
    {},
    async () => {
      try {
        const response = await baasClient.calendarsApi.resyncAllCalendars();
        return {
          content: [
            {
              type: "text",
              text: "Successfully resynced all calendars",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to resync calendars:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to resync calendars",
            },
          ],
          isError: true,
        };
      }
    }
  );

  updatedServer.tool(
    "botsWithMetadata",
    "Get a list of all bots with their metadata. Use this when you want to: 1) View active bots 2) Check bot status 3) Monitor bot activity",
    {},
    async () => {
      try {
        const response = await baasClient.defaultApi.botsWithMetadata({
          botName: "",
          createdAfter: "",
          createdBefore: "",
          cursor: "",
          filterByExtra: "",
          limit: 10,
          meetingUrl: "",
          sortByExtra: "",
          speakerName: "",
        });
        return {
          content: [
            {
              type: "text",
              text: `Bots with metadata: ${JSON.stringify(
                response.data,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        console.error("Error listing bots:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to list bots",
            },
          ],
          isError: true,
        };
      }
    }
  );

  updatedServer.tool(
    "listEvents",
    "List all scheduled events. Use this when you want to: 1) View upcoming recordings 2) Check scheduled transcriptions 3) Monitor planned bot activity",
    { calendarId: z.string() },
    async ({ calendarId }) => {
      try {
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.listEvents({
          calendarId: calendarId,
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

  updatedServer.tool(
    "scheduleRecordEvent",
    "Schedule a recording. Use this when you want to: 1) Set up automatic recording 2) Schedule future transcriptions 3) Plan meeting recordings",
    {
      eventUuid: z.string(),
      botName: z.string(),
      extra: z.record(z.unknown()).optional(),
    },
    async ({ eventUuid, botName, extra }) => {
      try {
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.scheduleRecordEvent(
          {
            botParam2: {
              botName: botName,
              extra: extra || {},
            },
            allOccurrences: false,
          },
          {
            url: `/calendarEvents/${eventUuid}/bot`,
          }
        );
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

  updatedServer.tool(
    "unscheduleRecordEvent",
    "Cancel a scheduled recording. Use this when you want to: 1) Cancel automatic recording 2) Stop planned transcription 3) Remove scheduled bot activity",
    { eventUuid: z.string() },
    async ({ eventUuid }: { eventUuid: string }) => {
      try {
        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.unscheduleRecordEvent({
          uuid: eventUuid,
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
        const updateParams: UpdateCalendarParams = {
          oauthClientId: oauthClientId,
          oauthClientSecret: oauthClientSecret,
          oauthRefreshToken: oauthRefreshToken,
          platform:
            platform === "Google" ? Provider.google : Provider.microsoft,
        };

        // @ts-ignore - SDK type definition issue
        const response = await baasClient.calendarsApi.updateCalendar(
          calendarId,
          updateParams
        );
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
