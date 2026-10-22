import {describe,it,expect} from "vitest";
import ExcelJS from "exceljs";
import {previewInvoiceExcel} from "./invoice-excel-preview";
const headers=["invoiceId","invoiceDate","supplier","productKey","currency","unit","quantity","unitPrice"];
async function workbookBuffer(rows:unknown[][]):Promise<ArrayBuffer>{
 const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet("Invoices");ws.addRow(headers);rows.forEach(r=>ws.addRow(r));
 const b=await wb.xlsx.writeBuffer();
 return Uint8Array.from(b).buffer;
}
describe("local invoice XLSX preview",()=>{
 it("reads synthetic invoice records without uploading files",async()=>{
  const b=await workbookBuffer([["INV-1","2026-10-01","Firma ApS","coffee","DKK","kg",2,89.5]]);
  const result=await previewInvoiceExcel(b);
  expect(result.errors).toEqual([]);
  expect(result.rows[0]).toMatchObject({invoiceId:"INV-1",quantity:2,unitPrice:89.5});
 });
 it("rejects Excel formulas rather than trusting cached results",async()=>{
  const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet("Invoices");ws.addRow(headers);
  ws.addRow(["INV-2","2026-10-01","Supplier","tea","DKK","kg",1,{formula:"2+2",result:4}]);
  const b=await wb.xlsx.writeBuffer();
  await expect(previewInvoiceExcel(Uint8Array.from(b).buffer)).rejects.toThrow("excel_unsupported_cell");
 });
 it("reports the actual Excel sheet row after blank rows",async()=>{
  const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet("Invoices");ws.addRow(headers);
  ws.getRow(4).values=["INV-4","2026-02-30","Supplier","tea","DKK","kg",1,25];
  const b=await wb.xlsx.writeBuffer();
  const result=await previewInvoiceExcel(Uint8Array.from(b).buffer);
  expect(result.errors[0]?.row).toBe(4);
 });
 it("rejects incorrect headers and multiple sheets",async()=>{
  const wrong=new ExcelJS.Workbook();wrong.addWorksheet("One").addRow(["Bad header"]);
  await expect(previewInvoiceExcel(Uint8Array.from(await wrong.xlsx.writeBuffer()).buffer)).rejects.toThrow("invalid_excel_headers");
  const many=new ExcelJS.Workbook();many.addWorksheet("One").addRow(headers);many.addWorksheet("Two");
  await expect(previewInvoiceExcel(Uint8Array.from(await many.xlsx.writeBuffer()).buffer)).rejects.toThrow("excel_requires_one_sheet");
 });
});
