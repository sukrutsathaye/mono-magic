<script lang="ts">
  import MagicSlider from './MagicSlider.svelte';

  let volume = $state(65);
  let startPrice = $state(25);
  let endPrice = $state(75);
</script>

<div class="flex max-w-md flex-col gap-6 p-4">
  <div class="flex flex-col gap-2">
    <span class="text-xs font-medium text-slate-700" data-testid="slider-volume-status">
      Volume: {volume}%
    </span>
    <MagicSlider
      bind:value={volume}
      testId="volume-slider"
      min={0}
      max={100}
      step={5}
      discrete
      showTickMarks
      displayWith={(v) => `${v}%`}
      color="primary"
    />
  </div>

  <div class="flex flex-col gap-2">
    <span class="text-xs font-medium text-slate-700" data-testid="slider-price-status">
      Price Range: ${startPrice} – ${endPrice}
    </span>
    <MagicSlider
      range
      bind:startValue={startPrice}
      bind:endValue={endPrice}
      testId="price-slider"
      min={0}
      max={100}
      step={5}
      discrete
      displayWith={(v) => `$${v}`}
      color="secondary"
    />
  </div>
</div>
