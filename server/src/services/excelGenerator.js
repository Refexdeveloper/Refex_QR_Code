// const XLSX = require("xlsx");

// module.exports = {
//   generateContestFormExcel: async (data) => {
//     try {
//       // Format data for Excel
//       const formattedData = data.map((item) => ({
//         ID: item.id,
//         Name: item.name,
//         "Mobile Number": item.mobile_number,
//         Email: item.email,
//         "Has Residential Address": item.has_residential_address ? "Yes" : "No",
//         "Is Participate": item.is_participate ? "Yes" : "No",
//         "Is Acknowledge": item.is_acknowledge ? "Yes" : "No",
//         "Invoice File": item.invoice,
//         "Created At": item.created_at,
//       }));

//       // Create a new workbook
//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(formattedData);

//       // Add worksheet to workbook
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Contest Forms");

//       // Generate Excel buffer
//       const excelBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "buffer",
//       });

//       return excelBuffer;
//     } catch (error) {
//       console.error("Error generating Excel file:", error);
//       throw error;
//     }
//   },
// };

const XLSX = require("xlsx");

module.exports = {
  generateContestFormExcel: async (data) => {
    try {
      // Base URL from environment variables
      const baseUrl = process.env.APP_URL || "https://qrcode.refex.group";

      // Format data for Excel with hyperlinks
      const formattedData = data.map((item) => {
        // Create the full invoice URL
        const invoiceUrl = `${baseUrl}/uploads/contest_invoices/${item.invoice}`;

        return {
          ID: item.id,
          Name: item.name,
          "Mobile Number": item.mobile_number,
          Email: item.email,
          "Has Residential Address": item.has_residential_address
            ? "Yes"
            : "No",
          "Is Participate": item.is_participate ? "Yes" : "No",
          "Is Acknowledge": item.is_acknowledge ? "Yes" : "No",
          "Invoice File": {
            // This creates a clickable hyperlink in Excel
            v: item.invoice, // Display text
            l: { Target: invoiceUrl }, // Hyperlink target
            t: "s", // Type string
            z: "0", // Format index
          },
          "Created At": item.created_at,
        };
      });

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contest Forms");

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      return excelBuffer;
    } catch (error) {
      console.error("Error generating Excel file:", error);
      throw error;
    }
  },
};
