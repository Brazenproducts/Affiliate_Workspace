#!/usr/bin/env node
// Microsoft Ads API - Check campaign performance with revenue
const https = require('https');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync(__dirname + '/../.microsoft-ads-credentials.json', 'utf8'));

// Step 1: Refresh access token
function refreshToken() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: creds.azure_client_id,
      client_secret: creds.azure_client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage offline_access'
    });
    const body = params.toString();
    const req = https.request({
      hostname: 'login.microsoftonline.com',
      path: `/${creds.azure_tenant_id}/oauth2/v2.0/token`,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        if (j.access_token) {
          // Save new tokens
          creds.access_token = j.access_token;
          if (j.refresh_token) creds.refresh_token = j.refresh_token;
          creds.token_expiry = new Date(Date.now() + j.expires_in * 1000).toISOString();
          fs.writeFileSync(__dirname + '/../.microsoft-ads-credentials.json', JSON.stringify(creds, null, 2));
          resolve(j.access_token);
        } else {
          reject(new Error('Token refresh failed: ' + d));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Step 2: SOAP request for campaign performance report
function getCampaignPerformance(token) {
  // Use Reporting API to get campaign performance with revenue
  const today = new Date();
  const thirtyAgo = new Date(today - 30 * 86400000);
  const fmt = d => d.toISOString().split('T')[0];

  // Use the simpler Bulk Service or just query campaigns via Campaign Management
  // Actually, let's use the REST-like Reporting API v13
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header>
    <h:AuthenticationToken xmlns:h="https://bingads.microsoft.com/Reporting/v13" xmlns="https://bingads.microsoft.com/Reporting/v13">${token}</h:AuthenticationToken>
    <h:CustomerAccountId xmlns:h="https://bingads.microsoft.com/Reporting/v13" xmlns="https://bingads.microsoft.com/Reporting/v13">${creds.account_id}</h:CustomerAccountId>
    <h:CustomerId xmlns:h="https://bingads.microsoft.com/Reporting/v13" xmlns="https://bingads.microsoft.com/Reporting/v13">${creds.customer_id}</h:CustomerId>
    <h:DeveloperToken xmlns:h="https://bingads.microsoft.com/Reporting/v13" xmlns="https://bingads.microsoft.com/Reporting/v13">${creds.developer_token}</h:DeveloperToken>
  </s:Header>
  <s:Body>
    <SubmitGenerateReportRequest xmlns="https://bingads.microsoft.com/Reporting/v13">
      <ReportRequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance" i:type="CampaignPerformanceReportRequest">
        <ExcludeColumnHeaders>false</ExcludeColumnHeaders>
        <ExcludeReportFooter>true</ExcludeReportFooter>
        <ExcludeReportHeader>true</ExcludeReportHeader>
        <Format>Csv</Format>
        <ReturnOnlyCompleteData>false</ReturnOnlyCompleteData>
        <Aggregation>Summary</Aggregation>
        <Columns>
          <CampaignPerformanceReportColumn>CampaignName</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>CampaignStatus</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>Impressions</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>Clicks</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>Spend</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>Conversions</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>Revenue</CampaignPerformanceReportColumn>
          <CampaignPerformanceReportColumn>ReturnOnAdSpend</CampaignPerformanceReportColumn>
        </Columns>
        <Scope>
          <AccountIds xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
            <a:long>${creds.account_id}</a:long>
          </AccountIds>
        </Scope>
        <Time>
          <CustomDateRangeEnd>
            <Day>${today.getUTCDate()}</Day>
            <Month>${today.getUTCMonth() + 1}</Month>
            <Year>${today.getUTCFullYear()}</Year>
          </CustomDateRangeEnd>
          <CustomDateRangeStart>
            <Day>${thirtyAgo.getUTCDate()}</Day>
            <Month>${thirtyAgo.getUTCMonth() + 1}</Month>
            <Year>${thirtyAgo.getUTCFullYear()}</Year>
          </CustomDateRangeStart>
        </Time>
      </ReportRequest>
    </SubmitGenerateReportRequest>
  </s:Body>
</s:Envelope>`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'reporting.api.bingads.microsoft.com',
      path: '/Api/Advertiser/Reporting/v13/ReportingService.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'SubmitGenerateReport'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(soapBody);
    req.end();
  });
}

// Step 3: Poll for report completion
function pollReport(token, reportId) {
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header>
    <h:AuthenticationToken xmlns:h="https://bingads.microsoft.com/Reporting/v13">${token}</h:AuthenticationToken>
    <h:CustomerAccountId xmlns:h="https://bingads.microsoft.com/Reporting/v13">${creds.account_id}</h:CustomerAccountId>
    <h:CustomerId xmlns:h="https://bingads.microsoft.com/Reporting/v13">${creds.customer_id}</h:CustomerId>
    <h:DeveloperToken xmlns:h="https://bingads.microsoft.com/Reporting/v13">${creds.developer_token}</h:DeveloperToken>
  </s:Header>
  <s:Body>
    <PollGenerateReportRequest xmlns="https://bingads.microsoft.com/Reporting/v13">
      <ReportRequestId>${reportId}</ReportRequestId>
    </PollGenerateReportRequest>
  </s:Body>
</s:Envelope>`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'reporting.api.bingads.microsoft.com',
      path: '/Api/Advertiser/Reporting/v13/ReportingService.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'PollGenerateReport'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(soapBody);
    req.end();
  });
}

// Download report
function downloadReport(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return https.get(res.headers.location, r2 => {
          let chunks = []; r2.on('data', c => chunks.push(c));
          r2.on('end', () => resolve(Buffer.concat(chunks)));
        });
      }
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Refreshing MS Ads token...');
  const token = await refreshToken();
  console.log('Token refreshed ✅ expires:', creds.token_expiry);

  console.log('Submitting report request...');
  const submitResp = await getCampaignPerformance(token);

  // Extract ReportRequestId
  const idMatch = submitResp.match(/<ReportRequestId>([^<]+)<\/ReportRequestId>/);
  if (!idMatch) {
    console.error('Failed to submit report:', submitResp.substring(0, 500));
    return;
  }
  const reportId = idMatch[1];
  console.log('Report ID:', reportId);

  // Poll until ready (max 30s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const pollResp = await pollReport(token, reportId);
    const statusMatch = pollResp.match(/<Status>([^<]+)<\/Status>/);
    const urlMatch = pollResp.match(/<ReportDownloadUrl>([^<]+)<\/ReportDownloadUrl>/);
    console.log('Poll', i + 1, '- Status:', statusMatch?.[1]);

    if (statusMatch?.[1] === 'Success' && urlMatch) {
      const downloadUrl = urlMatch[1].replace(/&amp;/g, '&');
      console.log('Downloading report...');
      const data = await downloadReport(downloadUrl);
      // It's a zip file, extract with zlib
      const zlib = require('zlib');
      try {
        // Try as gzip first
        const csv = zlib.gunzipSync(data).toString();
        console.log('\n=== CAMPAIGN PERFORMANCE (30 days) ===');
        console.log(csv);
      } catch {
        // Try as zip
        const AdmZip = require('adm-zip');
        // Fallback: write to file and use unzip
        const tmpFile = '/tmp/msads-report.zip';
        fs.writeFileSync(tmpFile, data);
        const { execSync } = require('child_process');
        const csv = execSync(`cd /tmp && unzip -o -p ${tmpFile}`).toString();
        console.log('\n=== CAMPAIGN PERFORMANCE (30 days) ===');
        console.log(csv);
      }
      return;
    } else if (statusMatch?.[1] === 'Error') {
      console.error('Report error:', pollResp.substring(0, 500));
      return;
    }
  }
  console.log('Report timed out');
}

main().catch(e => console.error('Error:', e.message));
