const status = require("../../helpers/Response");
const winterCampaignAdminService = require("../../services/winterCampaignAdminService");
const winterSpinService = require("../../services/winterSpinService");
const winterFormCopy = require("../../services/winterFormCopy");

module.exports = {
  listSubmissions: async (req, res) => {
    try {
      const results = await winterCampaignAdminService.listSubmissions(req.query);
      return status.ResponseStatus(res, 200, "OK", results);
    } catch (error) {
      console.error("Winter campaign list error:", error);
      return status.ResponseStatus(res, 500, "Unable to load campaign entries.");
    }
  },

  listWinners: async (req, res) => {
    try {
      const results = await winterCampaignAdminService.listWinners(req.query);
      return status.ResponseStatus(res, 200, "OK", results);
    } catch (error) {
      console.error("Winter campaign winners error:", error);
      return status.ResponseStatus(res, 500, "Unable to load winners.");
    }
  },

  exportExcel: async (req, res) => {
    try {
      const buffer = await winterCampaignAdminService.buildExport(req.query);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="winter-carnival.xlsx"');
      return res.send(buffer);
    } catch (error) {
      console.error("Winter campaign export error:", error);
      return status.ResponseStatus(res, 500, "Unable to export the list.");
    }
  },

  getBill: async (req, res) => {
    try {
      const file = await winterCampaignAdminService.billFile(req.params.id);
      if (!file.ok) return status.ResponseStatus(res, file.status || 404, file.message);
      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${String(file.originalName || "bill").replace(/"/g, "")}"`
      );
      return res.sendFile(file.filePath);
    } catch (error) {
      console.error("Winter campaign bill error:", error);
      return status.ResponseStatus(res, 500, "Unable to open the bill.");
    }
  },

  updateSubmission: async (req, res) => {
    try {
      const result = await winterCampaignAdminService.updateSubmission(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      });
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message);
    } catch (error) {
      console.error("Winter campaign update error:", error);
      return status.ResponseStatus(res, 500, "Unable to update the entry.");
    }
  },

  deleteSubmission: async (req, res) => {
    try {
      const result = await winterCampaignAdminService.deleteSubmission(req.params.id);
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message);
    } catch (error) {
      console.error("Winter campaign delete error:", error);
      return status.ResponseStatus(res, 500, "Unable to remove the entry.");
    }
  },

  getSpinDesk: async (req, res) => {
    try {
      const result = await winterSpinService.getSpinDesk(req.query.week);
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, "OK", result.desk);
    } catch (error) {
      console.error("Winter spin desk error:", error);
      return status.ResponseStatus(res, 500, "Unable to load the prize settings.");
    }
  },

  saveSpinSettings: async (req, res) => {
    try {
      const result = await winterSpinService.saveCampaignSettings(req.body || {});
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message, result.desk);
    } catch (error) {
      console.error("Winter spin settings error:", error);
      return status.ResponseStatus(res, 500, "Unable to save the contest settings.");
    }
  },

  saveSpinStock: async (req, res) => {
    try {
      const result = await winterSpinService.saveWeekStock(req.body || {});
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message, result.desk);
    } catch (error) {
      console.error("Winter spin stock error:", error);
      return status.ResponseStatus(res, 500, "Unable to save this week's prize counts.");
    }
  },

  saveFormCopy: async (req, res) => {
    try {
      const result = await winterFormCopy.saveFormCopy(req.body || {});
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message, { copy: result.copy });
    } catch (error) {
      console.error("Winter form copy save error:", error);
      return status.ResponseStatus(res, 500, "Unable to save the form content.");
    }
  },

  deleteWinner: async (req, res) => {
    try {
      const result = await winterCampaignAdminService.deleteWinner(req.params.id);
      if (!result.ok) return status.ResponseStatus(res, result.status || 400, result.message);
      return status.ResponseStatus(res, 200, result.message);
    } catch (error) {
      console.error("Winter campaign winner delete error:", error);
      return status.ResponseStatus(res, 500, "Unable to remove the winner.");
    }
  },
};
