import type { ReactNode, Ref } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, type CSSObject, type SxProps, type Theme } from '@mui/material/styles';
import type {
  CardActionItem,
  CardImageSize,
  CardMoleculeProps,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';

/**
 * Props for {@link MagicCard}, extending {@link CardMoleculeProps}
 * with React 19 / MUI v9 slots, event callbacks, and styling ergonomics.
 */
export interface MagicCardProps extends CardMoleculeProps {
  /** Optional header avatar image URL rendered in the default card header. */
  avatarSrc?: string;
  /** Alt text for the header avatar image. Defaults to `''`. */
  avatarAlt?: string;
  /** Invoked when a data-driven action button from `actions` is clicked. */
  onActionClick?: (action: CardActionItem) => void;
  /** Invoked when a chip from `chips` is clicked. */
  onChipSelect?: (chip: ChipItem) => void;
  /** Custom React node rendered in place of or above the default card header. */
  headerSlot?: ReactNode;
  /** Custom React node rendered in place of the default card media image. */
  mediaSlot?: ReactNode;
  /** Custom React node rendered inside the card footer section. */
  footerSlot?: ReactNode;
  /** Body content rendered inside `CardContent` alongside `content`. */
  children?: ReactNode;
  /** Optional MUI `sx` overrides applied to the root `Card`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `Card`. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `Card` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const IMAGE_SIZE_STYLES: Record<CardImageSize, CSSObject> = {
  small: {
    width: 80,
    height: 80,
    borderRadius: 1,
    mx: 'auto',
    mt: 1,
  },
  medium: {
    width: 140,
    height: 140,
    borderRadius: 1.5,
    mx: 'auto',
    mt: 1,
  },
  large: {
    width: 200,
    height: 200,
    borderRadius: 2,
    mx: 'auto',
    mt: 1,
  },
  'extra-large': {
    width: 280,
    height: 280,
    borderRadius: 2,
    mx: 'auto',
    mt: 1,
  },
  full: {
    width: '100%',
    height: 220,
  },
};

/**
 * Material 3 card container molecule composing header, media, content,
 * chips, action buttons ({@link MagicButton}), and footer slots.
 *
 * Supports `'outlined'` and `'raised'` appearances, configurable image
 * size presets (`'small'`..`'full'`), custom width sizing, and both
 * data-driven arrays (`actions`, `chips`) and custom React slots
 * (`headerSlot`, `mediaSlot`, `children`, `footerSlot`).
 */
export function MagicCard({
  id,
  testId,
  ariaLabel,
  title,
  subtitle,
  content,
  avatarSrc,
  avatarAlt = '',
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
  sx,
  className,
  ref,
}: MagicCardProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const hasDefaultHeader =
    !headerSlot && Boolean(title || subtitle || avatarSrc);
  const hasContent = Boolean(content) || Boolean(children);
  const showChips = variant === 'with-chips' || chips.length > 0;
  const showActions = variant === 'with-actions' || actions.length > 0;
  const showFooter = showChips || Boolean(footerSlot);

  const handleActionClick = (action: CardActionItem) => {
    if (!action.disabled) {
      onActionClick?.(action);
    }
  };

  const handleChipClick = (chip: ChipItem) => {
    if (!chip.disabled) {
      onChipSelect?.(chip);
    }
  };

  const surfaceColor =
    theme.palette.magic?.surface ?? theme.palette.background.paper;
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;

  return (
    <Card
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      variant={appearance === 'outlined' ? 'outlined' : 'elevation'}
      elevation={appearance === 'raised' ? 2 : 0}
      className={className}
      sx={[
        {
          width: width ?? '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          backgroundColor: surfaceColor,
          borderRadius: 3,
          ...(appearance === 'outlined'
            ? { borderColor: outlineColor }
            : { boxShadow: theme.shadows[2] }),
        },
        ...extraSx,
      ]}
    >
      {headerSlot ? (
        <Box
          data-testid={testId ? `${testId}-header-slot` : undefined}
          sx={{ px: 2, pt: 2 }}
        >
          {headerSlot}
        </Box>
      ) : null}

      {hasDefaultHeader ? (
        <CardHeader
          data-testid={testId ? `${testId}-header` : undefined}
          avatar={
            avatarSrc ? <Avatar src={avatarSrc} alt={avatarAlt} /> : undefined
          }
          title={
            title ? (
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            ) : undefined
          }
          subheader={
            subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : undefined
          }
        />
      ) : null}

      {mediaSlot ? (
        <Box data-testid={testId ? `${testId}-media-slot` : undefined}>
          {mediaSlot}
        </Box>
      ) : imageSrc ? (
        <CardMedia
          component="img"
          src={imageSrc}
          alt={imageAlt}
          data-testid={testId ? `${testId}-media` : undefined}
          data-image-size={imageSize}
          sx={{
            display: 'block',
            objectFit: 'cover',
            ...IMAGE_SIZE_STYLES[imageSize],
          }}
        />
      ) : null}

      {hasContent ? (
        <CardContent data-testid={testId ? `${testId}-content` : undefined}>
          {content ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ m: 0, mb: children ? 1.5 : 0 }}
            >
              {content}
            </Typography>
          ) : null}
          {children}
        </CardContent>
      ) : null}

      {showActions ? (
        <CardActions
          data-testid={testId ? `${testId}-actions` : undefined}
          sx={{
            px: 2,
            pb: showFooter ? 1 : 2,
            pt: 1,
            gap: 1,
            justifyContent:
              alignActions === 'end' ? 'flex-end' : 'flex-start',
          }}
        >
          {actions.map((action, index) => (
            <MagicButton
              key={action.id ?? `${action.label}-${index}`}
              id={action.id}
              testId={
                testId
                  ? `${testId}-action-${action.id ?? index}`
                  : undefined
              }
              label={action.label}
              variant={action.variant ?? 'text'}
              color={action.color ?? 'primary'}
              leadingIcon={action.icon}
              disabled={action.disabled ?? false}
              onClick={() => handleActionClick(action)}
            />
          ))}
        </CardActions>
      ) : null}

      {showFooter ? (
        <Box
          data-testid={testId ? `${testId}-footer` : undefined}
          sx={{ px: 2, pb: 2, pt: showActions ? 0.5 : 1 }}
        >
          {showChips && chips.length > 0 ? (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              data-testid={testId ? `${testId}-chips` : undefined}
              sx={{ flexWrap: 'wrap', mb: footerSlot ? 1.5 : 0 }}
            >
              {chips.map((chip, index) => {
                const isInteractive = Boolean(onChipSelect || chip.selectable);
                return (
                  <Chip
                    key={chip.id ?? `${chip.label}-${index}`}
                    id={chip.id}
                    data-testid={
                      testId
                        ? `${testId}-chip-${chip.id ?? index}`
                        : undefined
                    }
                    label={chip.label}
                    disabled={chip.disabled ?? false}
                    color={chip.selected ? 'primary' : 'default'}
                    variant={chip.selected ? 'filled' : 'outlined'}
                    avatar={
                      chip.avatarSrc ? (
                        <Avatar
                          src={chip.avatarSrc}
                          alt={chip.avatarAlt ?? chip.label}
                        />
                      ) : undefined
                    }
                    icon={
                      !chip.avatarSrc && chip.leadingIcon ? (
                        <MagicIcon icon={chip.leadingIcon} size="sm" />
                      ) : undefined
                    }
                    clickable={isInteractive}
                    onClick={
                      isInteractive ? () => handleChipClick(chip) : undefined
                    }
                  />
                );
              })}
            </Stack>
          ) : null}
          {footerSlot}
        </Box>
      ) : null}
    </Card>
  );
}
