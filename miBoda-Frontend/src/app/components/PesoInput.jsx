import React, { useRef, useImperativeHandle, useState, useEffect } from "react";
import { Typography, TextField } from '@mui/material';

const PesoInput = React.forwardRef(({ value, onChange, ...props }, ref) => {
  const inputRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value !== null && value !== undefined ? value.toString() : '');

  // Actualizar el valor interno cuando cambia el prop value
  useEffect(() => {
    setInternalValue(value !== null && value !== undefined ? value.toString() : '');
  }, [value]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => {
      const rawValue = inputRef.current.value;
      if (rawValue === '') return null;
      
      const numericValue = parseFloat(rawValue);
      return isNaN(numericValue) ? null : numericValue;
    },
    getRawValue: () => inputRef.current.value
  }));

  const isValidInput = (input) => {
    // Permitir vacío
    if (input === '') return true;
    
    // Validar formato de número con hasta 3 decimales opcionales
    return /^-?\d*\.?\d*$/.test(input);
  };

  const handleKeyDown = (e) => {
    // Permitir teclas de control
    if ([
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'Tab', 'Home', 'End', 'Enter'
    ].includes(e.key)) {
      return;
    }

    // Permitir Ctrl/Cmd + A, C, V, X, Z
    if (e.ctrlKey || e.metaKey) {
      if (['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
        return;
      }
    }

    // Permitir números
    if (/[0-9]/.test(e.key)) {
      return;
    }

    // Permitir un solo punto decimal
    if (e.key === '.') {
      const currentValue = e.target.value;
      if (!currentValue.includes('.')) {
        return;
      }
    }

    // Permitir signo negativo solo al inicio
    if (e.key === '-') {
      if (e.target.selectionStart === 0 && !e.target.value.includes('-')) {
        return;
      }
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    
    // Validar que lo pegado sea un número válido
    if (isValidInput(pasteData)) {
      document.execCommand('insertText', false, pasteData);
    }
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // Validar el input
    if (isValidInput(rawValue)) {
      setInternalValue(rawValue);
      
      // Propagrar el cambio si hay una función onChange
      if (onChange) {
        const numericValue = rawValue === '' ? null : parseFloat(rawValue);
        onChange(numericValue);
      }
    }
  };

  const handleBlur = (e) => {
    let formattedValue = e.target.value;

    // Formatear al perder el foco solo si es necesario
    if (formattedValue !== '') {
      // Remover ceros innecesarios al inicio (excepto si es 0. algo)
      if (formattedValue.startsWith('0') && formattedValue.length > 1 && !formattedValue.startsWith('0.')) {
        formattedValue = formattedValue.replace(/^0+/, '');
      }
      
      // Si empieza con punto, agregar 0
      if (formattedValue.startsWith('.')) {
        formattedValue = '0' + formattedValue;
      }
      
      // Si termina con punto, remover el punto
      if (formattedValue.endsWith('.')) {
        formattedValue = formattedValue.slice(0, -1);
      }

      // Convertir a número y verificar si es válido
      const numericValue = parseFloat(formattedValue);
      if (!isNaN(numericValue)) {
        setInternalValue(formattedValue);
        if (onChange) {
          onChange(numericValue);
        }
      } else {
        setInternalValue('');
        if (onChange) {
          onChange(null);
        }
      }
    } else {
      if (onChange) {
        onChange(null);
      }
    }
  };

  const handleFocus = (e) => {
    // Seleccionar todo el texto al hacer focus
    e.target.select();
  };

  return (
    <TextField
      value={internalValue}
      placeholder="0"
      inputRef={inputRef}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPaste={handlePaste}
      inputProps={{
        inputMode: "decimal",
        pattern: "^\\d*(\\.\\d*)?$",
        min: "0",
        step: "any"
      }}
      InputProps={{
        startAdornment: (
          <Typography variant="body1" sx={{ mr: 1, color: 'text.secondary' }}>
            g
          </Typography>
        ),
      }}
      {...props}
    />
  );
});

// Añadir displayName para mejor debugging
PesoInput.displayName = 'PesoInput';

export default PesoInput;