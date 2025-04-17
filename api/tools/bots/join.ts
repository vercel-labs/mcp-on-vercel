import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Constants for configuration based on OpenAPI spec
const RECORDING_MODES = ["speaker_view", "gallery_view", "audio_only"] as const;

export function registerJoinTool(
  server: McpServer,
  baasClient: BaasClient
): McpServer {
  server.tool(
    "joinMeeting",
    "Send an AI bot to join a video meeting. The bot can record the meeting, transcribe speech (enabled by default using Gladia), and provide real-time audio streams. Use this when you want to: 1) Record a meeting 2) Get meeting transcriptions 3) Stream meeting audio 4) Monitor meeting attendance",
    {
      meetingUrl: z.string().url().describe("URL of the meeting to join"),
      botName: z
        .string()
        .describe("Name to display for the bot in the meeting"),
      botImage: z
        .string()
        .url()
        .optional()
        .describe(
          "The image to use for the bot, must be a URL. Recommended ratio is 4:3."
        ),
      entryMessage: z
        .string()
        .optional()
        .describe(
          "There are no entry messages on Microsoft Teams as guests outside of an organization do not have access to the chat."
        ),
      webhookUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "A webhook URL to send events to, overrides the webhook URL set in your account settings."
        ),
      recordingMode: z
        .enum(RECORDING_MODES)
        .optional()
        .describe(
          "The recording mode for the bot, defaults to 'speaker_view'."
        ),
      speechToText: z
        .object({
          provider: z.string().default("gladia"),
          apiKey: z.string().optional(),
        })
        .default({ provider: "default" })
        .describe("The speech to text provider, defaults to Gladia."),
      streaming: z
        .object({
          input: z
            .string()
            .url()
            .optional()
            .describe("WebSocket URL for audio input"),
          output: z
            .string()
            .url()
            .optional()
            .describe("WebSocket URL for audio output"),
          audioFrequency: z
            .string()
            .optional()
            .describe("Audio frequency for streaming"),
        })
        .optional()
        .describe("Configure streaming capabilities for the bot"),
      automaticLeave: z
        .object({
          nooneJoinedTimeout: z
            .number()
            .optional()
            .describe("Timeout in seconds when no one joins"),
          waitingRoomTimeout: z
            .number()
            .optional()
            .describe("Timeout in seconds when in waiting room"),
        })
        .optional()
        .describe("Configure automatic leave behavior"),
      reserved: z
        .boolean()
        .default(false)
        .describe(
          "Whether or not the bot should come from the available pool of bots or be a dedicated bot. Reserved bots come in exactly 4 minutes after the request."
        ),
      startTime: z
        .number()
        .optional()
        .describe(
          "Unix timestamp (in milliseconds) for when the bot should join the meeting. The bot joins 4 minutes before the start time."
        ),
      deduplicationKey: z
        .string()
        .optional()
        .describe(
          "We prevent multiple bots with same API key joining a meeting within 5 mins, unless overridden by deduplication_key."
        ),
      extra: z
        .record(z.unknown())
        .optional()
        .describe(
          "A Json object that allows you to add custom data to a bot for your convenience, e.g. your end user's ID."
        ),
    },
    async (params) => {
      try {
        // Create the join request
        const joinRequest = {
          meetingUrl: params.meetingUrl,
          botName: params.botName,
          botImage: params.botImage,
          webhookUrl: params.webhookUrl,
          recordingMode: params.recordingMode || "speaker_view",
          speechToText: params.speechToText && {
            provider: params.speechToText.provider,
            apiKey: params.speechToText.apiKey,
          },
          reserved: params.reserved,
          streaming: params.streaming && {
            input: params.streaming.input,
            output: params.streaming.output,
            audioFrequency: params.streaming.audioFrequency,
          },
          automaticLeave: params.automaticLeave && {
            nooneJoinedTimeout: params.automaticLeave.nooneJoinedTimeout,
            waitingRoomTimeout: params.automaticLeave.waitingRoomTimeout,
          },
          startTime: params.startTime,
          deduplicationKey: params.deduplicationKey,
          extra: params.extra,
        };

        // Use the baasClient's join method instead of direct axios call
        const response = await baasClient.defaultApi.join({
          joinRequest,
        });

        if (response.data?.botId) {
          return {
            content: [
              {
                type: "text",
                text: `Successfully joined meeting with bot ID: ${
                  response.data.botId
                } (Speech-to-text enabled by default using ${
                  params.speechToText?.provider || "default"
                } provider)`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: "No bot ID received in the response",
            },
          ],
          isError: true,
        };
      } catch (error) {
        console.error("Failed to join meeting:", error);

        let errorMessage = "Failed to join meeting: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        } else if (typeof error === "string") {
          errorMessage += error;
        } else {
          errorMessage += "Unknown error occurred";
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

  return server;
}
