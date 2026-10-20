const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'InteractiveMap', 'InteractiveMap.css');
const appendData = `

/* Tabs */
.imap-sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}
.imap-tab {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
}
.imap-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

/* Overview */
.imap-overview-card {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-alt);
}
.imap-overview-card h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-primary);
}
.imap-overview-grid {
  display: flex;
  gap: 16px;
}
.imap-og-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.imap-og-icon {
  color: var(--color-accent);
  margin-top: 2px;
}
.imap-og-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.imap-og-item span {
  font-size: 11px;
  color: var(--color-text-muted);
}
.imap-og-item strong {
  font-size: 13px;
  color: var(--color-text-primary);
}
`;

fs.appendFileSync(filePath, appendData);
console.log('Successfully appended CSS');
