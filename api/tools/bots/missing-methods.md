## Internal Notes - SDK Improvements Needed

### Missing Methods in DefaultApi

The following methods are called in our implementation but are not present in the SDK's `DefaultApi` type:

1. **Bot Management**
   ```typescript
   leaveMeeting(params: { botId: string }): Promise<ApiResponse>;
   deleteMeetingData(params: { botId: string }): Promise<ApiResponse>;
   listBots(): Promise<ApiResponse>;
   ```

2. **Calendar Management**
   ```typescript
   listCalendarIntegrations(): Promise<ApiResponse>;
   getCalendarIntegration(params: { calendarId: string }): Promise<ApiResponse>;
   deleteCalendarIntegration(params: { calendarId: string }): Promise<ApiResponse>;
   resyncCalendarIntegrations(): Promise<ApiResponse>;
   ```

3. **Event Management**
   ```typescript
   listScheduledEvents(): Promise<ApiResponse>;
   scheduleEvent(params: { scheduleEventRequest: { event_uuid: string; bot_name: string; extra?: any } }): Promise<ApiResponse>;
   unscheduleEvent(params: { event_uuid: string }): Promise<ApiResponse>;
   ```

### Parameter Structure Inconsistencies

1. **Calendar Creation**
   - Current SDK structure for `CalendarsApiCreateCalendarRequest` doesn't match API expectations
   - Need to clarify whether parameters should be wrapped in a `createCalendarRequest` object
   - Need to standardize parameter naming (camelCase vs snake_case)

2. **Calendar Updates**
   - `updateCalendarIntegration` method missing from SDK
   - Parameter structure needs clarification for consistency

### Missing Features in Current SDK Implementation

1. **Streaming Support**
   ```typescript
   streaming?: {
     input?: string;       // WebSocket URL
     output?: string;      // WebSocket URL
     audioFrequency?: '16khz' | '24khz';
   }
   ```

2. **Automatic Leave Configuration**
   ```typescript
   automaticLeave?: {
     nooneJoinedTimeout?: number;  // seconds
     waitingRoomTimeout?: number;  // seconds
   }
   ```

### Type Consistency Issues

1. **Naming Conventions**
   - API uses snake_case for parameters (e.g., `oauth_client_id`, `raw_calendar_id`)
   - SDK uses camelCase for some parameters
   - Need to standardize on one approach, preferably matching the API's snake_case

2. **Response Types**
   - Need consistent typing for API responses
   - Should include proper type definitions for success/error states
   - Consider adding specific response types for each endpoint

### Required Updates

1. **API Method Alignment**
   - Add missing methods to `DefaultApi` interface
   - Ensure method names match actual API endpoints
   - Add proper TypeScript types for all parameters and responses

2. **Parameter Standardization**
   - Standardize on snake_case for API-facing properties
   - Document parameter wrapping conventions (when to use request objects)
   - Add proper validation for required vs optional parameters

3. **Feature Support**
   - Add streaming configuration types and support
   - Add automatic leave configuration types and support
   - Ensure all API features are properly typed in SDK

### Next Steps

1. Create SDK update tickets for:
   - Adding missing API methods
   - Fixing parameter structure inconsistencies
   - Adding missing feature support
   - Standardizing naming conventions

2. Testing Requirements:
   - Add test cases for all API methods
   - Verify parameter handling
   - Test error scenarios
   - Validate response types

3. Documentation Updates:
   - Document all available methods
   - Provide usage examples
   - Clarify parameter structures
   - Document breaking changes

Note: This document should be updated when the SDK is enhanced with these improvements.

# Missing Methods and Type Definition Issues

## Type Definition Inconsistencies

### DefaultApi
1. **Parameter Naming**
   - Current: Uses camelCase (e.g., `botId`)
   - Expected: Should use snake_case (e.g., `bot_id`) to match API
   - Affected methods:
     - `leaveMeeting`
     - `getMeetingData`
     - `deleteData`

2. **Missing Methods**
   - `listBots` - Currently using `listRecentBots` as a workaround
   - `listCalendarIntegrations`
   - `getCalendarIntegration`
   - `deleteCalendarIntegration`

### CalendarsApi
1. **Request Parameter Structure**
   - Current: Direct parameters
   - Expected: Wrapped in request objects
   - Example:
     ```typescript
     // Current
     createCalendar({ oauthClientId, oauthClientSecret, ... })
     
     // Expected
     createCalendar({ createCalendarRequest: { oauth_client_id, oauth_client_secret, ... } })
     ```

2. **Parameter Naming**
   - Current: Uses camelCase (e.g., `calendarId`, `eventUuid`)
   - Expected: Should use snake_case (e.g., `calendar_id`, `event_uuid`)
   - Affected methods:
     - `getCalendar`
     - `deleteCalendar`
     - `scheduleRecordEvent`
     - `unscheduleRecordEvent`
     - `updateCalendar`

## Required SDK Updates

1. **Type Definitions**
   - Update all parameter types to use snake_case
   - Add proper request wrapper types
   - Add missing method definitions

2. **Method Implementations**
   - Add missing methods
   - Update parameter handling to match API expectations
   - Ensure consistent error handling

3. **Documentation**
   - Update API documentation to reflect correct parameter names
   - Add examples for all methods
   - Document request/response types

## Workarounds

Until the SDK is updated, we are using the following workarounds:

1. **Parameter Conversion**
   - Converting camelCase to snake_case in the implementation
   - Wrapping parameters in request objects where needed

2. **Method Alternatives**
   - Using `listRecentBots` instead of `listBots`
   - Manually handling request/response transformations

## Next Steps

1. Create SDK update tickets for:
   - Type definition updates
   - Parameter naming standardization
   - Missing method implementations

2. Test requirements:
   - Verify all API endpoints work with updated types
   - Test parameter conversion logic
   - Validate error handling

3. Documentation updates:
   - Update SDK documentation
   - Add migration guide
   - Document breaking changes

Note: This document should be updated when the SDK is enhanced with the missing features and type definitions are corrected.