const { SsoConfig } = require("../models");
const status = require("../helpers/Response");
const {
  formatSsoProvider,
  buildSsoPayload,
} = require("../services/ssoService");

module.exports = {
  list: async (req, res) => {
    try {
      const rows = await SsoConfig.findAll({
        order: [
          ["sort_order", "ASC"],
          ["display_name", "ASC"],
          ["provider", "ASC"],
        ],
      });
      return status.ResponseStatus(
        res,
        200,
        "SSO providers fetched",
        rows.map(formatSsoProvider)
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch SSO providers", {
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const payload = buildSsoPayload(body, { requireProvider: true });
      if (!payload.provider) {
        return status.ResponseStatus(res, 400, "Provider slug is required");
      }

      const existing = await SsoConfig.findOne({ where: { provider: payload.provider } });
      if (existing) {
        return status.ResponseStatus(res, 409, "Provider slug already exists");
      }

      const config = await SsoConfig.create({
        provider: payload.provider,
        display_name: payload.display_name ?? payload.provider,
        icon_url: payload.icon_url ?? null,
        sort_order: payload.sort_order ?? 0,
        is_active: payload.is_active ?? true,
        client_id: payload.client_id ?? "",
        client_secret: payload.client_secret ?? "",
        redirect_uri: payload.redirect_uri ?? null,
        frontend_base_url: payload.frontend_base_url ?? null,
        authorization_url: payload.authorization_url ?? null,
        token_url: payload.token_url ?? null,
        user_info_url: payload.user_info_url ?? null,
        discovery_url: payload.discovery_url ?? null,
        scopes: payload.scopes ?? "openid email profile",
      });

      return status.ResponseStatus(res, 201, "SSO provider created", formatSsoProvider(config));
    } catch (error) {
      return status.ResponseStatus(res, 500, error.message || "Failed to create SSO provider", {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const config = await SsoConfig.findByPk(id);
      if (!config) {
        return status.ResponseStatus(res, 404, "SSO provider not found");
      }

      const body = req.body && typeof req.body === "object" ? req.body : {};
      const payload = buildSsoPayload(body);
      if (payload.provider && payload.provider !== config.provider) {
        const clash = await SsoConfig.findOne({ where: { provider: payload.provider } });
        if (clash) {
          return status.ResponseStatus(res, 409, "Provider slug already exists");
        }
      }

      await config.update(payload);
      await config.reload();
      return status.ResponseStatus(res, 200, "SSO provider updated", formatSsoProvider(config));
    } catch (error) {
      return status.ResponseStatus(res, 500, error.message || "Failed to update SSO provider", {
        error: error.message,
      });
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const config = await SsoConfig.findByPk(id);
      if (!config) {
        return status.ResponseStatus(res, 404, "SSO provider not found");
      }
      await config.destroy();
      return status.ResponseStatus(res, 200, "SSO provider deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete SSO provider", {
        error: error.message,
      });
    }
  },
};
