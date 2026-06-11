export default (theme, className) => `
.${className}::-webkit-slider-runnable-track {
  width: 100%;
  height: 20px;
  cursor: ew-resize;
  background: ${theme.background2};
}

.${className}::-webkit-slider-thumb {
  height: 20px;
  width: 10px;
  background: ${theme.foreground1};
  cursor: ew-resize;
  -webkit-appearance: none;
  margin-top: 0px;
}

.${className}:focus::-webkit-slider-runnable-track {
  background: ${theme.background2};
  outline: none;
}

.${className}::-moz-range-track {
  width: 100%;
  height: 20px;
  cursor: ew-resize;
  background: ${theme.background2};
}

.${className}::-moz-range-thumb {
  border: 0px solid rgba(0, 0, 0, 0);
  height: 20px;
  width: 10px;
  border-radius: 0px;
  background: ${theme.foreground1};
  cursor: ew-resize;
}

.${className} {
  -webkit-appearance: none;
  width: 47.5%;
  margin: 0;
  margin-top: 2px;
}

.${className}:focus {
  outline: none;
}
`;
