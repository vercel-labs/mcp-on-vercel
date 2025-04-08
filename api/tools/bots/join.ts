import { BaasClient } from "@meeting-baas/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Constants for configuration based on OpenAPI spec
const RECORDING_MODES = ['speaker_view', 'gallery_view', 'audio_only'] as const;
const AUDIO_FREQUENCIES = ['16khz', '24khz'] as const;
const SPEECH_TO_TEXT_PROVIDERS = ['Gladia', 'Runpod', 'Default'] as const;

// Default bot configuration
const DEFAULT_BOT_CONFIG = {
  name: 'Meeting Assistant',
  image: 'https://meetingbaas.com/bot-avatar.png',
  entryMessage: 'Hello! I\'m here to assist with the meeting.',
  extra: {
    type: 'assistant',
    capabilities: ['recording', 'transcription']
  }
};

// Helper function to read Claude Desktop config
function readClaudeDesktopConfig(): any {
  try {
    const configPath = path.join(
      os.homedir(),
      'Library/Application Support/Claude/claude_desktop_config.json'
    );

    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const configJson = JSON.parse(configContent);

      if (configJson.mcpServers?.meetingbaas?.botConfig) {
        return configJson.mcpServers.meetingbaas.botConfig;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading Claude Desktop config:', error);
    return null;
  }
}

export function registerJoinTool(server: McpServer, baasClient: BaasClient): McpServer {
  server.tool(
    "joinMeeting",
    "Send an AI bot to join a video meeting. The bot can record the meeting, transcribe speech, and provide real-time audio streams. Use this when you want to: 1) Record a meeting 2) Get meeting transcriptions 3) Stream meeting audio 4) Monitor meeting attendance",
    {
      meetingUrl: z.string().url().describe("URL of the meeting to join"),
      botName: z.string().optional().describe("Name to display for the bot in the meeting"),
      botImage: z.string().url().optional().describe("URL to an image to use for the bot's avatar. Recommended ratio is 4:3."),
      entryMessage: z.string().optional().describe("Message the bot will send upon joining the meeting. Not available for Microsoft Teams."),
      webhookUrl: z.string().url().optional().describe("A webhook URL to send events to, overrides the webhook URL set in your account settings."),
      recordingMode: z.enum(RECORDING_MODES).optional().describe("The recording mode for the bot, defaults to 'speaker_view'."),
      speechToText: z.object({
        provider: z.enum(SPEECH_TO_TEXT_PROVIDERS),
        apiKey: z.string().optional()
      }).optional().describe("Speech-to-text configuration. Default provider is 'Default'."),
      streaming: z.object({
        input: z.string().url().optional(),
        output: z.string().url().optional(),
        audioFrequency: z.enum(AUDIO_FREQUENCIES).optional()
      }).optional().describe("WebSocket streams for audio. Input receives audio sent to bot, output receives audio from bot."),
      automaticLeave: z.object({
        nooneJoinedTimeout: z.number().int().min(0).optional(),
        waitingRoomTimeout: z.number().int().min(0).optional()
      }).optional().describe("Automatic leave configuration with timeouts in seconds."),
      reserved: z.boolean().default(false).describe("Whether to use a dedicated bot (takes 4 minutes to boot) or one from the pool."),
      startTime: z.number().optional().describe("Unix timestamp (ms) for when the bot should join. Bot joins 4 minutes before."),
      extra: z.record(z.unknown()).optional().describe("Custom data object for your convenience.")
    },
    async (params) => {
      try {
        // Load Claude Desktop config for defaults
        const claudeConfig = readClaudeDesktopConfig();
        
        // Merge configurations with priority: params > claudeConfig > DEFAULT_BOT_CONFIG
        const botName = params.botName || claudeConfig?.name || DEFAULT_BOT_CONFIG.name;
        const botImage = params.botImage || claudeConfig?.image || DEFAULT_BOT_CONFIG.image;
        const entryMessage = params.entryMessage || claudeConfig?.entryMessage || DEFAULT_BOT_CONFIG.entryMessage;
        const extra = { 
          ...DEFAULT_BOT_CONFIG.extra,
          ...claudeConfig?.extra,
          ...params.extra
        };

        // Prepare the join meeting request according to SDK format
        const joinRequest = {
          botName,
          meetingUrl: params.meetingUrl,
          botImage,
          entryMessage,
          webhookUrl: params.webhookUrl,
          recordingMode: params.recordingMode || 'speaker_view',
          speechToText: params.speechToText && {
            provider: params.speechToText.provider,
            apiKey: params.speechToText.apiKey
          },
          streaming: params.streaming && {
            input: params.streaming.input,
            output: params.streaming.output,
            audioFrequency: params.streaming.audioFrequency
          },
          automaticLeave: params.automaticLeave && {
            nooneJoinedTimeout: params.automaticLeave.nooneJoinedTimeout,
            waitingRoomTimeout: params.automaticLeave.waitingRoomTimeout
          },
          reserved: params.reserved,
          startTime: params.startTime,
          extra
        };

        // Join the meeting using the BaaS SDK
        const botId = await baasClient.joinMeeting(joinRequest);

        // Prepare success response with details
        let responseMessage = `Successfully joined meeting with bot ID: ${botId}\n`;
        responseMessage += `Bot Name: ${botName}\n`;
        if (params.recordingMode) responseMessage += `Recording Mode: ${params.recordingMode}\n`;
        if (params.speechToText) responseMessage += `Speech-to-Text: Enabled (${params.speechToText.provider})\n`;
        if (params.startTime) responseMessage += `Scheduled Start: ${new Date(params.startTime).toISOString()}\n`;

        return {
          content: [
            {
              type: "text",
              text: responseMessage
            }
          ]
        };

      } catch (error) {
        console.error("Failed to join meeting:", error);
        
        // Prepare error message with details
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