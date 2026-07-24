import { prefixedName } from './flags.js';

// Single source of the (optionally per-deployment-prefixed) metric names for
// the Safeguards demo. The Unleash impact metrics and their Prometheus
// mirrors share the counter name; the histograms differ in unit suffix.
export const METRICS = {
  insightsRequests: prefixedName(
    'unleash_fullstack_demo_insights_requests_total'
  ),
  insightsErrors: prefixedName(
    'unleash_fullstack_demo_insights_errors_total'
  ),
  insightsResponseTimeMs: prefixedName(
    'unleash_fullstack_demo_insights_response_time_ms'
  ),
  insightsResponseTimeSeconds: prefixedName(
    'unleash_fullstack_demo_insights_response_time_seconds'
  )
} as const;
