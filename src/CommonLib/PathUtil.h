#pragma once

#include <QStandardPaths>
#include <QDir>
#include "Constants.h"

namespace PathUtil
{
	QString getTempPath();
	QString getProgramsPath();
	QString getAppDataPath();
}