const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { SsoConfig, User, LoginHistory } = require("../models");
const {
  loginErrorRedirect,
  buildCallbackRedirect,
  resolveRedirectUri,
  resolveOidcEndpoints,
  extractEmailFromProfile,
} = require("../services/ssoService");

const { APP_KEY } = process.env;

async function loadActiveSsoProvider(providerSlug) {
  const provider = String(providerSlug || "").trim().toLowerCase();
  if (!provider) return null;
  return SsoConfig.findOne({
    where: {
      provider,
      is_active: true,
      client_id: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
    },
  });
}

function formatUserData(user) {
  const { id, first_name, last_name, email, user_name, role, photo, page_access } = user;
  return {
    id,
    first_name,
    last_name,
    email,
    user_name,
    role,
    page_access,
    photo: photo ? Buffer.from(photo, "binary").toString() : null,
  };
}

module.exports = {
  listPublicProviders: async (req, res) => {
    try {
      const rows = await SsoConfig.findAll({
        where: {
          is_active: true,
          client_id: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        },
        order: [
          ["sort_order", "ASC"],
          ["display_name", "ASC"],
          ["provider", "ASC"],
        ],
        attributes: ["provider", "display_name", "icon_url", "sort_order"],
      });

      const results = rows.map((row) => {
        const item = row.toJSON();
        return {
          provider: item.provider,
          displayName: item.display_name,
          iconUrl: item.icon_url,
          sortOrder: item.sort_order,
        };
      });

      return res.status(200).json(results);
    } catch (error) {
      console.error("listPublicProviders error:", error);
      return res.status(500).json({ message: "Failed to load SSO providers" });
    }
  },

  ssoRedirect: async (req, res) => {
    try {
      const provider = String(req.params.provider || "").trim().toLowerCase();
      const config = await loadActiveSsoProvider(provider);
      if (!config?.client_id) {
        return res.status(400).json({
          message: `${provider || "SSO"} is not configured. Contact admin.`,
        });
      }

      const endpoints = await resolveOidcEndpoints(config);
      if (!endpoints.authorizationUrl) {
        return res.status(400).json({
          message: "SSO authorization URL is not configured. Contact admin.",
        });
      }

      const redirectUri = resolveRedirectUri(config, req, provider);
      const state = (req.query.state || config.frontend_base_url || "")
        .toString()
        .replace(/\/$/, "");
      const params = new URLSearchParams({
        client_id: config.client_id,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: endpoints.scopes,
        ...(state ? { state } : {}),
      });

      return res.redirect(`${endpoints.authorizationUrl}?${params.toString()}`);
    } catch (error) {
      console.error("SSO redirect error:", error);
      return res.status(500).json({ message: "SSO not available" });
    }
  },

  ssoCallback: async (req, res) => {
    const { code, state } = req.query;
    const provider = String(req.params.provider || "").trim().toLowerCase();

    if (!code) {
      return res.redirect(loginErrorRedirect(state, "no_code"));
    }

    try {
      const config = await SsoConfig.findOne({
        where: {
          provider,
          is_active: true,
        },
      });

      if (!config?.client_id || !config?.client_secret) {
        return res.redirect(loginErrorRedirect(state, "not_configured"));
      }

      const endpoints = await resolveOidcEndpoints(config);
      if (!endpoints.tokenUrl || !endpoints.userInfoUrl) {
        return res.redirect(loginErrorRedirect(state, "not_configured"));
      }

      const redirectUri = resolveRedirectUri(config, req, provider);
      const tokenRes = await fetch(endpoints.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: config.client_id,
          client_secret: config.client_secret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error(`${provider} token error:`, err);
        return res.redirect(loginErrorRedirect(state, "token_failed"));
      }

      const tokens = await tokenRes.json();
      const userRes = await fetch(endpoints.userInfoUrl, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userRes.ok) {
        return res.redirect(loginErrorRedirect(state, "profile_failed"));
      }

      const profile = await userRes.json();
      const email = extractEmailFromProfile(profile);
      if (!email) {
        return res.redirect(loginErrorRedirect(state, "no_email"));
      }

      const user = await User.findOne({
        where: {
          email,
          is_delete: 0,
          is_verified: true,
        },
      });

      if (!user) {
        return res.redirect(loginErrorRedirect(state, "user_not_found"));
      }

      const userData = formatUserData(user);
      const history = await LoginHistory.create({
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_name: user.user_name,
        status: "Logged-In",
      });
      const token = jwt.sign(
        { session_id: history.id, user_id: user.id },
        APP_KEY,
        { expiresIn: "1d" }
      );

      return res.redirect(buildCallbackRedirect(config, state, token, userData));
    } catch (error) {
      console.error(`${provider} callback error:`, error);
      return res.redirect(loginErrorRedirect(req.query.state, "login_failed"));
    }
  },
};
