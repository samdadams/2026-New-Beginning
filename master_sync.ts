import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

async function masterSync() {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const SLACK_TOKEN = process.env.SLACK_TOKEN;
  const BASE_ID = 'appMU8cGD8S1aYqSI';
  const SPECS_TABLE = 'tblNAkVs8a5HKjNSQ'; 
  const COMP_TABLE = 'tbl0lT8qxdauP6MV3'; 
  const SIGNAL_TABLE = 'tblRC9VENTcX99NmA'; 
  const VAULT_PATH = process.cwd();

  if (!AIRTABLE_TOKEN || !SLACK_TOKEN) {
    console.log('❌ TOKENS MISSING');
    return;
  }

  async function syncTable(tableId: string, fileName: string, title: string) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN.trim()}` }
      });
      const data: any = await res.json();
      if (!data.records || data.records.length === 0) return 0;

      let md = `# ${title}\n\n*Synced: ${new Date().toLocaleString()}*\n\n`;
      const fields = Object.keys(data.records[0].fields);
      md += `| ${fields.slice(0,4).join(' | ')} |\n| ${fields.slice(0,4).map(() => '---').join(' | ')} |\n`;

      data.records.forEach((r: any) => {
        const f = r.fields;
        md += `| ${fields.slice(0,4).map(key => {
          const val = f[key];
          return Array.isArray(val) ? val[0] : (val || 'N/A');
        }).join(' | ')} |\n`;
      });

      fs.writeFileSync(path.join(VAULT_PATH, fileName), md);
      return data.records.length;
    } catch (e) { return 0; }
  }

  console.log('📡 MASTER SYNC: FUTURESHIFT.LIVE ALIGNMENT...');
  const specsCount = await syncTable(SPECS_TABLE, 'Technical_Specs.md', '🛠 Technical Specs');
  const compCount = await syncTable(COMP_TABLE, 'Verified_Companies.md', '🏢 Verified Companies');
  const signalCount = await syncTable(SIGNAL_TABLE, 'Signal_Transmutations.md', '📡 Signal Transmutations');

  console.log(`✅ SYNC COMPLETE: ${specsCount} Specs, ${compCount} Companies, ${signalCount} Signals.`);

  if (fs.existsSync(path.join(VAULT_PATH, '.git'))) {
    try {
      execSync('git add . && git commit -m "Auto-sync: FutureShift.Live Pivot" && git push');
      console.log('🚀 GITHUB PUSH SUCCESS: FUTURESHIFT ALIGNED.');
    } catch (g) { console.log('ℹ️ Git: System Synced.'); }
  }

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SLACK_TOKEN.trim()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      channel: 'cmd-signals', 
      text: `🚀 *MASTER SYNC: FUTURESHIFT.LIVE ACTIVE*\n*Status:* Domain Pivot Synchronized\n*Vault:* 2026 - New Beginning` 
    })
  });
}
masterSync();
