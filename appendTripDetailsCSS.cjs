const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'TripDetails.css');

const extraCss = `
/* Missing Trip Details CSS */
.td-itinerary-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.td-itin-time {
  width: 48px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
  padding-top: 4px;
}
.td-itin-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
}
.td-itin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--color-primary);
  margin-top: 6px;
}
.td-itin-connector {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 4px;
  min-height: 40px;
}
.td-itin-card {
  flex: 1;
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.td-itin-card-img {
  width: 100px;
  position: relative;
}
.td-itin-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.td-itin-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.td-itin-card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.td-itin-card-body h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}
.td-itin-dur {
  font-size: 13px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: auto;
}
.td-itin-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.td-day-group {
  margin-bottom: 32px;
}
.td-day-header h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.td-discover-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.td-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 8px;
}
.td-search-box input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
}
.td-filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.td-chip {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 13px;
  cursor: pointer;
}
.td-chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.td-activities-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.td-add-stop-panel {
  background: var(--color-surface-alt);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid var(--color-border);
}
.td-add-stop-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.td-add-stop-search input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
}
.td-city-results {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.td-city-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}
.td-city-result:hover {
  background: var(--color-surface);
}
.td-city-result-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
}
.td-city-result-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.td-city-name {
  font-weight: 600;
  font-size: 14px;
}
.td-city-country {
  font-size: 12px;
  color: var(--color-text-muted);
}
.td-add-stop-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.td-add-stop-sel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  padding: 12px;
  border-radius: 8px;
}
.td-add-stop-dates {
  display: flex;
  gap: 12px;
}
.td-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.td-date-input {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
}
.td-btn-ghost {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
}
.td-btn-icon {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.td-btn-icon.danger {
  color: var(--color-danger);
  border-color: rgba(220,38,38,0.2);
}
.td-btn-icon.danger:hover {
  background: rgba(220,38,38,0.1);
}

.td-stop-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
}
.td-stop-card.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}
.td-stop-card-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.td-stop-card-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}
.td-stop-actions {
  display: flex;
  gap: 4px;
}
.td-stop-card-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}
.td-stop-card-info p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.td-act-card {
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}
.td-act-card:hover {
  border-color: var(--color-primary);
}
.td-act-card-img {
  width: 100px;
  position: relative;
}
.td-act-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.td-act-card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.td-act-card-body {
  padding: 12px;
  flex: 1;
}
.td-act-card-body h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
}
.td-act-card-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
`;

fs.appendFileSync(cssPath, extraCss);
console.log('Appended missing structural CSS.');
