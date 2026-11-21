/// Tree-shake-safe Material icon resolver supporting native [IconData],
/// snake_case/kebab-case Material icon string names, and custom [Widget] nodes.
library;

import 'package:flutter/material.dart';

/// Constant map of common Material icon names to compile-time `Icons.*`
/// constants.
///
/// Using constant [IconData] references guarantees compatibility with
/// `flutter build web --release --tree-shake-icons`.
const Map<String, IconData> magicIconMap = <String, IconData>{
  'account_circle': Icons.account_circle,
  'add': Icons.add,
  'add_circle': Icons.add_circle,
  'add_circle_outline': Icons.add_circle_outline,
  'apps': Icons.apps,
  'arrow_back': Icons.arrow_back,
  'arrow_downward': Icons.arrow_downward,
  'arrow_drop_down': Icons.arrow_drop_down,
  'arrow_drop_up': Icons.arrow_drop_up,
  'arrow_forward': Icons.arrow_forward,
  'arrow_upward': Icons.arrow_upward,
  'attach_file': Icons.attach_file,
  'auto_awesome': Icons.auto_awesome,
  'bolt': Icons.bolt,
  'bookmark': Icons.bookmark,
  'bookmark_border': Icons.bookmark_border,
  'build': Icons.build,
  'calendar_today': Icons.calendar_today,
  'call': Icons.call,
  'camera_alt': Icons.camera_alt,
  'cancel': Icons.cancel,
  'chat': Icons.chat,
  'check': Icons.check,
  'check_box': Icons.check_box,
  'check_circle': Icons.check_circle,
  'chevron_left': Icons.chevron_left,
  'chevron_right': Icons.chevron_right,
  'clear': Icons.clear,
  'close': Icons.close,
  'cloud': Icons.cloud,
  'cloud_download': Icons.cloud_download,
  'cloud_upload': Icons.cloud_upload,
  'code': Icons.code,
  'content_copy': Icons.content_copy,
  'content_cut': Icons.content_cut,
  'content_paste': Icons.content_paste,
  'copy': Icons.content_copy,
  'dark_mode': Icons.dark_mode,
  'dashboard': Icons.dashboard,
  'delete': Icons.delete,
  'delete_outline': Icons.delete_outline,
  'description': Icons.description,
  'done': Icons.done,
  'download': Icons.download,
  'drag_indicator': Icons.drag_indicator,
  'edit': Icons.edit,
  'email': Icons.email,
  'error': Icons.error,
  'error_outline': Icons.error_outline,
  'event': Icons.event,
  'expand_less': Icons.expand_less,
  'expand_more': Icons.expand_more,
  'favorite': Icons.favorite,
  'favorite_border': Icons.favorite_border,
  'file_copy': Icons.file_copy,
  'filter_list': Icons.filter_list,
  'flag': Icons.flag,
  'folder': Icons.folder,
  'folder_open': Icons.folder_open,
  'format_align_center': Icons.format_align_center,
  'format_align_justify': Icons.format_align_justify,
  'format_align_left': Icons.format_align_left,
  'format_align_right': Icons.format_align_right,
  'format_bold': Icons.format_bold,
  'format_italic': Icons.format_italic,
  'format_underlined': Icons.format_underlined,
  'grid_view': Icons.grid_view,
  'group': Icons.group,
  'help': Icons.help,
  'help_outline': Icons.help_outline,
  'history': Icons.history,
  'home': Icons.home,
  'image': Icons.image,
  'info': Icons.info,
  'info_outline': Icons.info_outline,
  'key': Icons.key,
  'label': Icons.label,
  'language': Icons.language,
  'launch': Icons.launch,
  'layers': Icons.layers,
  'light_mode': Icons.light_mode,
  'link': Icons.link,
  'list': Icons.list,
  'local_offer': Icons.local_offer,
  'location_on': Icons.location_on,
  'lock': Icons.lock,
  'lock_open': Icons.lock_open,
  'login': Icons.login,
  'logout': Icons.logout,
  'mail': Icons.mail,
  'mail_outline': Icons.mail_outline,
  'menu': Icons.menu,
  'more_horiz': Icons.more_horiz,
  'more_vert': Icons.more_vert,
  'notifications': Icons.notifications,
  'notifications_active': Icons.notifications_active,
  'notifications_none': Icons.notifications_none,
  'open_in_new': Icons.open_in_new,
  'palette': Icons.palette,
  'pause': Icons.pause,
  'person': Icons.person,
  'person_outline': Icons.person_outline,
  'phone': Icons.phone,
  'photo': Icons.photo,
  'play_arrow': Icons.play_arrow,
  'print': Icons.print,
  'public': Icons.public,
  'push_pin': Icons.push_pin,
  'refresh': Icons.refresh,
  'remove': Icons.remove,
  'save': Icons.save,
  'schedule': Icons.schedule,
  'search': Icons.search,
  'security': Icons.security,
  'send': Icons.send,
  'settings': Icons.settings,
  'share': Icons.share,
  'shopping_bag': Icons.shopping_bag,
  'shopping_cart': Icons.shopping_cart,
  'sort': Icons.sort,
  'star': Icons.star,
  'star_border': Icons.star_border,
  'stop': Icons.stop,
  'sync': Icons.sync,
  'tag': Icons.tag,
  'thumb_down': Icons.thumb_down,
  'thumb_up': Icons.thumb_up,
  'tune': Icons.tune,
  'undo': Icons.undo,
  'upload': Icons.upload,
  'verified': Icons.verified,
  'view_list': Icons.view_list,
  'view_module': Icons.view_module,
  'visibility': Icons.visibility,
  'visibility_off': Icons.visibility_off,
  'warning': Icons.warning,
  'warning_amber': Icons.warning_amber,
  'work': Icons.work,
};

/// Resolves a native [IconData] or Material icon string [iconName] into a
/// compile-time constant [IconData].
///
/// String names are normalized by trimming whitespace, converting to lowercase,
/// and replacing hyphens and spaces with underscores. Returns `null` when
/// neither [icon] nor a recognized [iconName] is provided.
IconData? resolveMagicIconData({IconData? icon, String? iconName}) {
  if (icon != null) {
    return icon;
  }
  if (iconName == null) {
    return null;
  }
  final normalized = iconName
      .trim()
      .toLowerCase()
      .replaceAll('-', '_')
      .replaceAll(' ', '_');
  if (normalized.isEmpty) {
    return null;
  }
  return magicIconMap[normalized];
}

/// Ergonomic Material icon widget supporting native [IconData], Material icon
/// string names ([iconName]), and arbitrary [customIcon] widgets.
class MagicIcon extends StatelessWidget {
  /// Creates a [MagicIcon].
  ///
  /// Resolution priority is: [customIcon] → [icon] → [iconName] → [fallbackIcon].
  const MagicIcon({
    super.key,
    this.icon,
    this.iconName,
    this.customIcon,
    this.fallbackIcon,
    this.size,
    this.color,
    this.semanticLabel,
  });

  /// Native Material [IconData] to render.
  final IconData? icon;

  /// Snake_case or kebab-case Material icon name resolved via [magicIconMap].
  final String? iconName;

  /// Custom icon widget overriding [icon] and [iconName].
  final Widget? customIcon;

  /// Fallback [IconData] rendered when [icon] and [iconName] cannot be resolved.
  final IconData? fallbackIcon;

  /// Icon dimension in logical pixels.
  final double? size;

  /// Optional foreground tint applied to the icon.
  final Color? color;

  /// Accessible label announced by screen readers.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    if (customIcon != null) {
      final themed = IconTheme.merge(
        data: IconThemeData(size: size, color: color),
        child: customIcon!,
      );
      if (semanticLabel != null) {
        return Semantics(label: semanticLabel, child: themed);
      }
      return themed;
    }

    final resolved =
        resolveMagicIconData(icon: icon, iconName: iconName) ?? fallbackIcon;
    if (resolved == null) {
      return const SizedBox.shrink();
    }

    return Icon(
      resolved,
      size: size,
      color: color,
      semanticLabel: semanticLabel,
    );
  }
}
