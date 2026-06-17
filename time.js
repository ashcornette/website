const vanTime = document.getElementById("local-time");

function renderVancouverTime() {
  const t = new Date()
    .toLocaleTimeString("en-US", {
      timeZone: "America/Vancouver",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  if (vanTime.textContent !== t) vanTime.textContent = t;
}

if (vanTime) {
  renderVancouverTime();
  let timer = setInterval(renderVancouverTime, 30000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      renderVancouverTime();
      timer = setInterval(renderVancouverTime, 30000);
    }
  });
}
