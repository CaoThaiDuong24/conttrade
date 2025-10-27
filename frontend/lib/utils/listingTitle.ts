/**
 * Listing Title Utilities
 * 
 * Utility functions for formatting listing titles in Vietnamese
 * Uses real data from master data API
 */

import { getSizeLabel } from './containerSize';
import { getStandardLabel } from './qualityStandard';
import { getConditionLabel } from './condition';
import { getDealTypeDisplayName } from './dealType';
import { getTypeLabel } from './containerType';

/**
 * Generate auto title for listing in Vietnamese
 * @param params - Parameters from master data and form
 * @returns Formatted Vietnamese title
 */
export function generateListingTitle(params: {
  size?: string | number;
  sizeData?: { size_ft: number };
  type?: string;
  typeData?: { code: string; name?: string; name_vi?: string };
  standard?: string;
  standardData?: { code: string; name?: string; name_vi?: string };
  condition?: string;
  dealType?: string;
}): string {
  const {
    size,
    sizeData,
    type,
    typeData,
    standard,
    standardData,
    condition,
    dealType
  } = params;

  // Get formatted size
  const sizeValue = sizeData?.size_ft || size;
  const sizeLabel = getSizeLabel(sizeValue);

  // Get container type name in Vietnamese
  const typeValue = typeData?.code || type;
  const typeName = typeData?.name_vi || typeData?.name || getTypeLabel(typeValue);

  // Get standard name in Vietnamese
  const standardName = standardData?.name_vi || standardData?.name || standard;
  const standardLabel = getStandardLabel(standardName);

  // Build title
  let title = `Container ${typeName}`;
  
  if (sizeValue) {
    title += ` ${sizeLabel}`;
  }
  
  if (standardLabel && standardLabel !== 'N/A') {
    title += ` - ${standardLabel}`;
  }

  return title;
}

/**
 * Generate auto description for listing in Vietnamese
 * @param params - Parameters from master data and form
 * @returns Formatted Vietnamese description
 */
export function generateListingDescription(params: {
  size?: string | number;
  sizeData?: { size_ft: number };
  type?: string;
  typeData?: { code: string; name?: string; name_vi?: string };
  standard?: string;
  standardData?: { code: string; name?: string; name_vi?: string };
  condition?: string;
  dealType?: string;
  dealTypeData?: { code: string; name?: string; name_vi?: string; description?: string };
}): string {
  const {
    size,
    sizeData,
    type,
    typeData,
    standard,
    standardData,
    condition,
    dealType,
    dealTypeData
  } = params;

  // Get formatted size
  const sizeValue = sizeData?.size_ft || size;
  const sizeLabel = getSizeLabel(sizeValue);
  
  const typeValue = typeData?.code || type;
  const typeName = typeData?.name_vi || typeData?.name || getTypeLabel(typeValue);
  
  const standardName = standardData?.name_vi || standardData?.name || standard;
  const standardLabel = getStandardLabel(standardName);
  
  const conditionLabel = getConditionLabel(condition || '');
  
  const dealTypeName = dealTypeData?.name_vi || dealTypeData?.name || getDealTypeDisplayName(dealType || '');

  // Build description
  let description = `Container ${typeName}`;
  
  if (sizeLabel && sizeLabel !== 'N/A') {
    description += ` kích thước ${sizeLabel}`;
  }
  
  if (standardLabel && standardLabel !== 'N/A') {
    description += ` với tiêu chuẩn chất lượng ${standardLabel}`;
  }
  
  if (conditionLabel && conditionLabel !== 'N/A') {
    description += `. Tình trạng container: ${conditionLabel}`;
  }
  
  if (dealTypeName && dealTypeName !== 'N/A') {
    description += `. Loại giao dịch: ${dealTypeName}`;
  }

  // Add deal type description if available
  if (dealTypeData?.description) {
    description += `. ${dealTypeData.description}`;
  } else {
    description += '. Sản phẩm chất lượng cao, phù hợp cho nhiều mục đích sử dụng khác nhau.';
  }

  return description;
}

/**
 * Format existing listing title to Vietnamese
 * Useful for updating old titles that may contain codes
 * @param title - Original title
 * @param listing - Full listing data with facets for regeneration
 * @returns Formatted Vietnamese title
 */
export function formatListingTitle(
  title: string | undefined | null,
  listing?: {
    listing_facets?: Array<{ key: string; value: string }>;
    facets?: Array<{ key: string; value: string }>;
    size?: string | number;
    type?: string;
    standard?: string;
    condition?: string;
    deal_type?: string;
  }
): string {
  if (!title && !listing) return 'Container';
  
  // If title already looks good (has Vietnamese text and proper format), return as-is
  if (title && title.length > 20 && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(title) && !title.includes('ft ')) {
    return title;
  }

  // If title contains codes or English text, try to regenerate from facets
  if (listing) {
    const facets = listing.listing_facets || listing.facets || [];
    const size = facets.find(f => f.key === 'size')?.value || listing.size;
    const type = facets.find(f => f.key === 'type')?.value || listing.type;
    const standard = facets.find(f => f.key === 'standard')?.value || listing.standard;
    const condition = facets.find(f => f.key === 'condition')?.value || listing.condition;

    // Try to regenerate title if we have basic info
    if (size || type || standard) {
      const sizeLabel = getSizeLabel(size);
      const typeLabel = getTypeLabel(type);
      const standardLabel = getStandardLabel(standard);
      
      let newTitle = `Container ${typeLabel}`;
      
      if (sizeLabel && sizeLabel !== 'N/A') {
        newTitle += ` ${sizeLabel}`;
      }
      
      if (standardLabel && standardLabel !== 'N/A') {
        newTitle += ` - ${standardLabel}`;
      }
      
      return newTitle;
    }
  }

  return title || 'Container';
}
