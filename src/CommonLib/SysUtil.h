#pragma once
#include <Windows.h>
#include <iostream>
#include <fstream>
#include "StringUtil.h"

#include <fstream>
#include <sstream>
#include <iomanip>

std::wstring GetProcessName();
long long GetPid();

void CreateDesktopShortcut(const std::wstring& appName, const std::wstring& exePath, const std::wstring& cmdLine, const std::wstring& appIcon);
std::wstring GetDesktopPath();

std::wstring getAppDataDir();

std::wstring MySelectFolder();