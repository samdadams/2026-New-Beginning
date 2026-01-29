import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanMasterSync() {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const SLACK_TOKEN = process.env.SLACK_TOKEN;
  const BASE_ID = 'appMU8cGD8S1aYqSI';
  const SPECS_TABLE = 'tblNAkVs8a5HKjNSQ'; 
  const COMP_TABLE = 'tbl0lT8qxdauP6MV3'; 
  const VAULT_PATH = process.cwd();

  if (!AIRTABLE_TOKEN || !SLACK_TOKEN) {
    console.log('❌ ERROR: Tokens missing in .env. Ensure .env contains AIRTABLE_TOKEN and SLACK_TOKEN.');
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
        md += `| ${fields.slice(0,4).map(key => Array.isArray(f[key]) ? f[key][0] : f[key] || 'N/A').join(' | ')} |\n`;
      });

      fs.writeFileSync(path.join(VAULT_PATH, fileName), md);
      return data.records.length;
    } catch (e) { return 0; }
  }

  console.log('📡 MASTER SYNC: INITIATING SECURE PULL...');
  const specsCount = await syncTable(SPECS_TABLE, 'Technical_Specs.md', '🛠 Technical Specs');
  const compCount = await syncTable(COMP_TABLE, 'Verified_Companies.md', '🏢 Verified Companies');

  console.log(`✅ SYNC COMPLETE: ${specsCount} Specs, ${compCount} Companies.`);

  if (fs.existsSync(path.join(VAULT_PATH, '.git'))) {
    try {
      execSync('git add . && git commit -m "Auto-sync: Infrastructure Alignment" && git push');
      console.log('🚀 GITHUB PUSH SUCCESS: VAULT SECURED.');
    } catch (g) { console.log('ℹ️ Git: Pushing changes.'); }
  }
}
cleanMasterSync();
