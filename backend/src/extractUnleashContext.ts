import { Request } from 'express';
import { Context } from 'unleash-client';

// Define the type for the flag context
export interface FlagContext {
  [key: string]: string;
}

// Lift the flat, lowercased header map into a proper Unleash context so that
// variant selection and gradual-rollout stickiness on userId/sessionId match
// the frontend evaluation (a top-level userId sticks; one buried in
// properties does not).
export const toUnleashContext = (flagContext?: FlagContext): Context => {
  if (!flagContext) return {};

  const context: Context = { properties: { ...flagContext } };
  if (flagContext.userid) context.userId = flagContext.userid;
  if (flagContext.sessionid) context.sessionId = flagContext.sessionid;
  return context;
};

/**
 * Extracts Unleash context from request headers
 * Headers in the format "Unleash-ContextParam-{paramName}: {value}" will be extracted
 * @param req Express request object
 * @returns Object with extracted context parameters
 */
export const extractUnleashContext = (req: Request): FlagContext => {
  const flagContext: FlagContext = {};

  // Iterate through all headers
  Object.entries(req.headers).forEach(([key, value]) => {
    // Convert header name to lowercase for case-insensitive comparison
    const headerName = key.toLowerCase();

    // Check if this is an Unleash context header
    if (headerName.startsWith('unleash-contextparam-')) {
      // Extract the parameter name from the header
      // Format: unleash-contextparam-{paramName}
      const paramName = headerName.replace('unleash-contextparam-', '');

      // Add to context if value exists
      if (value && paramName) {
        // If the value is an array, use the first value
        flagContext[paramName] = Array.isArray(value) ? value[0] : value;
      }
    }
  });

  return flagContext;
};