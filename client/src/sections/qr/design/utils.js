import { DEFAULT_DESIGN, cloneDesign, normalizeEyeRadius } from './constants';

export function buildQrEyeRadius(eyeRadius) {
  return normalizeEyeRadius(eyeRadius).map((eye) => ({
    outer: [...eye.outer],
    inner: [...eye.inner],
  }));
}

export function getQrCanvasSize(design) {
  const size = Number(design?.size) || DEFAULT_DESIGN.size;
  const quietZone = Number(design?.quietZone) ?? DEFAULT_DESIGN.quietZone;
  return size + 2 * quietZone;
}

export function buildQrProps(design, logoImage) {
  const config = design || DEFAULT_DESIGN;

  const props = {
    value: config.value?.trim() || ' ',
    ecLevel: config.ecLevel || 'M',
    enableCORS: Boolean(config.enableCORS),
    size: Number(config.size) || 300,
    quietZone: Number(config.quietZone) ?? 10,
    bgColor: config.bgColor || '#FFFFFF',
    fgColor: config.fgColor || '#000000',
    qrStyle: config.qrStyle || 'squares',
    logoWidth: Number(config.logoWidth) || 60,
    logoHeight: Number(config.logoHeight) || 60,
    logoOpacity: Number(config.logoOpacity) ?? 1,
    logoPadding: Number(config.logoPadding) || 0,
    logoPaddingStyle: config.logoPaddingStyle || 'square',
    logoPaddingRadius: Number(config.logoPaddingRadius) || 0,
    removeQrCodeBehindLogo: Boolean(config.removeQrCodeBehindLogo),
    eyeRadius: buildQrEyeRadius(config.eyeRadius),
    eyeColor: config.eyeColor,
  };

  if (logoImage) {
    props.logoImage = logoImage;
  }

  return props;
}

export function extractDesignConfig(design) {
  const config = { ...design };
  delete config.name;
  delete config.value;
  delete config.logoImage;
  delete config.logoFile;
  delete config.editingId;
  return config;
}

export function designFromSavedItem(item) {
  if (!item) return null;

  return cloneDesign({
    ...DEFAULT_DESIGN,
    name: item.name || '',
    value: item.value || '',
    ...(item.design_config || {}),
  });
}

export function buildSaveFormData(design, { logoFile, removeLogo, editingId } = {}) {
  const formData = new FormData();
  formData.append('name', design.name.trim());
  formData.append('value', design.value.trim());
  formData.append('designConfig', JSON.stringify(extractDesignConfig(design)));

  if (logoFile) {
    formData.append('logo', logoFile);
  }
  if (removeLogo) {
    formData.append('removeLogo', 'true');
  }

  return { formData, editingId };
}
