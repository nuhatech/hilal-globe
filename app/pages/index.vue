<template>
  <div class="relative h-full w-full">
    <AppHeader />
    <DateSelector />

    <!-- Bottom controls bar -->
    <div class="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between pointer-events-none">
      <!-- Left: dropdowns — stack vertically on mobile, horizontal on sm+ -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end pointer-events-auto">
        <CriterionSelector />
        <BornCrescentToggle />
      </div>

      <!-- Right: legend -->
      <div class="pointer-events-auto">
        <ZoneLegend />
      </div>
    </div>

    <GlobeCanvas />
    <LocationDetailPanel />
    <LoadingOverlay />
  </div>
</template>
