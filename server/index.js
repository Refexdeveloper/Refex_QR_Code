require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { sequelize, Sequelize } = require("./src/models/index");
const history = require("connect-history-api-fallback");
const status = require("./src/helpers/Response");

const app = express();

// Middleware to parse incoming JSON data ==================================
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use("/uploads", express.static(__dirname + "/uploads"));

// Configuration for CORS Origin ------------------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
// app.use(cors("*"));       // To allow all orgins =============================

// // simple route
// app.get("/", (req, res) => {
//   return res.json({
//     success: true,
//     message: "Backend is running well",
//   });
// });

app.use("/auth", require("./src/routes/auth"));

app.use(
  "/api",
  require("./src/routes/assets"),
  require("./src/routes/integrations"),
  require("./src/routes/user"),
  require("./src/routes/administration"),
  require("./src/routes/fixedQr"),
  require("./src/routes/dynamicQr"),
  require("./src/routes/smartQr"),
  require("./src/routes/uploadFileQr"),
  require("./src/routes/designQr"),
  require("./src/routes/contest/contestForm"),
  require("./src/routes/contest/winterSpin"),
  require("./src/routes/brochure/brochure_download")
);

app.all("/api/*", (req, res) => {
  return status.ResponseStatus(res, 404, "Endpoint Not Found");
});

const dynamicQrController = require("./src/controllers/dynamicQr");
const smartQrController = require("./src/controllers/smartQr");
const uploadFileQrController = require("./src/controllers/uploadFileQr");
app.get("/qr/d/:id/:slug", dynamicQrController.publicRedirect);
app.get("/qr/s/:id/:slug", smartQrController.publicRedirect);
app.get("/qr/f/:id/:slug", uploadFileQrController.publicServe);

// Serve static files from the client build (preferred) or server/dist (fallback)
const clientDistPath = path.join(__dirname, "..", "client", "dist");
const serverDistPath = path.join(__dirname, "dist");
const distPath = fs.existsSync(clientDistPath) ? clientDistPath : serverDistPath;

app.use(express.static(distPath));
app.use(history());

// Serve the index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// set port, listen for requests
const PORT = process.env.APP_PORT || 8080;

sequelize
  .sync()
  .then(async () => {
    console.log("Database synced successfully");

    // Ensure Asset schema is compatible (adds assets.qr_url if missing)
    try {
      const qi = sequelize.getQueryInterface();
      const table = await qi.describeTable("assets");
      if (!table.qr_url) {
        await qi.addColumn("assets", "qr_url", {
          type: Sequelize.DataTypes.STRING(512),
          allowNull: true,
        });
        console.log("Added assets.qr_url column");
      }
    } catch (e) {
      // If assets table doesn't exist yet or permissions missing, skip hard-fail
      console.warn("Asset schema check skipped:", e.message);
    }

    try {
      const qi = sequelize.getQueryInterface();
      const userTable = await qi.describeTable("users");
      const userColumns = [
        { name: "employee_id", type: Sequelize.DataTypes.STRING(50), allowNull: true },
        { name: "company_name", type: Sequelize.DataTypes.STRING(255), allowNull: true },
        { name: "designation", type: Sequelize.DataTypes.STRING(255), allowNull: true },
        {
          name: "is_hrms_synced",
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { name: "pending_password", type: Sequelize.DataTypes.TEXT, allowNull: true },
        { name: "page_access", type: Sequelize.DataTypes.TEXT, allowNull: true },
        {
          name: "is_delete",
          type: Sequelize.DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
        },
      ];
      for (const col of userColumns) {
        if (!userTable[col.name]) {
          await qi.addColumn("users", col.name, {
            type: col.type,
            allowNull: col.allowNull,
            defaultValue: col.defaultValue,
          });
          console.log(`Added users.${col.name} column`);
        }
      }
    } catch (e) {
      console.warn("User schema check skipped:", e.message);
    }

    try {
      const qi = sequelize.getQueryInterface();
      const spinTable = await qi.describeTable("winter_spin_entries");
      if (!spinTable.token) {
        await qi.addColumn("winter_spin_entries", "token", {
          type: Sequelize.DataTypes.STRING(255),
          allowNull: true,
        });
        console.log("Added winter_spin_entries.token column");
      }
    } catch (e) {
      console.warn("Winter spin schema check skipped:", e.message);
    }

    try {
      const qi = sequelize.getQueryInterface();
      const campaignTable = await qi.describeTable("winter_campaign_submissions");
      if (!campaignTable.confirmation_sent_at) {
        await qi.addColumn("winter_campaign_submissions", "confirmation_sent_at", {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        });
        console.log("Added winter_campaign_submissions.confirmation_sent_at column");
      }
      const campaignColumns = [
        ["address", { type: Sequelize.DataTypes.TEXT, allowNull: true }],
        ["outlet", { type: Sequelize.DataTypes.STRING(120), allowNull: true }],
        ["invoice_value", { type: Sequelize.DataTypes.DECIMAL(12, 2), allowNull: true }],
      ];
      for (const [name, spec] of campaignColumns) {
        if (!campaignTable[name]) {
          await qi.addColumn("winter_campaign_submissions", name, spec);
          console.log(`Added winter_campaign_submissions.${name} column`);
        }
      }
      const billTable = await qi.describeTable("winter_campaign_bills");
      if (!billTable.kind) {
        await qi.addColumn("winter_campaign_bills", "kind", {
          type: Sequelize.DataTypes.STRING(20),
          allowNull: false,
          defaultValue: "invoice",
        });
        console.log("Added winter_campaign_bills.kind column");
      }
    } catch (e) {
      console.warn("Winter campaign schema check skipped:", e.message);
    }

    try {
      const qi = sequelize.getQueryInterface();
      const settingsTable = await qi.describeTable("winter_campaign_settings");
      if (!settingsTable.form_copy) {
        await qi.addColumn("winter_campaign_settings", "form_copy", {
          type: Sequelize.DataTypes.TEXT("long"),
          allowNull: true,
        });
        console.log("Added winter_campaign_settings.form_copy column");
      }
    } catch (e) {
      console.warn("Winter form copy schema check skipped:", e.message);
    }

    try {
      const qi = sequelize.getQueryInterface();
      const apiTable = await qi.describeTable("api_config");
      const apiColumns = [
        {
          name: "hrms_sync_cron_enabled",
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        {
          name: "hrms_sync_cron_hour",
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 22,
        },
        {
          name: "hrms_sync_cron_minute",
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      ];
      for (const col of apiColumns) {
        if (!apiTable[col.name]) {
          await qi.addColumn("api_config", col.name, {
            type: col.type,
            allowNull: col.allowNull,
            defaultValue: col.defaultValue,
          });
          console.log(`Added api_config.${col.name} column`);
        }
      }
    } catch (e) {
      console.warn("API config schema check skipped:", e.message);
    }

    const setupCronJobs = require("./src/cron");
    setupCronJobs();

    const { initHrmsSyncCronFromDb } = require("./src/services/hrmsCronScheduler");
    await initHrmsSyncCronFromDb();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
