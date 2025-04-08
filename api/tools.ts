import { BaasClient } from "@meeting-baas/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { registerJoinTool } from "./tools/bots/join";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
  });

  // Register bot tools
  server = registerJoinTool(server, baasClient);

  // Register Meeting BaaS SDK tools
  server.tool(
    "leaveMeeting",
    "Remove an AI bot from a meeting. Use this when you want to: 1) End a meeting recording 2) Stop transcription 3) Disconnect the bot from the meeting",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        const success = await baasClient.leaveMeeting(botId);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Successfully left meeting"
                : "Failed to leave meeting",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to leave meeting:", error);
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

  server.tool(
    "getMeetingData",
    "Get all data from a meeting including recording, transcript, and metadata. Use this when you want to: 1) Search through meeting transcripts 2) Get meeting recordings 3) Review meeting details 4) Access speaker information",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        const data = await baasClient.getMeetingData(botId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
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

  server.tool(
    "deleteData",
    "Delete all data from a meeting including recording, transcript, and logs. Use this when you want to: 1) Remove sensitive meeting data 2) Clear meeting recordings 3) Delete transcripts 4) Free up storage space",
    { botId: z.string() },
    async ({ botId }: { botId: string }) => {
      try {
        const result = await baasClient.deleteData(botId);
        return {
          content: [
            {
              type: "text",
              text: "Successfully deleted meeting data",
            },
          ],
        };
      } catch (error) {
        console.error("Failed to delete data:", error);
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

  server.tool(
    "createCalendar",
    "Connect a Google or Microsoft calendar to Meeting BaaS. Use this when you want to: 1) Link your work calendar 2) Enable automatic meeting recordings 3) Schedule bots for future meetings 4) Sync your calendar events",
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
    }: {
      oauthClientId: string;
      oauthClientSecret: string;
      oauthRefreshToken: string;
      platform: "Google" | "Microsoft";
      rawCalendarId: string;
    }) => {
      try {
        const calendar = await baasClient.createCalendar({
          oauthClientId,
          oauthClientSecret,
          oauthRefreshToken,
          platform: platform === "Google" ? "Google" : "Microsoft",
          rawCalendarId,
        });
        return {
          content: [
            {
              type: "text",
              text: `Successfully created calendar: ${JSON.stringify(
                calendar,
                null,
                2
              )}`,
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

  server.tool(
    "listCalendars",
    "View all connected calendars. Use this when you want to: 1) See which calendars are linked 2) Check calendar connection status 3) View calendar details 4) Manage calendar integrations",
    {},
    async () => {
      try {
        const calendars = await baasClient.listCalendars();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(calendars, null, 2),
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

  server.tool(
    "getCalendar",
    "Get detailed information about a specific calendar. Use this when you want to: 1) View calendar settings 2) Check sync status 3) See calendar events 4) Verify calendar connection",
    { uuid: z.string() },
    async ({ uuid }: { uuid: string }) => {
      try {
        const calendar = await baasClient.getCalendar(uuid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(calendar, null, 2),
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

  server.tool(
    "deleteCalendar",
    "Remove a calendar connection. Use this when you want to: 1) Unlink a calendar 2) Stop automatic recordings 3) Remove calendar access 4) Clean up old integrations",
    { uuid: z.string() },
    async ({ uuid }: { uuid: string }) => {
      try {
        const success = await baasClient.deleteCalendar(uuid);
        return {
          content: [
            {
              type: "text",
              text: success
                ? "Successfully deleted calendar"
                : "Failed to delete calendar",
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

  server.tool(
    "resyncAllCalendars",
    "Refresh all calendar data to ensure it's up to date. Use this when you want to: 1) Update meeting schedules 2) Sync new calendar changes 3) Refresh calendar data 4) Fix sync issues",
    {},
    async () => {
      try {
        const result = await baasClient.resyncAllCalendars();
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

  server.tool(
    "botsWithMetadata",
    "Search and filter through your meeting bots. Use this when you want to: 1) Find specific meetings 2) Filter by date range 3) Search by meeting name 4) View meeting history",
    {
      botName: z.string().optional(),
      createdAfter: z.string().optional(),
      createdBefore: z.string().optional(),
      cursor: z.string().optional(),
      filterByExtra: z.string().optional(),
      limit: z.number().optional(),
      meetingUrl: z.string().optional(),
      sortByExtra: z.string().optional(),
      speakerName: z.string().optional(),
    },
    async ({
      botName,
      createdAfter,
      createdBefore,
      cursor,
      filterByExtra,
      limit,
      meetingUrl,
      sortByExtra,
      speakerName,
    }: {
      botName?: string;
      createdAfter?: string;
      createdBefore?: string;
      cursor?: string;
      filterByExtra?: string;
      limit?: number;
      meetingUrl?: string;
      sortByExtra?: string;
      speakerName?: string;
    }) => {
      try {
        const bots = await baasClient.listRecentBots({
          botName,
          createdAfter,
          createdBefore,
          cursor,
          filterByExtra,
          limit,
          meetingUrl,
          sortByExtra,
          speakerName,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(bots, null, 2),
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

  server.tool(
    "listEvents",
    "View all events in a calendar. Use this when you want to: 1) See upcoming meetings 2) View past meetings 3) Check meeting schedules 4) Browse calendar events",
    { calendarUuid: z.string() },
    async ({ calendarUuid }: { calendarUuid: string }) => {
      try {
        const events = await baasClient.listEvents(calendarUuid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(events, null, 2),
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

  server.tool(
    "scheduleRecordEvent",
    "Schedule a bot to automatically record a future meeting. Use this when you want to: 1) Set up automatic recording 2) Schedule future transcriptions 3) Plan meeting recordings 4) Enable recurring recordings",
    {
      eventUuid: z.string(),
      botName: z.string(),
      extra: z.record(z.any()).optional(),
    },
    async ({
      eventUuid,
      botName,
      extra,
    }: {
      eventUuid: string;
      botName: string;
      extra?: Record<string, any>;
    }) => {
      try {
        const result = await baasClient.scheduleRecordEvent(eventUuid, {
          botName,
          extra,
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

  server.tool(
    "unscheduleRecordEvent",
    "Cancel a scheduled recording for a meeting. Use this when you want to: 1) Stop automatic recording 2) Cancel future transcriptions 3) Remove scheduled recordings 4) Disable recurring recordings",
    { eventUuid: z.string() },
    async ({ eventUuid }: { eventUuid: string }) => {
      try {
        const result = await baasClient.unscheduleRecordEvent(eventUuid);
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

  server.tool(
    "updateCalendar",
    "Update calendar connection settings. Use this when you want to: 1) Refresh calendar access 2) Update calendar credentials 3) Change calendar settings 4) Fix connection issues",
    {
      uuid: z.string(),
      oauthClientId: z.string().optional(),
      oauthClientSecret: z.string().optional(),
      oauthRefreshToken: z.string().optional(),
      platform: z.enum(["Google", "Microsoft"]).optional(),
      rawCalendarId: z.string().optional(),
    },
    async ({
      uuid,
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken,
      platform,
      rawCalendarId,
    }: {
      uuid: string;
      oauthClientId?: string;
      oauthClientSecret?: string;
      oauthRefreshToken?: string;
      platform?: "Google" | "Microsoft";
      rawCalendarId?: string;
    }) => {
      try {
        const calendar = await baasClient.updateCalendar(uuid, {
          oauthClientId,
          oauthClientSecret,
          oauthRefreshToken,
          platform: platform === "Google" ? "Google" : "Microsoft",
          rawCalendarId,
        });
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated calendar: ${JSON.stringify(
                calendar,
                null,
                2
              )}`,
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

  // Add a simple echo tool for testing
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [
      {
        type: "text",
        text: `Tool echo: ${message}`,
      },
    ],
  }));

  return server;
}

export default registerTools;
