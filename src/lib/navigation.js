export function moveTab(event, ids, current, select) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  if (!step) return;
  const next = ids[(ids.indexOf(current) + step + ids.length) % ids.length];
  select(next);
  document.getElementById(`tab-${next}`).focus();
}
