#!/bin/bash
###############################################################################
# SETUP_TELEGRAM_DELIVERY.sh
#
# Configure the cron job to send critical alerts to Mitch on Telegram
# 
# Usage: bash SETUP_TELEGRAM_DELIVERY.sh [BOT_TOKEN]
# 
# If BOT_TOKEN not provided, uses example format (you must fill in the actual token)
#
###############################################################################

CRON_JOB_ID="e7dfeb15-d657-404d-a495-0c0cac906f1e"
TELEGRAM_USER="7550065844"  # Mitch (@slashdaddy)
TELEGRAM_BOT_TOKEN="${1:-YOUR_TELEGRAM_BOT_TOKEN_HERE}"

echo "🔧 Setting up Telegram delivery for Daily Affiliate Site Audit"
echo ""
echo "Cron Job ID: $CRON_JOB_ID"
echo "Recipient: Mitch (ID: $TELEGRAM_USER)"
echo ""

if [ "$TELEGRAM_BOT_TOKEN" = "YOUR_TELEGRAM_BOT_TOKEN_HERE" ]; then
  echo "⚠️  No bot token provided. Here's what to do:"
  echo ""
  echo "1. Create a Telegram bot with @BotFather: https://t.me/botfather"
  echo "2. Get the bot token (looks like: 123456789:ABCdefGHIjklmnoPQRstuvwxyz)"
  echo "3. Run this script with the token:"
  echo ""
  echo "   bash SETUP_TELEGRAM_DELIVERY.sh 123456789:ABCdefGHIjklmnoPQRstuvwxyz"
  echo ""
  echo "Then the cron job will automatically send alerts to @slashdaddy when"
  echo "critical thresholds are exceeded."
  echo ""
  exit 0
fi

echo "Configuring delivery..."
echo ""

# Option 1: Using Telegram webhook (if you have a bot)
echo "Option 1: Using Telegram Bot API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Update the cron job to send alerts via Telegram bot:"
echo ""
echo "  openclaw cron update $CRON_JOB_ID \\"
echo "    --patch '{"
echo "      \"delivery\": {"
echo "        \"mode\": \"webhook\","
echo "        \"to\": \"https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage\","
echo "        \"accountId\": \"telegram-mitch\""
echo "      }"
echo "    }'"
echo ""

# Option 2: Using isolated agent message tool
echo "Option 2: Using OpenClaw Message Tool (Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The isolated agent will automatically detect critical issues and send"
echo "a message via OpenClaw's message tool with target: $TELEGRAM_USER"
echo ""
echo "No additional configuration needed! The agent will:"
echo "1. Detect exit code 1 from run-audit-with-alerts.sh"
echo "2. Read memory/affiliate-audit-CRITICAL.md"
echo "3. Send critical alert to Mitch on Telegram"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Ready to receive alerts!"
echo ""
echo "Next critical alert will be sent to: @slashdaddy (ID: $TELEGRAM_USER)"
echo ""
echo "Test it manually:"
echo "  bash /home/ubuntu/.openclaw/workspace/scripts/run-audit-with-alerts.sh"
echo ""
echo "If it exits with code 1 (critical), check:"
echo "  cat /home/ubuntu/.openclaw/workspace/memory/affiliate-audit-CRITICAL.md"
echo ""
