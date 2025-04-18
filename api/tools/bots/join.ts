import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
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
        // Create the join request object that matches the SDK's expected format
        // Need to cast to any due to field name differences between our snake_case and the SDK types
        const joinRequest: any = {
          meeting_url: params.meetingUrl,
          bot_name: params.botName,
          bot_image:
            params.botImage ||
            "https://meetingbaas.com/static/a3e9f3dbde935920a3558317a514ff1a/b5380/preview.png",
          webhook_url: params.webhookUrl,
          recording_mode: params.recordingMode || "speaker_view",
          speech_to_text: params.speechToText
            ? {
                provider:
                  params.speechToText.provider === "default"
                    ? "Default"
                    : params.speechToText.provider === "gladia"
                    ? "Gladia"
                    : params.speechToText.provider === "runpod"
                    ? "Runpod"
                    : "Default",
                api_key: params.speechToText.apiKey,
              }
            : {
                provider: "Default",
              },
          reserved: params.reserved || false,
          streaming: params.streaming && {
            input: params.streaming.input,
            output: params.streaming.output,
            audio_frequency: params.streaming.audioFrequency,
          },
          automatic_leave: params.automaticLeave && {
            noone_joined_timeout: params.automaticLeave.nooneJoinedTimeout,
            waiting_room_timeout: params.automaticLeave.waitingRoomTimeout,
          },
          start_time: params.startTime,
          deduplication_key: params.deduplicationKey,
          extra: params.extra,
        };

        // Use the BaasClient's defaultApi methods
        const response = await baasClient.defaultApi.join({
          joinRequest,
        });

        // Type assertion to handle the snake_case vs camelCase mismatch
        const responseData = response.data as unknown as { bot_id?: string };

        if (responseData?.bot_id) {
          return {
            content: [
              {
                type: "text",
                text: `Successfully joined meeting with bot ID: ${
                  responseData.bot_id
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

        // Log the request payload that was sent
        console.error(
          "Request payload:",
          JSON.stringify(
            {
              meetingUrl: params.meetingUrl,
              botName: params.botName,
              botImage: params.botImage,
              // Include other relevant fields
              recordingMode: params.recordingMode,
              reserved: params.reserved,
              speechToText: params.speechToText,
            },
            null,
            2
          )
        );

        let errorMessage = "Failed to join meeting: ";

        // Type for axios error that includes response
        type AxiosErrorWithResponse = Error & {
          response?: {
            status: number;
            data: any;
          };
        };

        if (error instanceof Error) {
          errorMessage += error.message;

          // Check for axios error with response data using type assertion
          const axiosError = error as AxiosErrorWithResponse;
          if (axiosError.response && axiosError.response.data) {
            console.error("Error response status:", axiosError.response.status);
            console.error(
              "Error response data:",
              JSON.stringify(axiosError.response.data, null, 2)
            );
            errorMessage += ` - ${JSON.stringify(
              axiosError.response.data,
              null,
              2
            )}`;
          }
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
