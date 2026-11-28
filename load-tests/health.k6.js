import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  vus: 20,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
  },
};

export function setup() {
  // Wake a sleeping free Render instance before timing begins
  http.get(`${BASE_URL}/api/health`, { timeout: "120s" });
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}