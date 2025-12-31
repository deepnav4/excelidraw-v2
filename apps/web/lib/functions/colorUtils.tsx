export const normalizeHexColor = (hex: string): string => {
  // Remove # if present
  let normalized = hex.replace(/^#/, '');
  
  // Convert 3-digit to 6-digit
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  
  // Add # prefix
  return `#${normalized}`;
};

export const isValidHexColor = (hex: string): boolean => {
  return /^#?[0-9A-Fa-f]{3,6}$/.test(hex);
};

export const validateAndApplyColor = (
  value: string,
  onColorChange: (color: string) => void
): boolean => {
  if (isValidHexColor(value)) {
    onColorChange(normalizeHexColor(value));
    return true;
  }
  return false;
};

export interface ColorEditorState {
  isEditing: boolean;
  tempValue: string;
}

export const createColorEditorState = (): ColorEditorState => ({
  isEditing: false,
  tempValue: ''
});

export const startEditing = (
  currentColor: string,
  setState: (state: ColorEditorState) => void
): void => {
  setState({
    isEditing: true,
    tempValue: currentColor
  });
};

export const cancelEditing = (
  setState: (state: ColorEditorState) => void
): void => {
  setState({
    isEditing: false,
    tempValue: ''
  });
};

export const applyColorEdit = (
  tempValue: string,
  onColorChange: (color: string) => void,
  setState: (state: ColorEditorState) => void
): void => {
  if (validateAndApplyColor(tempValue, onColorChange)) {
    cancelEditing(setState);
  }
};

export const updateTempValue = (
  value: string,
  currentState: ColorEditorState,
  setState: (state: ColorEditorState) => void
): void => {
  setState({
    ...currentState,
    tempValue: value
  });
};
