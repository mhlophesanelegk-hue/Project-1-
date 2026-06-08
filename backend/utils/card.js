const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

async function createMembershipCard(application) {
  const fileName = `membership-${application.id}.pdf`;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const W = doc.page.width;
  const H = doc.page.height;

  const memberName = application.User?.name || application.User?.email || 'Member';
  const status = application.status ? application.status.toUpperCase().replace(/_/g, ' ') : 'PENDING';
  const approvedAt = application.approvedAt ? new Date(application.approvedAt).toLocaleDateString('en-GB') : 'N/A';
  const expiryDate = application.expiryDate ? new Date(application.expiryDate).toLocaleDateString('en-GB') : 'N/A';

  const colors = {
    page: '#ffffff',
    card: '#f8f8f8',
    border: '#1f1f1f',
    text: '#111111',
    secondary: '#4d4d4d',
    accent: '#000000',
    divider: '#d8d8d8',
  };

  doc.rect(0, 0, W, H).fill(colors.page);

  const x = 72;
  const y = 72;
  const cardW = W - x * 2;
  const cardH = H - y * 2;

  doc.roundedRect(x, y, cardW, cardH, 24)
    .fill(colors.card)
    .lineWidth(2)
    .stroke(colors.border);

  const leftW = cardW * 0.55;
  const rightW = cardW - leftW - 32;

  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('MEMBERSHIP', x + 24, y + 24, { characterSpacing: 1.5 });

  doc.fillColor(colors.accent)
    .font('Helvetica-Bold')
    .fontSize(28)
    .text(application.membershipNumber || 'ESH-XXXX-XXXX', x + 24, y + 48);

  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(12)
    .text('Member details', x + 24, y + 90);

  doc.moveTo(x + 24, y + 108)
    .lineTo(x + leftW - 24, y + 108)
    .strokeColor(colors.divider)
    .lineWidth(1)
    .stroke();

  const detailsX = x + 24;
  let detailsY = y + 120;

  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Name', detailsX, detailsY);
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(14)
    .text(memberName, detailsX, detailsY + 18);

  detailsY += 54;
  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Status', detailsX, detailsY);
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(14)
    .text(status, detailsX, detailsY + 18);

  detailsY += 54;
  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Issued', detailsX, detailsY);
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(14)
    .text(approvedAt, detailsX, detailsY + 18);

  detailsY += 54;
  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Valid until', detailsX, detailsY);
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(14)
    .text(expiryDate, detailsX, detailsY + 18);

  const badgeX = x + leftW + 24;
  const badgeY = y + 24;
  const badgeW = rightW;
  const badgeH = cardH - 48;

  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 18)
    .fill('#ffffff')
    .strokeColor(colors.divider)
    .lineWidth(1)
    .stroke();

  doc.fillColor(colors.text)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('APPROVED MEMBER', badgeX + 20, badgeY + 20, {
      width: badgeW - 40,
      align: 'left',
      characterSpacing: 1,
    });
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(10)
    .text('This card confirms your membership status and access privileges.', badgeX + 20, badgeY + 110, {
      width: badgeW - 40,
      align: 'left',
      lineGap: 4,
    });

  doc.moveTo(badgeX + 20, badgeY + badgeH - 90)
    .lineTo(badgeX + badgeW - 20, badgeY + badgeH - 90)
    .strokeColor(colors.divider)
    .lineWidth(1)
    .stroke();

  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(10)
    .text('Eshlahleni Social Club', badgeX + 20, badgeY + badgeH - 74);
  doc.fillColor(colors.secondary)
    .font('Helvetica')
    .fontSize(8)
    .text('Luxury membership document', badgeX + 20, badgeY + badgeH - 58);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
}

module.exports = { createMembershipCard };
