const BASE_URL = "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("adminToken");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export function adminRegister(name, email, password) {
  return request(`${BASE_URL}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export function adminLogin(email, password) {
  return request(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function getDistricts() {
  return request(`${BASE_URL}/districts`, {
    headers: authHeaders(),
  });
}

export function addVoter(name, age, doorNumber, aadharId, address) {
  return request(`${BASE_URL}/admin/voters`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, age, doorNumber, aadharId, address }),
  });
}

export function addCandidate(name, party, symbol, districtId = 1) {
  return request(`${BASE_URL}/admin/candidates`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, party, symbol, districtId: districtId || 1 }),
  });
}

export function startElection() {
  return request(`${BASE_URL}/admin/start`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export function stopElection() {
  return request(`${BASE_URL}/admin/stop`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export function getDashboard() {
  return request(`${BASE_URL}/admin/dashboard`, {
    headers: authHeaders(),
  });
}

export function getResults() {
  return request(`${BASE_URL}/admin/results`, {
    headers: authHeaders(),
  });
}

export function voterLookup(voterId) {
  return request(`${BASE_URL}/voter/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId }),
  });
}

export function getCandidates(token) {
  return request(`${BASE_URL}/voter/candidates?token=${token}`, {
    headers: { "Content-Type": "application/json" },
  });
}

export function castVote(token, candidateId) {
  return request(`${BASE_URL}/voter/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, candidateId }),
  });
}

export function getElectionStatus() {
  return request(`${BASE_URL}/voter/status`, {
    headers: { "Content-Type": "application/json" },
  });
}

