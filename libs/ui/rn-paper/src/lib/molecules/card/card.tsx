import { useCallback, type ReactNode, type Ref } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  CardActionItem,
  CardImageSize,
  CardMoleculeProps,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  CardActionItem,
  CardAppearance,
  CardImageSize,
  CardMoleculeProps,
  CardVariant,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicCardProps extends CardMoleculeProps {
  /** Fired when a data-driven action button in `actions` is pressed. */
  onActionClick?: (action: CardActionItem) => void;
  /** Fired when a data-driven chip in `chips` is pressed. */
  onChipSelect?: (chip: ChipItem) => void;
  /** Custom slot rendered inside the card header area above or alongside title/subtitle. */
  headerSlot?: ReactNode;
  /** Custom slot rendered inside the card media area alongside or replacing `imageSrc`. */
  mediaSlot?: ReactNode;
  /** Custom slot rendered at the bottom of the card inside the footer section. */
  footerSlot?: ReactNode;
  /** Custom body content rendered inside the card content region. */
  children?: ReactNode;
  /** Style override applied to the outer card container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer card container `View`. */
  ref?: Ref<View>;
}

const IMAGE_SIZE_HEIGHT: Record<CardImageSize, number> = {
  small: 80,
  medium: 140,
  large: 200,
  'extra-large': 280,
  full: 220,
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    width: '100%',
  },
  raisedShadow: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px 2px rgba(0, 0, 0, 0.14), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  mediaInset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediaFullImage: {
    width: '100%',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  chipLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsStart: {
    justifyContent: 'flex-start',
  },
  actionsEnd: {
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
});

function parseWidthDimension(width: string | undefined): DimensionValue | undefined {
  if (!width) {
    return undefined;
  }
  const trimmed = width.trim();
  if (trimmed.endsWith('px')) {
    const parsed = Number.parseFloat(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (trimmed.endsWith('%')) {
    return trimmed as `${number}%`;
  }
  const numeric = Number(trimmed);
  return Number.isNaN(numeric) ? undefined : numeric;
}

/**
 * Material 3 card container molecule composing header, media, content,
 * chips, actions (`MagicButton`), and footer slots.
 *
 * Supports `'outlined'` and `'raised'` appearances, configurable media sizing
 * (`'small'`, `'medium'`, `'large'`, `'extra-large'`, `'full'`), data-driven
 * `chips` and `actions`, and custom slots (`headerSlot`, `mediaSlot`,
 * `children`, `footerSlot`).
 */
export function MagicCard({
  id,
  testId,
  ariaLabel,
  title,
  subtitle,
  content,
  imageSrc,
  imageAlt = '',
  imageSize = 'full',
  appearance = 'outlined',
  variant = 'basic',
  width,
  actions = [],
  chips = [],
  alignActions = 'start',
  onActionClick,
  onChipSelect,
  headerSlot,
  mediaSlot,
  footerSlot,
  children,
  style,
  ref,
}: MagicCardProps) {
  const { theme, colors } = useMagicPaperColors();

  const hasHeader = Boolean(headerSlot || title || subtitle);
  const hasMedia = Boolean(mediaSlot || imageSrc);
  const hasBody = Boolean(content || children);
  const showChips = variant === 'with-chips' || chips.length > 0;
  const showActions = variant === 'with-actions' || actions.length > 0;
  const hasFooter = Boolean(footerSlot);

  const isOutlined = appearance === 'outlined';
  const imageHeight = IMAGE_SIZE_HEIGHT[imageSize];
  const isFullImage = imageSize === 'full';
  const parsedWidth = parseWidthDimension(width);

  const handleActionPress = useCallback(
    (action: CardActionItem) => {
      if (!action.disabled) {
        onActionClick?.(action);
      }
    },
    [onActionClick]
  );

  const handleChipPress = useCallback(
    (chip: ChipItem) => {
      if (!chip.disabled) {
        onChipSelect?.(chip);
      }
    },
    [onChipSelect]
  );

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityLabel={ariaLabel}
      style={[
        styles.card,
        {
          borderRadius: theme.roundness * 1.5,
          backgroundColor: isOutlined
            ? colors.surface
            : colors.elevation.level1,
          borderWidth: isOutlined ? 1 : 0,
          borderColor: isOutlined ? colors.outlineVariant ?? colors.outline : 'transparent',
        },
        !isOutlined ? styles.raisedShadow : undefined,
        parsedWidth !== undefined ? { width: parsedWidth, maxWidth: '100%' } : undefined,
        style,
      ]}
    >
      {hasHeader ? (
        <View
          testID={testId ? `${testId}-header` : undefined}
          style={styles.header}
        >
          {headerSlot}
          {title ? (
            <Text
              accessibilityRole="header"
              testID={testId ? `${testId}-title` : undefined}
              style={[styles.title, { color: colors.onSurface }]}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              testID={testId ? `${testId}-subtitle` : undefined}
              style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {hasMedia ? (
        <View
          testID={testId ? `${testId}-media` : undefined}
          style={[
            styles.mediaContainer,
            !isFullImage && imageSrc ? styles.mediaInset : undefined,
          ]}
        >
          {mediaSlot}
          {imageSrc ? (
            <Image
              source={{ uri: imageSrc }}
              accessibilityLabel={imageAlt}
              alt={imageAlt}
              resizeMode="cover"
              testID={testId ? `${testId}-image` : undefined}
              style={[
                isFullImage
                  ? [styles.mediaFullImage, { height: imageHeight }]
                  : {
                      width: imageHeight,
                      height: imageHeight,
                      borderRadius: theme.roundness,
                    },
              ]}
            />
          ) : null}
        </View>
      ) : null}

      {hasBody ? (
        <View
          testID={testId ? `${testId}-content` : undefined}
          style={styles.content}
        >
          {content ? (
            <Text
              testID={testId ? `${testId}-content-text` : undefined}
              style={[styles.contentText, { color: colors.onSurface }]}
            >
              {content}
            </Text>
          ) : null}
          {children}
        </View>
      ) : null}

      {showChips ? (
        <View
          testID={testId ? `${testId}-chips` : undefined}
          style={styles.chipsContainer}
        >
          {chips.map((chip, index) => {
            const chipKey = chip.id ?? `${chip.label}-${index}`;
            const isChipDisabled = Boolean(chip.disabled);
            const isChipSelected = Boolean(chip.selected);
            const chipBg = isChipDisabled
              ? colors.surfaceDisabled
              : isChipSelected
                ? colors.secondaryContainer
                : 'transparent';
            const chipFg = isChipDisabled
              ? colors.onSurfaceDisabled
              : isChipSelected
                ? colors.onSecondaryContainer
                : colors.onSurfaceVariant;
            const chipBorder = isChipDisabled
              ? colors.surfaceDisabled
              : isChipSelected
                ? colors.secondaryContainer
                : colors.outline;

            return (
              <Pressable
                key={chipKey}
                testID={
                  testId ? `${testId}-chip-${chip.id ?? index}` : undefined
                }
                disabled={isChipDisabled}
                accessibilityRole="button"
                accessibilityLabel={chip.label}
                accessibilityState={{
                  disabled: isChipDisabled,
                  selected: isChipSelected,
                }}
                onPress={() => handleChipPress(chip)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: chipBg,
                    borderColor: chipBorder,
                  },
                ]}
              >
                {chip.avatarSrc ? (
                  <Image
                    source={{ uri: chip.avatarSrc }}
                    accessibilityLabel={chip.avatarAlt ?? ''}
                    alt={chip.avatarAlt ?? ''}
                    style={styles.chipAvatar}
                  />
                ) : chip.leadingIcon ? (
                  <MagicIcon
                    icon={chip.leadingIcon}
                    size={16}
                    color={chipFg}
                  />
                ) : isChipSelected ? (
                  <MagicIcon icon="check" size={16} color={chipFg} />
                ) : null}
                <Text style={[styles.chipLabel, { color: chipFg }]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {showActions ? (
        <View
          testID={testId ? `${testId}-actions` : undefined}
          style={[
            styles.actionsContainer,
            alignActions === 'end' ? styles.actionsEnd : styles.actionsStart,
          ]}
        >
          {actions.map((action, index) => {
            const actionKey = action.id ?? `${action.label}-${index}`;
            return (
              <MagicButton
                key={actionKey}
                testId={
                  testId ? `${testId}-action-${action.id ?? index}` : undefined
                }
                label={action.label}
                variant={action.variant ?? 'text'}
                color={action.color ?? 'primary'}
                leadingIcon={action.icon}
                disabled={action.disabled}
                size="sm"
                onPress={() => handleActionPress(action)}
              />
            );
          })}
        </View>
      ) : null}

      {hasFooter ? (
        <View
          testID={testId ? `${testId}-footer` : undefined}
          style={styles.footer}
        >
          {footerSlot}
        </View>
      ) : null}
    </View>
  );
}
