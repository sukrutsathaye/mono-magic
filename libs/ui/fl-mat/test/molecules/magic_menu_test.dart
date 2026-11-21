import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('MagicMenu', () {
    testWidgets(
      'opens menu via standard button trigger, renders recursive submenus, and emits onItemSelect/onMenuOpen/onMenuClose',
      (tester) async {
        MenuItemData? selectedItem;
        var opened = false;
        var closed = false;

        await tester.pumpWidget(
          wrap(
            MagicMenu(
              testId: 'actions-menu',
              triggerLabel: 'Actions',
              triggerIcon: 'more_vert',
              triggerType: MenuTriggerType.button,
              color: ColorIntent.secondary,
              size: AtomicSize.sm,
              items: const [
                MenuItemData(
                  id: 'edit',
                  label: 'Edit',
                  iconName: 'edit',
                ),
                MenuItemData(
                  id: 'disabled-item',
                  label: 'Archive',
                  disabled: true,
                ),
                MenuItemData(
                  id: 'export',
                  label: 'Export',
                  iconName: 'download',
                  children: [
                    MenuItemData(id: 'pdf', label: 'Export PDF'),
                    MenuItemData(id: 'csv', label: 'Export CSV'),
                  ],
                ),
              ],
              onItemSelect: (item) => selectedItem = item,
              onMenuOpen: () => opened = true,
              onMenuClose: () => closed = true,
            ),
          ),
        );

        expect(find.text('Actions'), findsOneWidget);

        await tester.tap(
          find.byKey(const ValueKey<String>('actions-menu-trigger')),
        );
        await tester.pumpAndSettle();
        expect(opened, isTrue);
        expect(find.text('Edit'), findsOneWidget);
        expect(find.text('Archive'), findsOneWidget);
        expect(find.text('Export'), findsOneWidget);

        // Disabled item does not fire onItemSelect
        await tester.tap(find.text('Archive'));
        await tester.pumpAndSettle();
        expect(selectedItem, isNull);

        // Selecting enabled item emits callback and closes menu
        await tester.tap(find.text('Edit'));
        await tester.pumpAndSettle();
        expect(selectedItem?.id, 'edit');
        expect(closed, isTrue);

        // Reopen and test nested SubmenuButton
        await tester.tap(
          find.byKey(const ValueKey<String>('actions-menu-trigger')),
        );
        await tester.pumpAndSettle();
        expect(find.byType(SubmenuButton), findsOneWidget);
        await tester.tap(find.text('Export'));
        await tester.pumpAndSettle();
        expect(find.text('Export PDF'), findsOneWidget);
        await tester.tap(find.text('Export PDF'));
        await tester.pumpAndSettle();
        expect(selectedItem?.id, 'pdf');
      },
    );

    testWidgets(
      'supports icon triggerType, xPosition/yPosition/overlapTrigger/hasBackdrop, and disabled state',
      (tester) async {
        var opened = false;

        await tester.pumpWidget(
          wrap(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicMenu(
                  testId: 'icon-menu',
                  triggerType: MenuTriggerType.icon,
                  triggerIcon: 'settings',
                  xPosition: MenuPositionX.before,
                  yPosition: MenuPositionY.above,
                  overlapTrigger: true,
                  hasBackdrop: false,
                  items: const [MenuItemData(label: 'Preferences')],
                  onMenuOpen: () => opened = true,
                ),
                MagicMenu(
                  testId: 'disabled-menu',
                  disabled: true,
                  items: const [MenuItemData(label: 'Hidden')],
                ),
              ],
            ),
          ),
        );

        final menuAnchor = tester.widget<MenuAnchor>(
          find.descendant(
            of: find.byKey(const ValueKey<String>('icon-menu')),
            matching: find.byType(MenuAnchor),
          ),
        );
        expect(menuAnchor.consumeOutsideTap, isFalse);

        await tester.tap(
          find.byKey(const ValueKey<String>('icon-menu-trigger')),
        );
        await tester.pumpAndSettle();
        expect(opened, isTrue);
        expect(find.text('Preferences'), findsOneWidget);

        // Tap menu item to close the overlapping menu
        await tester.tap(find.text('Preferences'));
        await tester.pumpAndSettle();

        // Disabled trigger does not open
        await tester.tap(
          find.byKey(const ValueKey<String>('disabled-menu-trigger')),
        );
        await tester.pumpAndSettle();
        expect(find.text('Hidden'), findsNothing);
      },
    );
  });
}
