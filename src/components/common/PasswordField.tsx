import { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useTranslation } from 'react-i18next';

/** A password box with the eye button that shows or hides what was typed. */
export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const label = t(visible ? 'auth.hidePassword' : 'auth.showPassword');

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...props.slotProps,
        input: {
          ...(typeof props.slotProps?.input === 'object' ? props.slotProps.input : {}),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={label}
                title={label}
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
                // Pressing the button must not take the focus (and the cursor) away from the box.
                onMouseDown={(e) => e.preventDefault()}
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
