import ExcelJS from "exceljs";

export const exportToExcel = async (rows, sheetName, res, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = Object.keys(rows[0]).map(c => ({
    header: c,
    key: c,
    width: 25
  }));

  rows.forEach(r => sheet.addRow(r));
  sheet.getRow(1).font = { bold: true };

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  await workbook.xlsx.write(res);
};
