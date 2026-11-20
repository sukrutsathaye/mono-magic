import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ToolTipPosition } from '@mono-magic/atomic-design-interfaces';
import { MagicToolTipComponent } from './tool-tip.component';

@Component({
  imports: [MagicToolTipComponent],
  template: `
    <magic-tool-tip message="Projected tip">
      <button type="button">Hover me</button>
    </magic-tool-tip>
  `,
})
class ProjectionHostComponent {}

describe('MagicToolTipComponent', () => {
  let fixture: ComponentFixture<MagicToolTipComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const trigger = (): HTMLElement =>
    host().querySelector('.magic-tool-tip__trigger') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicToolTipComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicToolTipComponent);
    fixture.componentRef.setInput('message', 'Helpful details');
    fixture.componentRef.setInput('label', 'Info');
    fixture.detectChanges();
  });

  it('renders label fallback and opens/hides tooltip programmatically', async () => {
    expect(trigger().textContent?.trim()).toBe('Info');

    fixture.componentInstance.show(0);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.textContent).toContain('Helpful details');

    fixture.componentInstance.hide(0);
    fixture.detectChanges();
  });

  it('prefers projected trigger content over label fallback', () => {
    const pFixture = TestBed.createComponent(ProjectionHostComponent);
    pFixture.detectChanges();
    expect(pFixture.nativeElement.querySelector('button')?.textContent).toBe(
      'Hover me',
    );
  });

  it.each(['above', 'below', 'left', 'right', 'before', 'after'] as ToolTipPosition[])(
    'accepts position=%s',
    (position) => {
      setInputs({ position });
      expect(fixture.componentInstance.position()).toBe(position);
    },
  );

  it('does not show tooltip when disabled and forwards id/testId/ariaLabel', async () => {
    setInputs({
      id: 'help-tip',
      testId: 'help',
      ariaLabel: 'Help trigger',
      disabled: true,
      showDelay: 200,
      hideDelay: 100,
      touchGestures: 'off',
    });

    expect(host().getAttribute('id')).toBeNull();
    expect(trigger().id).toBe('help-tip');
    expect(trigger().getAttribute('data-testid')).toBe('help');
    expect(trigger().getAttribute('aria-label')).toBe('Help trigger');

    fixture.componentInstance.show(0);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.querySelector('.mat-mdc-tooltip')).toBeNull();
  });
});
