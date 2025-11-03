// utils/generateQuotePDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add your signature base64 here
const SIGNATURE_BASE64 = 'data:image/png;base64,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'; 

/**
 * Generate quotation number based on current year and count
 * Format: Q-YYYY-XXX
 */
export async function generateQuotationNumber() {
  try {
    const dbModule = await import("../dbServer");
    const db = dbModule.db || dbModule.default;
    
    const currentYear = new Date().getFullYear();
    
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
    
    // Combine firstName and lastName for client_name (for backward compatibility)
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    
    const quotationData = {
      quotation_number: quotationNumber,
      client_name: fullName, // Combined name for old column
      firstName: formData.firstName,
      lastName: formData.lastName,
      client_address: formData.address,
      client_contact: formData.contactNumber,
      client_email: formData.email,
      insurance_partner: formData.partnerName,
      make: formData.make, // NEW: Vehicle make
      model: formData.model, // NEW: Vehicle model
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
 * Calculate amount from percentage and round to nearest whole number
 */
function calculateFromPercentage(percentage, baseAmount) {
  const result = (percentage / 100) * baseAmount;
  return Math.round(result); // Round to nearest whole number
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
  
  // Get full name
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '-';
  
  // Get Make Model combined
  const makeModel = `${formData.make || ''} ${formData.model || ''}`.trim() || '-';
  
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
  doc.text('Insurance Provider', marginLeft, yPos + 18);
  doc.text('Validity', marginLeft, yPos + 24);
  
  // Right column
  doc.setFont(undefined, 'normal');
  doc.text(quotationNumber, marginLeft + 45, yPos);
  doc.text(formatDate(issueDate), marginLeft + 45, yPos + 6);
  doc.text('Silver Insurance Agency Inc.', marginLeft + 45, yPos + 12);
  doc.text(formData.partnerName || '-', marginLeft + 45, yPos + 18);
  doc.text('30 days from issuance', marginLeft + 45, yPos + 24);
  
  yPos += 36;
  
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
  doc.text(fullName, marginLeft + 35, yPos);
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
  doc.text('Make Model', marginLeft, yPos);
  doc.text('Vehicle Year', marginLeft, yPos + 6);
  doc.text('Vehicle Type', marginLeft, yPos + 12);
  doc.text('Plate No.', marginLeft, yPos + 18);
  doc.text('Original Vehicle Value', marginLeft, yPos + 24);
  
  doc.setFont(undefined, 'normal');
  doc.text(makeModel, marginLeft + 50, yPos);
  doc.text(String(formData.vehicleYear || '-'), marginLeft + 50, yPos + 6);
  doc.text(formData.vehicleType || '-', marginLeft + 50, yPos + 12);
  doc.text(formData.plateNumber || '-', marginLeft + 50, yPos + 18);
  
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
  
  // Calculate tax amounts from percentages (rounded to 2 decimals)
  const basicPrem = parseFloat(calculationData.basicPremium) || 0;
  const localGovTaxAmount = calculateFromPercentage(calculationData.localGovTax || 0, basicPrem);
  const vatAmount = calculateFromPercentage(calculationData.vatTax || 0, basicPrem);
  const docuStampAmount = calculateFromPercentage(calculationData.docuStamp || 0, basicPrem);
  
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
  
  const formattedBasic = formatCurrency(basicPrem);
  const formattedDocuStamp = formatCurrency(docuStampAmount);
  const formattedVat = formatCurrency(vatAmount);
  const formattedLocalGov = formatCurrency(localGovTaxAmount);
  
  doc.text(formattedBasic, marginLeft + 50, yPos);
  doc.text(formattedDocuStamp, marginLeft + 50, yPos + 6);
  doc.text(formattedVat, marginLeft + 50, yPos + 12);
  doc.text(formattedLocalGov, marginLeft + 50, yPos + 18);
  
  if (formData.withAON) {
    const aonVal = parseFloat(calculationData.aonCost) || 0;
    const formattedAon = formatCurrency(aonVal);
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
  const formattedTotal = formatCurrency(totalPrem);
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
  
  yPos += 5;
  
  // Add signature image (if available)
  if (SIGNATURE_BASE64) {
    try {
      // Signature image - 50x25 size
      doc.addImage(SIGNATURE_BASE64, 'PNG', marginLeft + 20, yPos, 17, 10);
      yPos += 10;
    } catch (err) {
      console.log('Signature image not added');
      yPos += 15;
    }
  } else {
    yPos += 15;
  }
  
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