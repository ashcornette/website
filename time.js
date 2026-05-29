const vanTime = document.getElementById("local-time");

function renderVancouverTime() {
  const t = new Date()
    .toLocaleTimeString("en-US", {
      timeZone: "America/Vancouver",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();                          // "11:42 pm" — matches your lowercase voice
  if (vanTime.textContent !== t) vanTime.textContent = t;
}

if (vanTime) {
  renderVancouverTime();
  setInterval(renderVancouverTime, 1000);
}