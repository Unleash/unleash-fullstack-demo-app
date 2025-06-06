#!/bin/bash

while true
do
  echo "▶ Running Playwright test at $(date)"
  npx playwright test e2e/chatbot.spec.ts --reporter=dot
  echo "⏳ Sleeping for 2 seconds..."
  sleep 2
done