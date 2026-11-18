export async function exportPdf(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][]
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(title, 40, 50);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 40, 70);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.line(40, 80, pageWidth - 40, 80);

  autoTable(doc, {
    startY: 100,
    head: [headers],
    body: rows,
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 8, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      [headers.length - 1]: { halign: "right" },
    },
    margin: { left: 40, right: 40 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generado por Calculadora de Lotaje · ${new Date().toLocaleString("es-ES")}`,
    40,
    finalY + 30
  );

  doc.save(filename);
}
