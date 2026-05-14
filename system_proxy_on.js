// Re-enable Surge Mac System Proxy after a profile reload.
//
// Suggested config:
// system_proxy_on = type=event,event-name=network-changed,script-path=/Users/at/git_clone/List/system_proxy_on.js,timeout=30
//
// Surge scripting can call Surge HTTP APIs through $httpAPI without X-Key.

const INITIAL_DELAY_MS = 1500;
const VERIFY_DELAY_MS = 300;
const RETRY_DELAY_MS = 1000;
const MAX_ATTEMPTS = 12;

let finished = false;

function log(message) {
  console.log(`[system_proxy_on] ${message}`);
}

function finish(message) {
  if (finished) return;
  finished = true;
  log(message);
  $done({});
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function verify(attempt, postResult) {
  if (finished) return;

  $httpAPI("GET", "/v1/features/system_proxy", {}, (state) => {
    if (finished) return;

    if (state && state.enabled === true) {
      finish(`system proxy enabled on attempt ${attempt}`);
      return;
    }

    if (attempt >= MAX_ATTEMPTS) {
      log(`last POST result: ${safeStringify(postResult)}`);
      log(`last GET result: ${safeStringify(state)}`);
      finish(`failed after ${attempt} attempts`);
      return;
    }

    log(`not enabled yet on attempt ${attempt}, retrying`);
    setTimeout(() => enableSystemProxy(attempt + 1), RETRY_DELAY_MS);
  });
}

function enableSystemProxy(attempt) {
  if (finished) return;

  $httpAPI(
    "POST",
    "/v1/features/system_proxy",
    { enabled: true },
    (result) => {
      if (finished) return;
      log(`POST attempt ${attempt}: ${safeStringify(result)}`);
      setTimeout(() => verify(attempt, result), VERIFY_DELAY_MS);
    },
  );
}

setTimeout(() => enableSystemProxy(1), INITIAL_DELAY_MS);
