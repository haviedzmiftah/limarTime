(function() {
  // limarTime Timetable Embeddable Widget
  const scriptTag = document.currentScript;
  const containerId = scriptTag?.getAttribute("data-container") || "limartime-widget";
  const apiEndpoint = scriptTag?.getAttribute("data-endpoint") || "http://localhost:3000/api/graphql";
  const defaultClass = scriptTag?.getAttribute("data-class") || "7A";
  const defaultDay = scriptTag?.getAttribute("data-day") || "Senin";

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b; padding: 20px; max-width: 650px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 14px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: 700;">limarTime Widget</div>
          <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 2px;">Jadwal Belajar SMPN 1 Ngawi</div>
        </div>
        <div style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 9999px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.3);">
          ● Live API
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <select id="lt-class-select" style="background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; outline: none;">
          ${["7A","7B","7C","7D","7E","7F","7G","7H","7I","7J","8A","8B","8C","8D","8E","8F","8G","8H","8I","8J","9A","9B","9C","9D","9E","9F","9G","9H","9I","9J"]
            .map(c => `<option value="${c}" ${c === defaultClass ? 'selected' : ''}>Kelas ${c}</option>`).join("")}
        </select>

        <select id="lt-day-select" style="background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; outline: none;">
          ${["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
            .map(d => `<option value="${d}" ${d === defaultDay ? 'selected' : ''}>${d}</option>`).join("")}
        </select>
      </div>

      <div id="lt-schedule-body" style="font-size: 12px;">
        <div style="text-align: center; color: #94a3b8; padding: 20px;">Memuat jadwal terkini...</div>
      </div>
    </div>
  `;

  async function loadSchedule() {
    const classVal = (document.getElementById("lt-class-select")).value;
    const dayVal = (document.getElementById("lt-day-select")).value;
    const bodyEl = document.getElementById("lt-schedule-body");

    bodyEl.innerHTML = '<div style="text-align: center; color: #38bdf8; padding: 20px;">Memuat jadwal...</div>';

    const query = `
      query GetClassSchedule($className: String!, $day: String!) {
        schedule(className: $className, day: $day) {
          period
          timeRange
          isBreak
          subjectName
          subjectCode
          teacherName
          teacherCode
          room
        }
      }
    `;

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { className: classVal, day: dayVal } }),
      });
      const { data } = await res.json();

      if (!data || !data.schedule || data.schedule.length === 0) {
        bodyEl.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">Jadwal tidak tersedia.</div>';
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 6px;">';
      data.schedule.forEach(slot => {
        if (slot.isBreak) {
          html += `
            <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 6px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #fbbf24;">${slot.subjectName}</span>
              <span style="color: #94a3b8; font-family: monospace; font-size: 11px;">${slot.timeRange}</span>
            </div>
          `;
        } else {
          html += `
            <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 700; color: #fff;">${slot.subjectName}</span>
                <span style="color: #64748b; font-size: 11px; margin-left: 6px;">• ${slot.teacherName} (${slot.teacherCode})</span>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 700; color: #38bdf8; font-size: 11px;">JP ${slot.period}</div>
                <div style="color: #94a3b8; font-family: monospace; font-size: 10px;">${slot.timeRange}</div>
              </div>
            </div>
          `;
        }
      });
      html += '</div>';
      bodyEl.innerHTML = html;
    } catch (e) {
      bodyEl.innerHTML = '<div style="text-align: center; color: #f43f5e; padding: 20px;">Gagal memuat API jadwal.</div>';
    }
  }

  document.getElementById("lt-class-select").addEventListener("change", loadSchedule);
  document.getElementById("lt-day-select").addEventListener("change", loadSchedule);

  loadSchedule();
})();
