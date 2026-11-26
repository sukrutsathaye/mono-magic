import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';
import { uiPageGraphPb, uiTokensPb } from '../../proto.js';

describe('Generated UI Protobuf contracts (@mono-magic/atomic-design-interfaces/proto)', () => {
  it('round-trips PageGraphDocument with navigation edges and UI tokens', () => {
    const doc = create(uiPageGraphPb.PageGraphDocumentSchema, {
      id: 'app-graph-1',
      appName: 'Quanti-Fit Studio',
      schemaVersion: '1.0.0',
      targetFramework: uiTokensPb.UiFramework.REACT_MUI,
      designSystem: uiTokensPb.DesignSystem.MATERIAL_3,
      entryPageId: 'page-home',
      pages: [
        create(uiPageGraphPb.PageNodeSchema, {
          id: 'page-home',
          title: 'Home',
          routePath: '/',
          templateName: 'MagicAppShellTemplate',
          components: [
            create(uiPageGraphPb.ComponentNodeSchema, {
              id: 'btn-join',
              componentName: 'MagicButton',
              tier: uiPageGraphPb.AtomicTier.ATOM,
              propsJson: { label: '"Join Session"' },
            }),
          ],
        }),
      ],
      navigationEdges: [
        create(uiPageGraphPb.NavigationEdgeSchema, {
          id: 'edge-1',
          sourcePageId: 'page-home',
          targetPageId: 'page-live',
          triggerRef: 'btn-join:onClick',
        }),
      ],
    });

    const binary = toBinary(uiPageGraphPb.PageGraphDocumentSchema, doc);
    const decoded = fromBinary(uiPageGraphPb.PageGraphDocumentSchema, binary);
    expect(decoded.targetFramework).toBe(uiTokensPb.UiFramework.REACT_MUI);
    expect(decoded.pages).toHaveLength(1);
    expect(decoded.navigationEdges[0]?.triggerRef).toBe('btn-join:onClick');

    const json = toJson(uiPageGraphPb.PageGraphDocumentSchema, doc);
    const fromJsonDoc = fromJson(uiPageGraphPb.PageGraphDocumentSchema, json);
    expect(fromJsonDoc.appName).toBe('Quanti-Fit Studio');
  });
});
