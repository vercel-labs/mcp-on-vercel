import { BaasClient } from "@meeting-baas/sdk/dist/generated/baas/api/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Constants for configuration based on OpenAPI spec
const RECORDING_MODES = ['speaker_view', 'gallery_view', 'audio_only'] as const;

// Import the enums from the SDK's generated types
import { AudioFrequency, SpeechToTextProvider } from "@meeting-baas/sdk/dist/generated/baas/models";

export function registerJoinTool(server: McpServer, baasClient: BaasClient): McpServer {
  server.tool(
    "joinMeeting",
    "Send an AI bot to join a video meeting. The bot can record the meeting, transcribe speech, and provide real-time audio streams. Use this when you want to: 1) Record a meeting 2) Get meeting transcriptions 3) Stream meeting audio 4) Monitor meeting attendance",
    {
      meetingUrl: z.string().url().describe("URL of the meeting to join"),
      botName: z.string().describe("Name to display for the bot in the meeting"),
      botImage: z.string().url().optional().describe("The image to use for the bot, must be a URL. Recommended ratio is 4:3."),
      entryMessage: z.string().optional().describe("There are no entry messages on Microsoft Teams as guests outside of an organization do not have access to the chat."),
      webhookUrl: z.string().url().optional().describe("A webhook URL to send events to, overrides the webhook URL set in your account settings."),
      recordingMode: z.enum(RECORDING_MODES).optional().describe("The recording mode for the bot, defaults to 'speaker_view'."),
      speechToText: z.object({
        provider: z.nativeEnum(SpeechToTextProvider),
        apiKey: z.string().optional()
      }).optional().describe("The default speech to text provider is Gladia."),
      streaming: z.object({
        input: z.string().url().optional().describe("WebSocket URL for audio input"),
        output: z.string().url().optional().describe("WebSocket URL for audio output"),
        audioFrequency: z.nativeEnum(AudioFrequency).optional().describe("Audio frequency for streaming")
      }).optional().describe("Configure streaming capabilities for the bot"),
      automaticLeave: z.object({
        nooneJoinedTimeout: z.number().optional().describe("Timeout in seconds when no one joins"),
        waitingRoomTimeout: z.number().optional().describe("Timeout in seconds when in waiting room")
      }).optional().describe("Configure automatic leave behavior"),
      reserved: z.boolean().default(false).describe("Whether or not the bot should come from the available pool of bots or be a dedicated bot. Reserved bots come in exactly 4 minutes after the request."),
      startTime: z.number().optional().describe("Unix timestamp (in milliseconds) for when the bot should join the meeting. The bot joins 4 minutes before the start time."),
      deduplicationKey: z.string().optional().describe("We prevent multiple bots with same API key joining a meeting within 5 mins, unless overridden by deduplication_key."),
      extra: z.record(z.unknown()).optional().describe("A Json object that allows you to add custom data to a bot for your convenience, e.g. your end user's ID.")
    },
    async (params) => {
      try {
        // Join the meeting using the BaaS SDK
        const joinRequest = {
          joinRequest: {
            meeting_url: params.meetingUrl,
            bot_name: params.botName,
            bot_image: params.botImage,
            webhook_url: params.webhookUrl,
            recording_mode: params.recordingMode || 'speaker_view',
            speech_to_text: params.speechToText && {
              provider: params.speechToText.provider,
              api_key: params.speechToText.apiKey
            },
            reserved: params.reserved,
            streaming: params.streaming && {
              input: params.streaming.input,
              output: params.streaming.output,
              audio_frequency: params.streaming.audioFrequency
            },
            automatic_leave: params.automaticLeave && {
              noone_joined_timeout: params.automaticLeave.nooneJoinedTimeout,
              waiting_room_timeout: params.automaticLeave.waitingRoomTimeout
            },
            start_time: params.startTime,
            deduplication_key: params.deduplicationKey,
            extra: params.extra
          }
        };

        const response = await baasClient.defaultApi.join(joinRequest);

        if (response.data.bot_id) {
          return {
            content: [{
              type: "text",
              text: `Successfully joined meeting with bot ID: ${response.data.bot_id}${params.speechToText ? ` (Speech-to-text provider: ${params.speechToText.provider})` : ''}`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: "No bot ID received in the response"
          }],
          isError: true
        };
      } catch (error) {
        console.error("Failed to join meeting:", error);
        
        let errorMessage = "Failed to join meeting: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        } else if (typeof error === 'string') {
          errorMessage += error;
        } else {
          errorMessage += "Unknown error occurred";
        }

        return {
          content: [
            {
              type: "text",
              text: errorMessage
            }
          ],
          isError: true
        };
      }
    }
  );

  return server;
} 