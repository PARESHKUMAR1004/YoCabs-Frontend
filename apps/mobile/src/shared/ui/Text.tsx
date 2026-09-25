import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from '@/config/brand';

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: keyof typeof colors;
  align?: TextStyle['textAlign'];
}

/** All text goes through here so typography and colour stay consistent. */
export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
    />
  );
}
