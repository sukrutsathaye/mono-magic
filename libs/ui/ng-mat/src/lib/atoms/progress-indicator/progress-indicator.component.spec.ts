import { ComponentFixture, TestBed } from '@angular/core/testing';
import type {
  AtomicSize,
  ColorIntent,
  ProgressIndicatorMode,
} from '@mono-magic/atomic-design-interfaces';
import { MagicProgressIndicatorComponent } from './progress-indicator.component';

describe('MagicProgressIndicatorComponent', () => {
  let fixture: ComponentFixture<MagicProgressIndicatorComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicProgressIndicatorComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicProgressIndicatorComponent);
    fixture.detectChanges();
  });

  it('renders an indeterminate progress bar by default', () => {
    const bar = host().querySelector('mat-progress-bar') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('mode')).toBe('indeterminate');
    expect(host().querySelector('mat-progress-spinner')).toBeNull();
  });

  it('preserves exact zero value in determinate mode', () => {
    setInputs({ type: 'bar', mode: 'determinate', value: 0 });
    const bar = host().querySelector('mat-progress-bar') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('0');

    setInputs({ value: 65 });
    expect(bar.getAttribute('aria-valuenow')).toBe('65');
  });

  it.each(['determinate', 'indeterminate', 'buffer', 'query'] as ProgressIndicatorMode[])(
    'supports bar mode=%s',
    (mode) => {
      setInputs({ type: 'bar', mode, value: 40, bufferValue: 70 });
      expect(
        host().querySelector('mat-progress-bar')?.getAttribute('mode'),
      ).toBe(mode);
    },
  );

  it('renders spinner with size-derived and explicit diameter/strokeWidth', () => {
    setInputs({ type: 'spinner', mode: 'determinate', value: 0, size: 'lg' });
    const spinner = host().querySelector('mat-progress-spinner') as HTMLElement;
    expect(spinner).toBeTruthy();
    expect(host().classList).toContain('magic-progress-indicator--spinner');
    expect(spinner.style.width).toBe('56px');
    expect(spinner.getAttribute('aria-valuenow')).toBe('0');

    setInputs({ diameter: 96, strokeWidth: 8 });
    expect(spinner.style.width).toBe('96px');
  });

  it('forwards id, testId and ariaLabel and removes host id', () => {
    setInputs({
      id: 'upload-prog',
      testId: 'upload',
      ariaLabel: 'Upload progress',
    });
    const bar = host().querySelector('mat-progress-bar') as HTMLElement;
    expect(host().getAttribute('id')).toBeNull();
    expect(bar.id).toBe('upload-prog');
    expect(bar.getAttribute('data-testid')).toBe('upload');
    expect(bar.getAttribute('aria-label')).toBe('Upload progress');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
    'applies magic-size-%s class',
    (size) => {
      setInputs({ size });
      expect(host().classList).toContain(`magic-size-${size}`);
    },
  );

  it.each([
    'primary',
    'secondary',
    'tertiary',
    'success',
    'warning',
    'error',
    'neutral',
  ] as ColorIntent[])('applies magic-color-%s class', (color) => {
    setInputs({ color });
    expect(host().classList).toContain(`magic-color-${color}`);
  });
});
