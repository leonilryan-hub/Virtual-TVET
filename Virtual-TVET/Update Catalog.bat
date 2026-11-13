@echo off
title Virtual TVET - Update Catalog
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-catalog.ps1"
echo.
echo Done. Refresh the campus page in your browser.
pause
