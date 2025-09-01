export async function getCurrentActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  if (!tab.url) return;
  if (!URL.canParse(tab.url)) return;

  return {
    ...tab,
    url: new URL(tab.url),
  };
}
