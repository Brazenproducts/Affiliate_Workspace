#!/usr/bin/env python3
"""Shopping ROAS Emergency Monitor — checks yesterday's Shopping campaign metrics."""

import json
import sys
from datetime import date, timedelta

CREDENTIALS_FILE = "/home/ubuntu/.openclaw/workspace/.google-ads-credentials.json"
CUSTOMER_ID = "1770651698"
DAILY_BUDGET = 250.0
ROAS_ALERT_THRESHOLD = 2.0

def get_client():
    from google.ads.googleads.client import GoogleAdsClient

    with open(CREDENTIALS_FILE) as f:
        creds = json.load(f)

    config = {
        "developer_token": creds["dev_token"],
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"],
        "refresh_token": creds["refresh_token"],
        "use_proto_plus": True,
        "login_customer_id": CUSTOMER_ID,
    }
    return GoogleAdsClient.load_from_dict(config)


def main():
    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"Checking Shopping campaigns for: {yesterday}")

    try:
        client = get_client()
    except Exception as e:
        print(f"ERROR: Failed to create client: {e}")
        sys.exit(1)

    ga_service = client.get_service("GoogleAdsService")

    query = f"""
        SELECT
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            metrics.cost_micros,
            metrics.conversions_value,
            metrics.clicks,
            metrics.impressions,
            metrics.conversions
        FROM campaign
        WHERE segments.date = '{yesterday}'
          AND campaign.advertising_channel_type = 'SHOPPING'
          AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)
        campaigns = []
        for batch in response:
            for row in batch.results:
                cost = row.metrics.cost_micros / 1_000_000
                conv_value = row.metrics.conversions_value
                roas = conv_value / cost if cost > 0 else 0
                campaigns.append({
                    "name": row.campaign.name,
                    "status": row.campaign.status.name,
                    "cost": cost,
                    "conv_value": conv_value,
                    "roas": roas,
                    "clicks": row.metrics.clicks,
                    "impressions": row.metrics.impressions,
                    "conversions": row.metrics.conversions,
                })
    except Exception as e:
        print(f"ERROR querying API: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    if not campaigns:
        print(f"NO_DATA: No Shopping campaigns found for {yesterday}")
        sys.exit(0)

    # Aggregate totals
    total_cost = sum(c["cost"] for c in campaigns)
    total_value = sum(c["conv_value"] for c in campaigns)
    total_clicks = sum(c["clicks"] for c in campaigns)
    total_impressions = sum(c["impressions"] for c in campaigns)
    total_conversions = sum(c["conversions"] for c in campaigns)
    total_roas = total_value / total_cost if total_cost > 0 else 0

    result = {
        "date": yesterday,
        "campaigns": campaigns,
        "totals": {
            "cost": total_cost,
            "conv_value": total_value,
            "roas": total_roas,
            "clicks": total_clicks,
            "impressions": total_impressions,
            "conversions": total_conversions,
        },
        "budget": DAILY_BUDGET,
        "budget_utilization_pct": (total_cost / DAILY_BUDGET * 100) if DAILY_BUDGET > 0 else 0,
        "alert": total_roas < ROAS_ALERT_THRESHOLD,
    }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
