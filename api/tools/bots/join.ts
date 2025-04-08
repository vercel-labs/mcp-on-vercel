import { BaasClient } from "@meeting-baas/sdk";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerJoinTool(server: McpServer, baasClient: BaasClient): McpServer {
  server.tool(
    "joinMeeting",
    "Send an AI bot to join a video meeting. The bot can record the meeting, transcribe speech, and provide real-time audio streams. Use this when you want to: 1) Record a meeting 2) Get meeting transcriptions 3) Stream meeting audio 4) Monitor meeting attendance",
    {
      meetingUrl: z.string(),
      botName: z.string(),
      webhookUrl: z.string().optional(),
      recordingMode: z.string().optional(),
      speechToText: z.boolean().optional(),
      reserved: z.boolean(),
    },
    async ({
      meetingUrl,
      botName,
      webhookUrl,
      recordingMode,
      speechToText,
      reserved,
    }: {
      meetingUrl: string;
      botName: string;
      webhookUrl?: string;
      recordingMode?: string;
      speechToText?: boolean;
      reserved: boolean;
    }) => {
      try {
        const botId = await baasClient.joinMeeting({
          meetingUrl,
          botName,
          webhookUrl,
          recordingMode,
          speechToText: speechToText ? { provider: "Default" } : undefined,
          reserved,
        });
        return {
          content: [
            {
              type: "text",
              text: `Successfully joined meeting with bot ID: ${botId}`,
            },
          ],
        };
      } catch (error) {
        console.error("Failed to join meeting:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to join meeting",
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
} 