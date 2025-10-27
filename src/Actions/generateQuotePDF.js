// utils/generateQuotePDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate quotation number based on current year and count
 * Format: Q-YYYY-XXX
 */
export async function generateQuotationNumber() {
  try {
    // Dynamic import to avoid circular dependency
    const dbModule = await import("../dbServer");
    const db = dbModule.db || dbModule.default;
    
    const currentYear = new Date().getFullYear();
    
    // Get count of quotations created this year
    const { data, error } = await db
      .from("quotation_Table")
      .select("id", { count: 'exact' })
      .gte('created_at', `${currentYear}-01-01`)
      .lte('created_at', `${currentYear}-12-31`);
    
    if (error) {
      console.error("Error getting quotation count:", error);
      return `Q-${currentYear}-001`;
    }
    
    const count = (data?.length || 0) + 1;
    const paddedCount = String(count).padStart(3, '0');
    
    return `Q-${currentYear}-${paddedCount}`;
  } catch (err) {
    console.error("Error generating quotation number:", err);
    const currentYear = new Date().getFullYear();
    return `Q-${currentYear}-001`;
  }
}

/**
 * Save quotation to database
 */
export async function saveQuotation(formData, calculationData, quotationNumber) {
  try {
    const dbModule = await import("../dbServer");
    const db = dbModule.db || dbModule.default;
    
    const quotationData = {
      quotation_number: quotationNumber,
      client_name: formData.ownerName,
      client_address: formData.address,
      client_contact: formData.contactNumber,
      client_email: formData.email,
      vehicle_name: formData.vehicleName,
      vehicle_year: parseInt(formData.vehicleYear),
      vehicle_type: formData.vehicleType,
      plate_number: formData.plateNumber,
      original_vehicle_value: parseFloat(formData.originalValue),
      basic_premium: parseFloat(calculationData.basicPremium),
      total_premium: parseFloat(calculationData.totalPremium),
      with_aon: formData.withAON || false,
      aon_cost: parseFloat(calculationData.aonCost) || 0,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await db
      .from("quotation_Table")
      .insert([quotationData])
      .select()
      .single();
    
    if (error) {
      console.error("Error saving quotation:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Error in saveQuotation:", err);
    return { success: false, error: err };
  }
}

/**
 * Format currency to Philippine Peso (PDF-safe version)
 */
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  // Use simple string concatenation - jsPDF doesn't like fancy formatting
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'PHP ' + formatted;
}

/**
 * Format date to readable format
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Calculate validity date (30 days from issuance)
 */
function getValidityDate(issueDate) {
  const validityDate = new Date(issueDate);
  validityDate.setDate(validityDate.getDate() + 30);
  return validityDate;
}

/**
 * Generate PDF quotation
 */
export async function generateQuotePDF(formData, calculationData, quotationNumber) {
  const doc = new jsPDF();
  
  const issueDate = new Date();
  const validityDate = getValidityDate(issueDate);
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  let yPos = 20;
  
  // ========================================
  // HEADER - Company Information
  // ========================================
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('SILVERSTAR INSURANCE AGENCY INC', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Address: Room 210, 2nd flr, Shortorn Street Bahay Toro Project 8 QC', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text('Contact:', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text('Email: Silverstar@gmail.com', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // ========================================
  // Quotation Details
  // ========================================
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  
  // Left column
  doc.text('Quotation No.', marginLeft, yPos);
  doc.text('Date Issued', marginLeft, yPos + 6);
  doc.text('Prepared by', marginLeft, yPos + 12);
  doc.text('Validity', marginLeft, yPos + 18);
  
  // Right column
  doc.setFont(undefined, 'normal');
  doc.text(quotationNumber, marginLeft + 35, yPos);
  doc.text(formatDate(issueDate), marginLeft + 35, yPos + 6);
  doc.text('Silver Insurance Agency Inc.', marginLeft + 35, yPos + 12);
  doc.text('30 days from issuance', marginLeft + 35, yPos + 18);
  
  yPos += 30;
  
  // ========================================
  // CLIENT INFORMATION
  // ========================================
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENT INFORMATION', marginLeft + 2, yPos + 5);
  
  yPos += 12;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Name', marginLeft, yPos);
  doc.text('Address', marginLeft, yPos + 6);
  doc.text('Contact No.', marginLeft, yPos + 12);
  doc.text('Email', marginLeft, yPos + 18);
  
  doc.setFont(undefined, 'normal');
  doc.text(formData.ownerName || '-', marginLeft + 35, yPos);
  doc.text(formData.address || '-', marginLeft + 35, yPos + 6);
  doc.text(formData.contactNumber || '-', marginLeft + 35, yPos + 12);
  doc.text(formData.email || '-', marginLeft + 35, yPos + 18);
  
  yPos += 28;
  
  // ========================================
  // VEHICLE INFORMATION
  // ========================================
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('VEHICLE INFORMATION', marginLeft + 2, yPos + 5);
  
  yPos += 12;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Vehicle Name', marginLeft, yPos);
  doc.text('Vehicle Year', marginLeft, yPos + 6);
  doc.text('Vehicle Type', marginLeft, yPos + 12);
  doc.text('Plate No.', marginLeft, yPos + 18);
  doc.text('Original Vehicle Value', marginLeft, yPos + 24);
  
  doc.setFont(undefined, 'normal');
  doc.text(formData.vehicleName || '-', marginLeft + 50, yPos);
  doc.text(String(formData.vehicleYear || '-'), marginLeft + 50, yPos + 6);
  doc.text(formData.vehicleType || '-', marginLeft + 50, yPos + 12);
  doc.text(formData.plateNumber || '-', marginLeft + 50, yPos + 18);
  
  // Format original value manually
  const originalValue = parseFloat(formData.originalValue) || 0;
  const formattedOriginal = 'PHP ' + originalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  doc.text(formattedOriginal, marginLeft + 50, yPos + 24);
  
  yPos += 34;
  
  // ========================================
  // PREMIUM SUMMARY
  // ========================================
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, yPos, contentWidth, 8, 'F');
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('PREMIUM SUMMARY', marginLeft + 2, yPos + 5);
  
  yPos += 12;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Basic Premium', marginLeft, yPos);
  doc.text('Doc. Stamp', marginLeft, yPos + 6);
  doc.text('V.A.T', marginLeft, yPos + 12);
  doc.text('Local Gov. Tax', marginLeft, yPos + 18);
  
  if (formData.withAON) {
    doc.text('AON (Act of Nature)', marginLeft, yPos + 24);
  }
  
  doc.setFont(undefined, 'normal');
  
  // Format all currency values manually
  const basicPrem = parseFloat(calculationData.basicPremium) || 0;
  const formattedBasic = 'PHP ' + basicPrem.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  doc.text(formattedBasic, marginLeft + 50, yPos);
  doc.text(`${calculationData.docuStamp || 0}%`, marginLeft + 50, yPos + 6);
  doc.text(`${calculationData.vatTax || 0}%`, marginLeft + 50, yPos + 12);
  doc.text(`${calculationData.localGovTax || 0}%`, marginLeft + 50, yPos + 18);
  
  if (formData.withAON) {
    const aonVal = parseFloat(calculationData.aonCost) || 0;
    const formattedAon = 'PHP ' + aonVal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    doc.text(formattedAon, marginLeft + 50, yPos + 24);
    yPos += 6;
  }
  
  yPos += 28;
  
  // Total Premium
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPos - 4, pageWidth - marginRight, yPos - 4);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total Premium', marginLeft, yPos);
  
  const totalPrem = parseFloat(calculationData.totalPremium) || 0;
  const formattedTotal = 'PHP ' + totalPrem.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  doc.text(formattedTotal, marginLeft + 50, yPos);
  
  yPos += 15;
  
  // ========================================
  // NOTES/DISCLAIMER
  // ========================================
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('NOTES/DISCLAIMER:', marginLeft, yPos);
  
  yPos += 6;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const disclaimer = 'This quotation is issued by Silverstar Insurance Agency Inc. on behalf of Standard Insurance. The quotation is for reference only and is subject to approval and underwriting by the insurance provider.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, marginLeft, yPos);
  
  yPos += (disclaimerLines.length * 5) + 10;
  
  // ========================================
  // SIGNATURE
  // ========================================
  doc.setFont(undefined, 'normal');
  doc.text('Prepared by:', marginLeft, yPos);
  
  yPos += 15;
  
  doc.line(marginLeft, yPos, marginLeft + 60, yPos);
  yPos += 5;
  doc.setFontSize(9);
  doc.text('Silverstar Insurance Representative', marginLeft, yPos);
  
  // Save the PDF
  const fileName = `Silverstar_Insurance_Quotation_${quotationNumber}.pdf`;
  doc.save(fileName);
  
  return fileName;
}

/**
 * Main function to generate and download PDF
 */
export async function handleGenerateQuotePDF(formData, calculationData) {
  try {
    const quotationNumber = await generateQuotationNumber();
    
    const saveResult = await saveQuotation(formData, calculationData, quotationNumber);
    
    if (!saveResult.success) {
      console.error("Database save failed:", saveResult.error);
      alert("Warning: Could not save quotation to database. PDF will still be generated.\n\nError: " + (saveResult.error?.message || saveResult.error));
    }
    
    const fileName = await generateQuotePDF(formData, calculationData, quotationNumber);
    
    return {
      success: true,
      fileName,
      quotationNumber
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error.message
    };
  }
}