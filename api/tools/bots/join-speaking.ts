import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
// @ts-ignore
import axios from "axios";
import { z } from "zod";

// Define the persona types based on the new schema
const SPEAKING_API_URL = "https://speaking.meetingbaas.com";

// Hardcoded list of available personas
const AVAILABLE_PERSONAS = [
  "1940s_noir_detective",
  "academic_warlord",
  "ancient_alien_theorist",
  "ancient_roman_general",
  "arctic_prospector",
  "artisan_magnate",
  "astral_plane_uber_driver",
  "baas_onboarder",
  "bitcoin_maximalist",
  "buddhist_monk",
  "climate_engineer",
  "corporate_girlboss",
  "cpp_veteran",
  "crypto_patriarch",
  "cyberpunk_grandma",
  "data_baron",
  "debate_champion",
  "deep_sea_therapist",
  "environmental_activist",
  "factory_patriarch",
  "fading_diplomat",
  "forensic_accountant",
  "french_renaissance_painter",
  "futuristic_ai_philosopher",
  "genetic_aristocrat",
  "gladiator_chef",
  "golang_minimalist",
  "grafana_guru",
  "haskell_purist",
  "hospital_administrator",
  "immigration_maximalist",
  "intelligence_officer",
  "interdimensional_therapist",
  "intergalactic_barista",
  "interviewer",
  "kgb_ballerina",
  "lisp_enlightened",
  "master_sommelier",
  "media_cardinal",
  "medieval_crypto_trader",
  "medieval_plague_doctor",
  "memory_merchant",
  "military_strategist",
  "mongolian_shepherd",
  "neural_interface_mogul",
  "ninja_librarian",
  "oligarch_widow",
  "pair_programmer",
  "pharma_patriarch",
  "pirate_queen",
  "poker_champion",
  "port_master",
  "prehistoric_foodie",
  "quantum_financier",
  "quantum_mechanic",
  "quantum_physicist",
  "renaissance_gym_bro",
  "renaissance_soundcloud_rapper",
  "revolutionary_hacker",
  "rust_evangelist",
  "southern_grandma",
  "space_exploration_robot",
  "space_industrialist",
  "stoic_philosopher",
  "stone_age_tech_support",
  "synthetic_food_baron",
  "time_traveling_influencer",
  "underground_banker",
  "urban_mining_tycoon",
  "vatican_cybersecurity_officer",
  "victorian_etiquette_coach",
  "victorian_serial_killer",
  "war_correspondent",
  "waste_baron",
  "water_merchant",
];

// Define types based on the OpenAPI specification
interface BotRequest {
  meeting_url: string;
  bot_name: string;
  meeting_baas_api_key: string;
  personas?: string[] | null;
  bot_image?: string | null;
  entry_message?: string | null;
  extra?: Record<string, unknown> | null;
  enable_tools?: boolean;
}

interface JoinResponse {
  bot_id: string;
}

export function registerJoinSpeakingTool(server: McpServer): McpServer {
  server.tool(
    "joinSpeakingMeeting",
    "Send an AI speaking bot to join a video meeting. The bot can assist in meetings with voice AI capabilities.",
    {
      meetingUrl: z.string().url().describe("URL of the meeting to join"),
      botName: z
        .string()
        .describe("Name to display for the bot in the meeting"),
      meetingBaasApiKey: z
        .string()
        .describe("Your MeetingBaas API key for authentication"),
      personas: z
        .array(z.string())
        .optional()
        .describe(
          `List of persona names to use. The first available will be selected. Available personas: ${AVAILABLE_PERSONAS.join(
            ", "
          )}`
        ),
      botImage: z
        .string()
        .url()
        .optional()
        .describe("The image to use for the bot, must be a URL."),
      entryMessage: z
        .string()
        .optional()
        .describe("Message to send when joining the meeting."),
      enableTools: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to enable tools for the bot."),
      extra: z
        .record(z.unknown())
        .optional()
        .describe(
          "A JSON object that allows you to add custom data to a bot for your convenience."
        ),
    },
    async (params) => {
      try {
        // Create the bot request according to the new schema
        const botRequest: BotRequest = {
          meeting_url: params.meetingUrl,
          bot_name: params.botName,
          meeting_baas_api_key: params.meetingBaasApiKey,
          personas: params.personas || null,
          bot_image: params.botImage || null,
          entry_message: params.entryMessage || null,
          enable_tools: params.enableTools,
          extra: params.extra || null,
        };

        // Make a direct API call to the new endpoint
        const response = await axios.post<JoinResponse>(
          `${SPEAKING_API_URL}/bots`,
          botRequest
        );

        if (response.data.bot_id) {
          return {
            content: [
              {
                type: "text",
                text: `Successfully joined meeting with speaking bot ID: ${response.data.bot_id}`,
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
        console.error("Failed to join meeting with speaking bot:", error);

        let errorMessage = "Failed to join meeting with speaking bot: ";
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

  // Add a leave meeting tool for the speaking bot
  server.tool(
    "leaveSpeakingMeeting",
    "Remove a speaking bot from a meeting by its ID.",
    {
      botId: z
        .string()
        .describe("The MeetingBaas bot ID to remove from the meeting"),
      meetingBaasApiKey: z
        .string()
        .describe("Your MeetingBaas API key for authentication"),
    },
    async (params) => {
      try {
        const leaveRequest = {
          meeting_baas_api_key: params.meetingBaasApiKey,
          bot_id: params.botId,
        };

        await axios.delete(`${SPEAKING_API_URL}/bots/${params.botId}`, {
          data: leaveRequest,
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully removed speaking bot ID: ${params.botId} from the meeting`,
            },
          ],
        };
      } catch (error) {
        console.error("Failed to remove speaking bot from meeting:", error);

        let errorMessage = "Failed to remove speaking bot: ";
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
