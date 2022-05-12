#pragma once

#include "PathUtil.h"
#include <QStandardPaths>
#include <QDir>
#include "Constants.h"
#include "LogUtil.h"

namespace PathUtil
{

	QString getTempPath()
	{
		auto t = QStandardPaths::writableLocation(QStandardPaths::TempLocation);
		return t;
	}

	QString getProgramsPath()
	{
		auto t = qgetenv("PROGRAMFILES");
		return t;
	}

	QString getAppDataPath()
	{
		auto t = QStandardPaths::writableLocation(QStandardPaths::GenericDataLocation);
		return t;
	}
}