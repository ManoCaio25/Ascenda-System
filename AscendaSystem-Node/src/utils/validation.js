import { badRequest } from "./httpError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/;

export function assertObject(value, label = "payload") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw badRequest(`${label} must be an object`);
  }

  return value;
}

export function readString(payload, key, options = {}) {
  const { required = false, min = 0, max = 255, label = key } = options;
  const value = payload?.[key];

  if (value == null || value === "") {
    if (required) {
      throw badRequest(`${label} is required`);
    }
    return "";
  }

  if (typeof value !== "string") {
    throw badRequest(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw badRequest(`${label} must have at least ${min} characters`);
  }

  if (trimmed.length > max) {
    throw badRequest(`${label} must have at most ${max} characters`);
  }

  return trimmed;
}

export function readEmail(payload, key = "email") {
  const email = readString(payload, key, {
    required: true,
    max: 320,
    label: "email",
  }).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw badRequest("email must be valid");
  }

  return email;
}

export function readPassword(payload, key = "password") {
  const password = readString(payload, key, {
    required: true,
    min: 6,
    max: 128,
    label: "password",
  });

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw badRequest("password must include letters and numbers");
  }

  return password;
}

export function readSafeId(payload, key, options = {}) {
  const id = readString(payload, key, {
    required: options.required || false,
    max: 120,
    label: options.label || key,
  });

  if (!id) return "";

  if (!SAFE_ID_PATTERN.test(id)) {
    throw badRequest(`${options.label || key} has an invalid format`);
  }

  return id;
}
